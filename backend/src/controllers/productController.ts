import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
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
    const product = await prisma.product.create({
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

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 50, page = 1, search } = req.query;
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { name: { contains: search as string, mode: 'insensitive' as const } },
        { brand: { contains: search as string, mode: 'insensitive' as const } },
      ],
    } : {};

    const products = await prisma.product.findMany({
      where: whereClause,
      take: limitNum,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalCount = await prisma.product.count({
      where: whereClause,
    });

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
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
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
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, brand, image_url, quantity, rate } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
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
    const updatedProduct = await prisma.product.update({
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
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Delete product
    await prisma.product.delete({
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
