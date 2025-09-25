import type { Worker } from '@/models/job';
import type { QueryParams } from '../../utils/types/api';
import { ApiClient } from './client';

// Worker filters interface
export interface WorkerFilters {
  status?: string;
  role?: string;
  is_active?: string;
  search?: string;
}

// Workers API response interface
export interface WorkersApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Worker[];
}

export class WorkersApiService {
  private readonly basePath = '/api/workers/';
  
  constructor(private apiClient: ApiClient) {}

  /**
   * Get workers with pagination and filters
   */
  async getWorkers(filters?: WorkerFilters & QueryParams): Promise<WorkersApiResponse> {
    return await this.apiClient.get<WorkersApiResponse>(
      this.basePath,
      { params: filters }
    );
  }

  /**
   * Get all workers (simple list without pagination)
   */
  async getAllWorkers(): Promise<Worker[]> {
    const responseData = await this.apiClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Worker[];
    }>('/api/workers/');
    
    // The API client's get method returns the data directly, not the full response
    if (responseData && typeof responseData === 'object' && 'results' in responseData) {
      return responseData.results;
    }
    
    // Handle case where response might be an array directly
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    console.warn('WorkersApiService: Unexpected response format:', responseData);
    return [];
  }

  /**
   * Get worker by ID
   */
  async getWorkerById(id: string): Promise<Worker> {
    return await this.apiClient.get<Worker>(`${this.basePath}${id}/`);
  }

  /**
   * Create new worker
   */
  async createWorker(workerData: Omit<Worker, 'id' | 'created_at' | 'updated_at'>): Promise<Worker> {
    return await this.apiClient.post<Worker>(this.basePath, workerData);
  }

  /**
   * Update existing worker
   */
  async updateWorker(id: string, workerData: Partial<Worker>): Promise<Worker> {
    console.log('WorkersApiService.updateWorker called:', { id, workerData });
    const result = await this.apiClient.patch<Worker>(`${this.basePath}${id}/`, workerData);
    console.log('WorkersApiService.updateWorker result:', result);
    return result;
  }

  /**
   * Delete worker
   */
  async deleteWorker(id: string): Promise<void> {
    await this.apiClient.delete(`/api/workers/${id}/`);
  }
}

// Create and export service instance
const apiClient = new ApiClient();
export const workersApiService = new WorkersApiService(apiClient);
