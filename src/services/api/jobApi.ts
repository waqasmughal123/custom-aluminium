import type { Job, CreateJobRequest, UpdateJobRequest, JobFilters, JobsApiResponse, JobProcess, JobDocument } from '../../models/job';
import type { QueryParams } from '../../utils/types/api';
import { apiClient } from './client';

export class JobApiService {
  private readonly basePath = '/api/jobs/';

  async getJobs(filters?: JobFilters & QueryParams): Promise<JobsApiResponse> {
    return await apiClient.get<JobsApiResponse>(
      this.basePath,
      { params: filters }
    );
  }

  async getJobById(id: string): Promise<Job> {
    return await apiClient.get<Job>(`${this.basePath}${id}/`);
  }

  async createJob(jobData: CreateJobRequest): Promise<Job> {
    return await apiClient.post<Job, CreateJobRequest>(
      this.basePath,
      jobData
    );
  }

  async updateJob(id: string, jobData: UpdateJobRequest): Promise<Job> {
    return await apiClient.patch<Job, UpdateJobRequest>(
      `${this.basePath}${id}/`,
      jobData
    );
  }

  async deleteJob(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.basePath}${id}/`);
  }

  // Additional job-specific methods
  async duplicateJob(id: string): Promise<Job> {
    return await apiClient.post<Job>(`${this.basePath}${id}/duplicate/`);
  }

  async getJobProcesses(jobId: string): Promise<JobProcess[]> {
    return await apiClient.get<JobProcess[]>(`${this.basePath}${jobId}/processes/`);
  }

  async getJobDocuments(jobId: string): Promise<JobDocument[]> {
    return await apiClient.get<JobDocument[]>(`${this.basePath}${jobId}/documents/`);
  }
}

// Create singleton instance
export const jobApiService = new JobApiService();
