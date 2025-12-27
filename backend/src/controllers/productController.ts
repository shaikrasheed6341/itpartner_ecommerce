import {db} from '../db';

// Create a new product
export const createProduct = async (req: any, res: any) => {
  try {
    const { name, brand, image_url, quantity, rate } = req.body;

    // Validate required fields
    if (!name || !brand || !rate) {
      return res.status(400).json({
        success: false,
        error: 'Name, brand, and rate are required fields',
      });
    }

    // Validate rate is a positive number
    if (rate <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Rate must be a positive number',
      });
    }

    // Create product (use camelCase model field names)
    const product = await db.product.create({
      data: {
        name,
        brand,
        imageUrl: image_url || null,
        quantity: quantity || null,
        rate: parseFloat(rate),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: formatProductForApi(product),
    });

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product. Please try again.',
    });
  }
};

// Bulk create products (accepts { products: [..] } OR { count: n } to generate dummy data)
export const bulkCreateProducts = async (req: any, res: any) => {
  try {
    const { products, count = 100 } = req.body;

    const generate = (n: number) => {
      const sampleNames = [
        'Ultra SSD', 'Pro RAM', 'CCTV Camera', 'Gaming Mouse', 'Mechanical Keyboard',
        'Wireless Headset', 'Power Adapter', 'HDMI Cable', 'Motherboard', 'Graphics Card'
      ];
      const brands = ['BrandA', 'BrandB', 'Kingstone', 'CP PLUSE', 'Acme', 'GenericCo', 'TechCorp'];
      const placeholderImages = ['https://via.placeholder.com/320x240?text=Product+Image','https://picsum.photos/320/240'];
      const arr: any[] = [];
      for (let i = 0; i < n; i++) {
        arr.push({
          name: `${sampleNames[i % sampleNames.length]} ${Math.floor(Math.random() * 10000)}`,
          brand: brands[Math.floor(Math.random() * brands.length)],
          image_url: placeholderImages[i % placeholderImages.length],
          quantity: Math.floor(Math.random() * 100) + 1,
          rate: (Math.random() * 5000 + 50).toFixed(2)
        });
      }
      return arr;
    };

    const items = Array.isArray(products) && products.length > 0 ? products : generate(Math.min(count, 5000)); // cap to 5000 by default

    const result = await insertProducts(items);

    res.status(201).json({
      success: true,
      createdCount: result.created.length,
      sample: result.created.slice(0, 20).map(formatProductForApi),
      warnings: result.warnings.slice(0, 20),
      errors: result.errors.slice(0, 20),
      summary: { warningsCount: result.warnings.length, errorsCount: result.errors.length }
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ success: false, error: (error as any).message || 'Bulk insert failed' });
  }
};

// Helper: normalize and insert products sequentially with basic validation
const normalizeProductInput = (p: any) => {
  const obj: any = { ...p };

  // Normalize common image field variants
  if (obj.image_url === undefined) {
    if (obj.image !== undefined) obj.image_url = obj.image;
    else if (obj.imageurl !== undefined) obj.image_url = obj.imageurl;
    else if (obj['image-url'] !== undefined) obj.image_url = obj['image-url'];
    else if (obj.imageUrl !== undefined) obj.image_url = obj.imageUrl;
  }

  // Trim string fields
  if (typeof obj.name === 'string') obj.name = obj.name.trim();
  if (typeof obj.brand === 'string') obj.brand = obj.brand.trim();
  if (typeof obj.image_url === 'string') obj.image_url = obj.image_url.trim();
  if (typeof obj.rate === 'string') obj.rate = obj.rate.trim();
  if (typeof obj.quantity === 'string') obj.quantity = obj.quantity.trim();

  return obj;
};

// Format product for API response (maintain backward-compatible snake_case and also keep camelCase)
const formatProductForApi = (p: any) => {
  if (!p) return p;
  return { ...p, image_url: (p.imageUrl ?? p.image_url ?? null) };
};

const insertProducts = async (items: any[]) => {
  const created: any[] = [];
  const warnings: any[] = [];
  const errors: any[] = [];

  for (let index = 0; index < items.length; index++) {
    const p = items[index];
    const np = normalizeProductInput(p);

    // Basic validation
    if (!np || !np.name || !np.brand || (np.rate === undefined || np.rate === null || np.rate === '')) {
      const reason = 'Missing required field (name, brand, rate)';
      console.warn('Skipping invalid product row:', np);
      errors.push({ index, row: np, reason });
      continue;
    }

    const rateNum = typeof np.rate === 'number' ? np.rate : parseFloat(String(np.rate));
    if (isNaN(rateNum)) {
      const reason = 'Invalid rate';
      console.warn('Skipping product with invalid rate:', np);
      errors.push({ index, row: np, reason });
      continue;
    }

    try {
      console.debug('Inserting product (index):', index, 'image_url:', np.image_url);
      const createdP = await db.product.create({ data: {
        name: np.name,
        brand: np.brand,
        imageUrl: np.image_url ?? null,
        quantity: np.quantity !== undefined && np.quantity !== '' ? Number(np.quantity) : null,
        rate: rateNum
      }});
      console.debug('Inserted product result:', { id: createdP.id, imageUrl: createdP.imageUrl });

      if ((np.image_url && np.image_url.length > 0) && (createdP.imageUrl === null)) {
        const wmsg = 'image_url became null after save';
        console.warn(wmsg, { index, input: np, saved: createdP });
        warnings.push({ index, row: np, warning: wmsg, saved: { id: createdP.id, imageUrl: createdP.imageUrl } });
      }

      created.push(createdP);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error('Error inserting product row (skipping):', reason);
      errors.push({ index, row: np, reason });
    }
  }

  return { created, warnings, errors };
};

// Import products from uploaded CSV or JSON file (admin-only endpoint)
export const importProducts = async (req: any, res: any) => {
  try {
    const items: any[] = [];

    if (req.file && req.file.buffer) {
      const content = req.file.buffer.toString('utf8');
      const fileName = req.file.originalname || '';
      const mimetype = req.file.mimetype || '';

      // If JSON file
      if (mimetype === 'application/json' || fileName.toLowerCase().endsWith('.json')) {
        let parsed: any;
        try {
          parsed = JSON.parse(content);
        } catch (err) {
          return res.status(400).json({ success: false, error: 'Invalid JSON file' });
        }
        if (Array.isArray(parsed)) items.push(...parsed);
        else if (Array.isArray(parsed.products)) items.push(...parsed.products);
        else return res.status(400).json({ success: false, error: 'JSON must be an array or { products: [...] }' });

      } else {
        // Parse CSV (simple parser: header row + comma-separated)
        const lines = content.split(/\r?\n/).filter((l: string) => l.trim() !== '');
        if (lines.length < 1) return res.status(400).json({ success: false, error: 'CSV file is empty' });
        const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length === 0) continue;
          const obj: any = {};
          for (let j = 0; j < headers.length; j++) {
            const key = headers[j];
            obj[key] = (cols[j] || '').trim();
          }
          // normalize keys used by product insert
          // allow headers like name, brand, image_url, quantity, rate
          items.push(obj);
        }
      }

    } else if (Array.isArray(req.body.products) && req.body.products.length > 0) {
      items.push(...req.body.products);
    } else if (req.body.count) {
      // Let existing bulkCreateProducts generator handle counts
      return bulkCreateProducts(req, res);
    } else {
      return res.status(400).json({ success: false, error: 'No file or products provided' });
    }

    const result = await insertProducts(items);
    res.status(201).json({
      success: true,
      createdCount: result.created.length,
      sample: result.created.slice(0, 20).map(formatProductForApi),
      warnings: result.warnings.slice(0, 20),
      errors: result.errors.slice(0, 20),
      summary: { warningsCount: result.warnings.length, errorsCount: result.errors.length }
    });

  } catch (error) {
    console.error('Import products error:', error);
    res.status(500).json({ success: false, error: (error as any).message || 'Import failed' });
  }
};

// Test endpoint to check basic functionality
export const testProducts = async (req: any, res: any) => {
  try {
    console.log('🧪 Test endpoint called');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic Prisma connection
    try {
      await db.$connect();
      console.log('✅ Prisma connected successfully');
      
      // Test a simple query
      const productCount = await db.product.count();
      console.log('📦 Product count:', productCount);
      
      res.json({
        success: true,
        message: 'Test successful',
        data: {
          databaseConnected: true,
          productCount: productCount
        }
      });
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      res.json({
        success: false,
        message: 'Database connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    }
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed'
    });
  }
};

// Get all products for admin (with additional admin info)
export const getAdminProducts = async (req: any, res: any) => {
  const { limit = 50, page = 1, search } = req.query;
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * limitNum;

  try {
    console.log('🔍 getAdminProducts called');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    console.log('📋 Query params:', { limit, page, search });

    // Build where clause for search
    const whereClause: any = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    console.log('🔍 Where clause:', whereClause);

    // Try to fetch products from database
    try {
      console.log('📦 Attempting to fetch products from database...');
      const products = await db.product.findMany({
        where: whereClause,
        take: limitNum,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log('✅ Products fetched successfully:', products.length);

      const totalCount = await db.product.count({
        where: whereClause,
      });

      console.log('📊 Total count:', totalCount);

      const productsForApi = products.map(formatProductForApi);
      res.json({
        success: true,
        message: 'Products fetched successfully for admin',
        data: {
          products: productsForApi,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalCount / limitNum),
            totalCount,
            limit: limitNum,
          },
          adminInfo: {
            totalProducts: totalCount,
            fetchedAt: new Date().toISOString(),
            source: 'database'
          }
        },
      });

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      
      // Return mock data as fallback when database is not available
      console.log('🔄 Returning mock data as fallback for admin...');
      
      const mockProducts = [
        {
          id: "4e91859f-f569-435a-9066-436346b55cab",
          name: "Rem 4GB DDR4",
          brand: "Kingstone",
          image_url: "https://wxntkreyhefyjgphvauz.supabase.co/storage/v1/object/public/product/rem.avif",
          quantity: 1,
          rate: 400,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "9ecb2ef5-4789-4fd5-a218-b184680c3b5d",
          name: "CCTV 2MP",
          brand: "CP PLUSE",
          image_url: "https://wxntkreyhefyjgphvauz.supabase.co/storage/v1/object/public/product/cctv.jpg",
          quantity: 1,
          rate: 2500,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Filter mock data based on search
      let filteredProducts = mockProducts;
      if (search) {
        const searchTerm = (search).toLowerCase();
        filteredProducts = mockProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm)
        );
      }

      console.log('📦 Returning mock products for admin:', filteredProducts.length);

      res.json({
        success: true,
        message: 'Products fetched successfully for admin (mock data)',
        data: {
          products: filteredProducts,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(filteredProducts.length / limitNum),
            totalCount: filteredProducts.length,
            limit: limitNum,
          },
          adminInfo: {
            totalProducts: filteredProducts.length,
            fetchedAt: new Date().toISOString(),
            source: 'mock_data',
            note: 'Database unavailable, showing mock data'
          }
        },
      });
    }

  } catch (error) {
    console.error('❌ Error in getAdminProducts:', error);
    console.error('❌ Error details:', {
      message: (error as any).message || 'Unknown error',
      code: (error as any).code || 'Unknown code',
      stack: (error as any).stack || 'No stack trace'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products for admin',
    });
  }
};

// Get all products
export const getAllProducts = async (req: any, res: any) => {
  const { limit = 50, page = 1, search } = req.query;
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * limitNum;

  try {
    console.log('🔍 getAllProducts called');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    console.log('📋 Query params:', { limit, page, search });

    // Build where clause for search
    const whereClause: any = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    console.log('🔍 Where clause:', whereClause);

    // Try to fetch products
    console.log('📦 Attempting to fetch products from database...');
    const products = await db.product.findMany({
      where: whereClause,
      take: limitNum,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('✅ Products fetched successfully:', products.length);

    const totalCount = await db.product.count({
      where: whereClause,
    });

    console.log('📊 Total count:', totalCount);

    const productsForApi = products.map(formatProductForApi);
    res.json({
      success: true,
      data: {
        products: productsForApi,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum,
        },
      },
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code || 'Unknown code',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Return mock data as fallback when database fails
    console.log('🔄 Returning mock data as fallback...');
    
    const mockProducts = [
      {
        id: "4e91859f-f569-435a-9066-436346b55cab",
        name: "Rem 4GB DDR4",
        brand: "Kingstone",
        image_url: "https://wxntkreyhefyjgphvauz.supabase.co/storage/v1/object/public/product/rem.avif",
        quantity: 1,
        rate: 400,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "9ecb2ef5-4789-4fd5-a218-b184680c3b5d",
        name: "CCTV 2MP",
        brand: "CP PLUSE",
        image_url: "https://wxntkreyhefyjgphvauz.supabase.co/storage/v1/object/public/product/cctv.jpg",
        quantity: 1,
        rate: 2500,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Filter mock data based on search
    let filteredProducts = mockProducts;
    if (search) {
      const searchTerm = (search).toLowerCase();
      filteredProducts = mockProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
      );
    }

    console.log('📦 Returning mock products:', filteredProducts.length);

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(filteredProducts.length / limitNum),
          totalCount: filteredProducts.length,
          limit: limitNum,
        },
      },
    });
  }
};

// Get product by ID
export const getProductById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: formatProductForApi(product),
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    });
  }
};

// Update product
export const updateProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, brand, image_url, quantity, rate } = req.body;

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Validate rate if provided
    if (rate !== undefined && rate <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Rate must be a positive number',
      });
    }

    // Update product (use camelCase field names)
    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        brand: brand || existingProduct.brand,
        imageUrl: image_url !== undefined ? image_url : existingProduct.imageUrl,
        quantity: quantity !== undefined ? quantity : existingProduct.quantity,
        rate: rate !== undefined ? parseFloat(rate) : existingProduct.rate,
      },
    });

    res.json({
      success: true,
      message: 'Product updated successfully!',
      data: formatProductForApi(updatedProduct),
    });

  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product. Please try again.',
    });
  }
};

// Delete product
export const deleteProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Delete product
    await db.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully!',
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product. Please try again.',
    });
  }
};