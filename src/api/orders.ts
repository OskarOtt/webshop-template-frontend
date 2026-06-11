import { apiClient } from "./client";
import type { OrderResponse, OrderRequest } from "../generated/models";

export type OrderStatus = NonNullable<OrderResponse["status"]>;

export async function listOrders(): Promise<OrderResponse[]> {
  const { data, error } = await apiClient.GET("/orders");
  if (error) throw error;
  return (data as OrderResponse[]) ?? [];
}

export async function getOrder(id: number): Promise<OrderResponse | undefined> {
  const { data, error } = await apiClient.GET("/orders/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function placeOrder(body: OrderRequest): Promise<OrderResponse | undefined> {
  const { data, error } = await apiClient.POST("/orders", { body });
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<OrderResponse | undefined> {
  const { data, error } = await apiClient.PUT("/orders/{id}/status", {
    params: { path: { id }, query: { status } },
  });
  if (error) throw error;
  return data;
}
