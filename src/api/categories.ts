import { apiClient } from "./client";
import type { CategoryResponse, CategoryRequest } from "../generated/models";

export async function getCategories(): Promise<CategoryResponse[] | undefined> {
  const { data, error } = await apiClient.GET("/categories");
  if (error) throw error;
  return data;
}

export async function getCategory(id: number): Promise<CategoryResponse | undefined> {
  const { data, error } = await apiClient.GET("/categories/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function getCategoryChildren(id: number): Promise<CategoryResponse[] | undefined> {
  const { data, error } = await apiClient.GET("/categories/{id}/children", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function createCategory(body: CategoryRequest): Promise<CategoryResponse | undefined> {
  const { data, error } = await apiClient.POST("/categories", { body });
  if (error) throw error;
  return data;
}

export async function updateCategory(id: number, body: CategoryRequest): Promise<CategoryResponse | undefined> {
  const { data, error } = await apiClient.PUT("/categories/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await apiClient.DELETE("/categories/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
}
