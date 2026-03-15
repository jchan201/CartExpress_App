import apiClient, { ApiResponse } from "./api";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  categoryId?: string;
  images: string[];
  thumbnail?: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: "cm" | "in";
  };
  isFeatured?: boolean;
  isActive?: boolean;
  tags?: string[];
  variants?: Variant[];
  specifications?: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  averageRating: number;
  totalReviews: number;
  totalSales?: number;
}

export interface Variant {
  [key: string]: any;
}

interface GetProductsParams {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}

interface GetProductsResponse {
  products: Product[];
  total?: number;
  page?: number;
  limit?: number;
}

export const productsService = {
  /**
   * Get all products with optional filtering
   */
  getProducts: async (
    params?: GetProductsParams
  ): Promise<GetProductsResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<GetProductsResponse>>(
        "/products",
        { params }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   */
  getProductById: async (productId: string): Promise<Product> => {
    try {
      const response = await apiClient.get<ApiResponse<{ product: Product}>>(`/products/${productId}`);
      return response.data.data.product;
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new product (admin only)
   */
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    try {
      const response = await apiClient.post<ApiResponse<{ product: Product }>>("/products", data);
      return response.data.data.product;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  },

  /**
   * Update a product (admin only)
   */
  updateProduct: async (
    productId: string,
    data: Partial<Product>
  ): Promise<Product> => {
    try {
      const response = await apiClient.put<ApiResponse<{ product: Product }>>(
        `/products/${productId}`,
        data
      );
      return response.data.data.product;
    } catch (error) {
      console.error(`Failed to update product ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a product (admin only)
   */
  deleteProduct: async (productId: string): Promise<void> => {
    try {
      await apiClient.delete(`/products/${productId}`);
    } catch (error) {
      console.error(`Failed to delete product ${productId}:`, error);
      throw error;
    }
  },
};
