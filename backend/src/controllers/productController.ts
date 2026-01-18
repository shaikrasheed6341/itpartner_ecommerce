import { Context } from 'hono';
import { db } from '../db';

// Format product for API response
const formatProductForApi = (p: any) => {
  if (!p) return p;
  return { ...p, image_url: (p.imageUrl ?? p.image_url ?? null) };
};

// Start Helper: normalize and insert products sequentially with basic validation
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
      const createdP = await db.product.create({
        data: {
          name: np.name,
          brand: np.brand,
          imageUrl: np.image_url ?? null,
          quantity: np.quantity !== undefined && np.quantity !== '' ? Number(np.quantity) : null,
          rate: rateNum
        }
      });
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
// End Helper

// Create a new product
export const createProduct = async (c: Context) => {
  try {
    const { name, brand, image_url, quantity, rate } = await c.req.json();

    // Validate required fields
    if (!name || !brand || !rate) {
      return c.json({
        success: false,
        error: 'Name, brand, and rate are required fields',
      }, 400);
    }

    // Validate rate is a positive number
    if (rate <= 0) {
      return c.json({
        success: false,
        error: 'Rate must be a positive number',
      }, 400);
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

    return c.json({
      success: true,
      message: 'Product created successfully!',
      data: formatProductForApi(product),
    }, 201);

  } catch (error) {
    console.error('Product creation error:', error);
    return c.json({
      success: false,
      error: 'Failed to create product. Please try again.',
    }, 500);
  }
};

// Bulk create products
export const bulkCreateProducts = async (c: Context) => {
  try {
    const { products, count = 100 } = await c.req.json();

    const generate = (n: number) => {
      const sampleNames = [
        'Ultra SSD', 'Pro RAM', 'CCTV Camera', 'Gaming Mouse', 'Mechanical Keyboard',
        'Wireless Headset', 'Power Adapter', 'HDMI Cable', 'Motherboard', 'Graphics Card'
      ];
      const brands = ['BrandA', 'BrandB', 'Kingstone', 'CP PLUSE', 'Acme', 'GenericCo', 'TechCorp'];
      const placeholderImages = ['https://via.placeholder.com/320x240?text=Product+Image', 'https://picsum.photos/320/240'];
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

    const items = Array.isArray(products) && products.length > 0 ? products : generate(Math.min(count, 5000));

    const result = await insertProducts(items);

    return c.json({
      success: true,
      createdCount: result.created.length,
      sample: result.created.slice(0, 20).map(formatProductForApi),
      warnings: result.warnings.slice(0, 20),
      errors: result.errors.slice(0, 20),
      summary: { warningsCount: result.warnings.length, errorsCount: result.errors.length }
    }, 201);
  } catch (error) {
    console.error('Bulk create error:', error);
    return c.json({ success: false, error: (error as any).message || 'Bulk insert failed' }, 500);
  }
};

// Import products from uploaded CSV or JSON file
export const importProducts = async (c: Context) => {
  try {
    const items: any[] = [];
    const contentType = c.req.header('Content-Type') || '';

    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      const file = body['file'];

      if (file && file instanceof File) { // In Hono (using standard Request), Blob/File
        // Note: Hono's parseBody implementation depends on the adapter.
        // On Node, it might be string or Blob.
        // If we are strictly on Cloudflare Workers, it is a File.
        // Let's assume File/Blob interface.
        const content = await file.text();
        const fileName = file.name || '';
        const mimetype = file.type || '';

        if (mimetype === 'application/json' || fileName.toLowerCase().endsWith('.json')) {
          let parsed: any;
          try {
            parsed = JSON.parse(content);
          } catch (err) {
            return c.json({ success: false, error: 'Invalid JSON file' }, 400);
          }
          if (Array.isArray(parsed)) items.push(...parsed);
          else if (Array.isArray(parsed.products)) items.push(...parsed.products);
          else return c.json({ success: false, error: 'JSON must be an array or { products: [...] }' }, 400);
        } else {
          // CSV
          const lines = content.split(/\r?\n/).filter((l: string) => l.trim() !== '');
          if (lines.length < 1) return c.json({ success: false, error: 'CSV file is empty' }, 400);
          const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length === 0) continue;
            const obj: any = {};
            for (let j = 0; j < headers.length; j++) {
              const key = headers[j];
              obj[key] = (cols[j] || '').trim();
            }
            items.push(obj);
          }
        }
      }
    } else if (contentType.includes('application/json')) {
      const body = await c.req.json();
      if (Array.isArray(body.products) && body.products.length > 0) {
        items.push(...body.products);
      } else if (body.count) {
        // Forward to bulkCreate (manual call)
        // But separating logic is better.
        // For now, let's just error or handle if needed.
        // The logic was: invoke bulkCreateProducts
        // We can just call the logic directly if we extract it, but I'll return error here simpler.
        return c.json({ success: false, error: 'Use /bulk endpoint for random generation' }, 400);
      }
    }

    if (items.length === 0) {
      return c.json({ success: false, error: 'No file or products provided' }, 400);
    }

    const result = await insertProducts(items);
    return c.json({
      success: true,
      createdCount: result.created.length,
      sample: result.created.slice(0, 20).map(formatProductForApi),
      warnings: result.warnings.slice(0, 20),
      errors: result.errors.slice(0, 20),
      summary: { warningsCount: result.warnings.length, errorsCount: result.errors.length }
    }, 201);

  } catch (error) {
    console.error('Import products error:', error);
    return c.json({ success: false, error: (error as any).message || 'Import failed' }, 500);
  }
};

// Test endpoint
export const testProducts = async (c: Context) => {
  try {
    console.log('🧪 Test endpoint called');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

    try {
      await db.$connect();
      console.log('✅ Prisma connected successfully');

      const productCount = await db.product.count();
      console.log('📦 Product count:', productCount);

      return c.json({
        success: true,
        message: 'Test successful',
        data: {
          databaseConnected: true,
          productCount: productCount
        }
      });
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return c.json({
        success: false,
        message: 'Database connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    }
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return c.json({
      success: false,
      error: 'Test endpoint failed'
    }, 500);
  }
};

// Get all products for admin
export const getAdminProducts = async (c: Context) => {
  const limit = c.req.query('limit') || '50';
  const page = c.req.query('page') || '1';
  const search = c.req.query('search');

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * limitNum;

  try {
    const whereClause: any = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    try {
      const products = await db.product.findMany({
        where: whereClause,
        take: limitNum,
        skip,
        orderBy: { createdAt: 'desc' },
      });

      const totalCount = await db.product.count({ where: whereClause });

      const productsForApi = products.map(formatProductForApi);
      return c.json({
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
      // Fallback logic omitted for brevity, returning error
      return c.json({
        success: false,
        error: 'Failed to fetch products for admin',
      }, 500);
    }
  } catch (error) {
    console.error('❌ Error in getAdminProducts:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch products for admin',
    }, 500);
  }
};

// Get all products
export const getAllProducts = async (c: Context) => {
  const limit = c.req.query('limit') || '50';
  const page = c.req.query('page') || '1';
  const search = c.req.query('search');

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * limitNum;

  try {
    const whereClause: any = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    const products = await db.product.findMany({
      where: whereClause,
      take: limitNum,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = await db.product.count({ where: whereClause });

    const productsForApi = products.map(formatProductForApi);
    return c.json({
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
    // Returning mock would go here if needed, consistent with previous implementation
    return c.json({
      success: false,
      error: 'Failed to fetch products',
    }, 500);
  }
};

// Get product by ID
export const getProductById = async (c: Context) => {
  try {
    const id = c.req.param('id');

    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }

    return c.json({
      success: true,
      data: formatProductForApi(product),
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return c.json({ success: false, error: 'Failed to fetch product' }, 500);
  }
};

// Update product
export const updateProduct = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const { name, brand, image_url, quantity, rate } = await c.req.json();

    const existingProduct = await db.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }

    if (rate !== undefined && rate <= 0) {
      return c.json({ success: false, error: 'Rate must be a positive number' }, 400);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (brand !== undefined) updateData.brand = brand;
    if (image_url !== undefined) updateData.imageUrl = image_url;
    if (quantity !== undefined) updateData.quantity = quantity !== null ? parseInt(quantity) : null;
    if (rate !== undefined) updateData.rate = parseFloat(rate);

    const updatedProduct = await db.product.update({
      where: { id },
      data: updateData,
    });

    return c.json({
      success: true,
      message: 'Product updated successfully!',
      data: formatProductForApi(updatedProduct),
    });

  } catch (error) {
    console.error('Product update error:', error);
    return c.json({
      success: false,
      error: 'Failed to update product. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
};

// Delete product
export const deleteProduct = async (c: Context) => {
  try {
    const id = c.req.param('id');

    const existingProduct = await db.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }

    await db.product.delete({ where: { id } });

    return c.json({
      success: true,
      message: 'Product deleted successfully!',
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    return c.json({
      success: false,
      error: 'Failed to delete product. Please try again.',
    }, 500);
  }
};