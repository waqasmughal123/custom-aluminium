import type { JobDocument, CreateJobDocument } from '../../models/job';
import { apiClient } from './client';

export class DocumentApiService {
  private readonly basePath = '/api/documents';

  // Create a new document
  async createDocument(documentData: CreateJobDocument & { job: string }): Promise<JobDocument> {
    return await apiClient.post<JobDocument, CreateJobDocument & { job: string }>(
      `${this.basePath}/`,
      documentData
    );
  }

  // Delete a document by ID (supports both S3 files and links)
  async deleteDocument(id: string): Promise<void> {
    return await apiClient.delete<void>(`${this.basePath}/${id}/`);
  }

  // Get a document by ID
  async getDocument(id: string): Promise<JobDocument> {
    return await apiClient.get<JobDocument>(`${this.basePath}/${id}/`);
  }

  // Update a document
  async updateDocument(id: string, documentData: Partial<JobDocument>): Promise<JobDocument> {
    return await apiClient.patch<JobDocument, Partial<JobDocument>>(
      `${this.basePath}/${id}/`,
      documentData
    );
  }

  // Get documents by job ID
  async getJobDocuments(jobId: string): Promise<JobDocument[]> {
    return await apiClient.get<JobDocument[]>(`${this.basePath}/`, {
      params: { job: jobId }
    });
  }
}

// Create singleton instance
export const documentApiService = new DocumentApiService();
