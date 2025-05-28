// src/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query';
import { GOOGLE_APPS_SCRIPT_URL } from '@/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export async function apiRequest<T>(method: 'GET' | 'POST', data?: any): Promise<T> {
  const url = GOOGLE_APPS_SCRIPT_URL;

  const options: RequestInit = {
    method: method,
    headers: {},
  };

  if (method === 'POST') {
    options.headers!['Content-Type'] = 'application/json;charset=utf-8';
    options.body = JSON.stringify(data);
  }

  if (method === 'GET') {
    delete options.body;
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = 'API isteği başarısız oldu.';
    let errorBody: any;
    try {
      errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || `Hata kodu: ${response.status}`;
    }
    console.error("API İsteği Hatası:", {
      status: response.status,
      statusText: response.statusText,
      responseBody: errorBody || await response.text().catch(() => "Yanıt içeriği yok."),
      requestMethod: method,
      requestData: data,
    });
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json() as T;
  } else {
    console.warn("API yanıtı JSON değil, ancak başarılı oldu:", await response.text());
    return {} as T;
  }
}