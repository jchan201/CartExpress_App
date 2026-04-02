import apiClient, { ApiResponse, dedupedApi } from "./api";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategoryId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GetCategoriesResponse {
  categories: Category[];
}

export const categoriesService = {
  getCategories: async (): Promise<GetCategoriesResponse> => {
    try {
      const response = await dedupedApi.get<ApiResponse<GetCategoriesResponse>>("/categories");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    try {
      const response = await dedupedApi.post<ApiResponse<{ category: Category }>>("/categories", data);
      return response.data.data.category;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },

  updateCategory: async (categoryId: string, data: Partial<Category>): Promise<Category> => {
    try {
      const response = await dedupedApi.put<ApiResponse<{ category: Category }>>(`/categories/${categoryId}`, data);
      return response.data.data.category;
    } catch (error) {
      console.error(`Failed to update category ${categoryId}:`, error);
      throw error;
    }
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    try {
      await dedupedApi.delete(`/categories/${categoryId}`);
    } catch (error) {
      console.error(`Failed to delete category ${categoryId}:`, error);
      throw error;
    }
  },
};
