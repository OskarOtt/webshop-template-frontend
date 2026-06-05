import { apiClient } from "./client";
import type { ArticleResponse, ArticleRequest } from "../generated/models";

export async function getArticles(): Promise<ArticleResponse[] | undefined> {
  const { data, error } = await apiClient.GET("/articles");
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

export async function getArticlesByCategory(categoryId: number): Promise<ArticleResponse[] | undefined> {
  const { data, error } = await apiClient.GET("/articles/category/{categoryId}", {
    params: { path: { categoryId } },
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
