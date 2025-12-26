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

    // Create product
    const product = await db.product.create({
      data: {
        name,
        brand,
        image_url: image_url || null,
        quantity: quantity || null,
        rate: parseFloat(rate),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: product,
    });

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product. Please try again.',
    });
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

      res.json({
        success: true,
        message: 'Products fetched successfully for admin',
        data: {
          products,
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

    res.json({
      success: true,
      data: {
        products,
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
      data: product,
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

    // Update product
    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        brand: brand || existingProduct.brand,
        image_url: image_url !== undefined ? image_url : existingProduct.image_url,
        quantity: quantity !== undefined ? quantity : existingProduct.quantity,
        rate: rate !== undefined ? parseFloat(rate) : existingProduct.rate,
      },
    });

    res.json({
      success: true,
      message: 'Product updated successfully!',
      data: updatedProduct,
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