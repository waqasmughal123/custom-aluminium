import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import type { ApiError, RequestOptions, QueryParams } from '../../utils/types/api';

// Extend NextAuth Session type to include accessToken
interface SessionWithToken extends Session {
  accessToken?: string;
  user?: {
    email?: string;
    name?: string;
    id?: string;
  };
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        console.log('🔍 [API Client] Request interceptor triggered for:', config.url);
        
        // Try to get token from stored auth token first
        let token = this.authToken;
        console.log('🔍 [API Client] Cached token exists:', !!token);
        
        // If no stored token, try to get from NextAuth session
        if (!token) {
          console.log('🔍 [API Client] No cached token, fetching from session...');
          try {
            const session = await getSession() as SessionWithToken;
            console.log('🔍 [API Client] Session retrieved:', {
              exists: !!session,
              hasUser: !!session?.user,
              hasAccessToken: !!session?.accessToken,
              accessTokenPreview: session?.accessToken ? `${session.accessToken.substring(0, 20)}...` : 'none'
            });
            
              if (session?.accessToken) {
              token = session.accessToken;
              this.authToken = token; // Cache it
              console.log('✅ [API Client] Token retrieved and cached from session');
            } else {
              console.warn('❌ [API Client] No accessToken found in session');
              console.log('🔍 [API Client] Full session object:', session);
            }
          } catch (error) {
            console.error('❌ [API Client] Failed to get session for API request:', error);
          }
        } else {
          console.log('✅ [API Client] Using cached token');
        }
        
        // Add authorization header if token exists
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ [API Client] Authorization header added for:', config.url);
          console.log('🔍 [API Client] Token preview:', `${token.substring(0, 20)}...`);
        } else {
          console.warn('⚠️ [API Client] No token available for request:', config.url);
          console.log('🔍 [API Client] Request headers:', config.headers);
        }
        
        return config;
      },
      (error: AxiosError) => Promise.reject(this.handleError(error))
    );

    // Response interceptor for error handling and token refresh
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        console.error('❌ [API Client] API Error:', {
          url: originalRequest.url,
          method: originalRequest.method?.toUpperCase(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          hasAuthHeader: !!originalRequest.headers?.Authorization,
          authHeaderPreview: originalRequest.headers?.Authorization ? 
            `${(originalRequest.headers.Authorization as string).substring(0, 30)}...` : 'none',
          responseData: error.response?.data
        });

        // Handle 401 Unauthorized errors - immediately logout user
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          console.warn('🚨 [API Client] 401 Unauthorized error - logging out user');
          console.log('🔍 [API Client] Request details:', {
            url: originalRequest.url,
            method: originalRequest.method,
            headers: originalRequest.headers,
            hadToken: !!this.authToken,
            tokenPreview: this.authToken ? `${this.authToken.substring(0, 20)}...` : 'none'
          });
          
          // Clear auth token immediately
          this.clearAuthToken();
          
          // Process any queued requests with error
          this.processQueue(new Error('Authentication failed - user logged out'));
          
          // Logout user and redirect to login
          this.logout().catch(console.error);
          
          return Promise.reject(this.handleError(error));
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: unknown): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  private handleError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
    };

    // Handle different status codes
    if (error.response?.status === 401) {
      apiError.message = 'Your session has expired. Please log in again.';
    } else if (error.response?.status === 403) {
      apiError.message = 'You do not have permission to perform this action.';
    } else if (error.response?.status === 404) {
      apiError.message = 'The requested resource was not found.';
    } else if (error.response?.status === 500) {
      apiError.message = 'Internal server error. Please try again later.';
    }

    if (error.response?.data) {
      const responseData = error.response.data as Record<string, unknown>;
      
      // Handle Django REST Framework error format
      if (typeof responseData.detail === 'string') {
        apiError.message = responseData.detail;
      } else if (typeof responseData.message === 'string') {
        apiError.message = responseData.message;
      } else if (typeof responseData.error === 'string') {
        apiError.message = responseData.error;
      }
      
      if (typeof responseData.code === 'string' || typeof responseData.code === 'number') {
        apiError.code = responseData.code;
      }
      
      // Handle field-specific errors from Django
      if (responseData.details && typeof responseData.details === 'object') {
        apiError.details = responseData.details as Record<string, string[]>;
      } else if (typeof responseData === 'object' && Object.keys(responseData).length > 0) {
        // Convert Django field errors to our format
        const fieldErrors: Record<string, string[]> = {};
        Object.entries(responseData).forEach(([key, value]) => {
          if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
            fieldErrors[key] = value;
          } else if (typeof value === 'string') {
            fieldErrors[key] = [value];
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          apiError.details = fieldErrors;
        }
      }
    } else if (error.message) {
      apiError.message = error.message;
    }

    return apiError;
  }

  public setAuthToken(token: string): void {
    console.log('🔑 [API Client] Setting auth token:', `${token.substring(0, 20)}...`);
    this.authToken = token;
  }

  public clearAuthToken(): void {
    console.log('🗑️ [API Client] Clearing auth token');
    this.authToken = null;
  }

  public getAuthToken(): string | null {
    console.log('🔍 [API Client] Getting auth token:', !!this.authToken ? `${this.authToken.substring(0, 20)}...` : 'none');
    return this.authToken;
  }

  public isAuthenticated(): boolean {
    const authenticated = !!this.authToken;
    console.log('🔒 [API Client] Is authenticated:', authenticated);
    return authenticated;
  }

  // Initialize auth token from session
  public async initializeAuth(): Promise<void> {
    console.log('🚀 [API Client] Initializing auth from session...');
    try {
      const session = await getSession() as SessionWithToken;
      console.log('🔍 [API Client] Session during initialization:', {
        exists: !!session,
        hasUser: !!session?.user,
        hasAccessToken: !!session?.accessToken,
        userEmail: session?.user?.email,
        accessTokenPreview: session?.accessToken ? `${session.accessToken.substring(0, 20)}...` : 'none'
      });
      
      if (session?.accessToken) {
        this.authToken = session.accessToken;
        console.log('✅ [API Client] Auth token initialized from session');
      } else {
        console.warn('❌ [API Client] No accessToken found during initialization');
      }
    } catch (error) {
      console.error('❌ [API Client] Failed to initialize auth from session:', error);
    }
  }

  // Logout method that clears token and redirects
  public async logout(): Promise<void> {
    this.clearAuthToken();
    
    // If using NextAuth, sign out
    if (typeof window !== 'undefined') {
      try {
        const { signOut } = await import('next-auth/react');
        await signOut({ callbackUrl: '/login' });
      } catch (error) {
        console.error('Error during logout:', error);
        // Fallback: direct redirect if NextAuth fails
        window.location.href = '/login';
      }
    }
  }

  private buildURL(endpoint: string, params?: QueryParams): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }

  public async get<T>(
    endpoint: string, 
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      timeout: options?.timeout,
    };

    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  public async post<T, D = unknown>(
    endpoint: string,
    data?: D,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      timeout: options?.timeout,
    };

    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T, D = unknown>(
    endpoint: string,
    data?: D,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      timeout: options?.timeout,
    };

    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T, D = unknown>(
    endpoint: string,
    data?: D,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      timeout: options?.timeout,
    };

    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      timeout: options?.timeout,
    };

    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
}

// Create singleton instance
console.log('🏗️ [API Client] Creating singleton instance');
export const apiClient = new ApiClient(); 

// Initialize auth on client side
if (typeof window !== 'undefined') {
  console.log('🌐 [API Client] Client-side detected, initializing auth...');
  apiClient.initializeAuth().catch((error) => {
    console.error('❌ [API Client] Failed to initialize auth on startup:', error);
  });
} else {
  console.log('🖥️ [API Client] Server-side detected, skipping auth initialization');
} 