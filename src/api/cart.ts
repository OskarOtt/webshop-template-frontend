import { apiClient } from "./client";
import type { CartResponse, AddToCartRequest, UpdateCartItemRequest } from "../generated/models";

export async function getCart(): Promise<CartResponse | undefined> {
  const { data, error } = await apiClient.GET("/cart");
  if (error) throw error;
  return data;
}

export async function addToCart(body: AddToCartRequest): Promise<CartResponse | undefined> {
  const { data, error } = await apiClient.POST("/cart/items", { body });
  if (error) throw error;
  return data;
}

export async function updateCartItem(articleId: number, body: UpdateCartItemRequest): Promise<CartResponse | undefined> {
  const { data, error } = await apiClient.PUT("/cart/items/{articleId}", {
    params: { path: { articleId } },
    body,
  });
  if (error) throw error;
  return data;
}

export async function removeCartItem(articleId: number): Promise<CartResponse | undefined> {
  const { data, error } = await apiClient.DELETE("/cart/items/{articleId}", {
    params: { path: { articleId } },
  });
  if (error) throw error;
  return data;
}

export async function clearCart(): Promise<CartResponse | undefined> {
  const { data, error } = await apiClient.DELETE("/cart");
  if (error) throw error;
  return data;
}
