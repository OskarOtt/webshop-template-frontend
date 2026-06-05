import { apiClient } from "./client";
import type { BrandResponse, BrandRequest } from "../generated/models";

export async function getBrands(): Promise<BrandResponse[] | undefined> {
  const { data, error } = await apiClient.GET("/brands");
  if (error) throw error;
  return data;
}

export async function getBrand(id: number): Promise<BrandResponse | undefined> {
  const { data, error } = await apiClient.GET("/brands/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function createBrand(body: BrandRequest): Promise<BrandResponse | undefined> {
  const { data, error } = await apiClient.POST("/brands", { body });
  if (error) throw error;
  return data;
}

export async function updateBrand(id: number, body: BrandRequest): Promise<BrandResponse | undefined> {
  const { data, error } = await apiClient.PUT("/brands/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw error;
  return data;
}

export async function deleteBrand(id: number): Promise<void> {
  const { error } = await apiClient.DELETE("/brands/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
}
