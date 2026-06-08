import { apiClient } from "./client";
import type { ArticleResponse, ArticleRequest } from "../generated/models";

export type ArticleStatus = NonNullable<ArticleResponse["status"]>;

export async function getArticles(status?: ArticleStatus): Promise<ArticleResponse[] | undefined> {
  const { data, error } = await apiClient.GET("/articles", {
    params: status ? { query: { status } } : {},
  });
  if (error) throw error;
  return data;
}

export async function getArticle(id: number): Promise<ArticleResponse | undefined> {
  const { data, error } = await apiClient.GET("/articles/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function getArticlesByCategory(categoryId: number, status?: ArticleStatus): Promise<ArticleResponse[] | undefined> {
  const { data, error } = await apiClient.GET("/articles/category/{categoryId}", {
    params: { path: { categoryId }, ...(status ? { query: { status } } : {}) },
  });
  if (error) throw error;
  return data;
}

export async function changeArticleStatus(id: number, status: ArticleStatus): Promise<ArticleResponse | undefined> {
  const { data, error } = await apiClient.PATCH("/articles/{id}/status", {
    params: { path: { id }, query: { status } },
  });
  if (error) throw error;
  return data;
}

export async function createArticle(body: ArticleRequest): Promise<ArticleResponse | undefined> {
  const { data, error } = await apiClient.POST("/articles", { body });
  if (error) throw error;
  return data;
}

export async function updateArticle(id: number, body: ArticleRequest): Promise<ArticleResponse | undefined> {
  const { data, error } = await apiClient.PUT("/articles/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw error;
  return data;
}

export async function deleteArticle(id: number): Promise<void> {
  const { error } = await apiClient.DELETE("/articles/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
}
