import { apiClient } from "./client";
import type { CheckoutResponse } from "../generated/models";

export async function createCheckout(orderId: number): Promise<CheckoutResponse | undefined> {
  const { data, error } = await apiClient.POST("/payments/checkout/{orderId}", {
    params: { path: { orderId } },
  });
  if (error) throw error;
  return data;
}
