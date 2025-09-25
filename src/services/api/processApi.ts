import type { WorkshopProcess, UpdateProcessRequest } from '../../models/job';
import { apiClient } from './client';

// Bulk update request interface
export interface BulkUpdateProcessRequest {
  processes: Array<{
    id: string;
    name: string;
    process_type: 'cut' | 'weld' | 'assemble' | 'finish' | 'inspect' | 'package';
    description: string;
    is_active: boolean;
    estimated_hours?: number;
  }>;
}

export class ProcessApiService {
  private readonly basePath = '/api/processes';

  async updateProcess(id: string, processData: UpdateProcessRequest): Promise<WorkshopProcess> {
    return await apiClient.put<WorkshopProcess, UpdateProcessRequest>(
      `${this.basePath}/${id}/`,
      processData
    );
  }

  async bulkUpdateProcesses(processesData: BulkUpdateProcessRequest): Promise<WorkshopProcess[]> {
    return await apiClient.patch<WorkshopProcess[], BulkUpdateProcessRequest>(
      `${this.basePath}/bulk_update/`,
      processesData
    );
  }

  async getProcess(id: string): Promise<WorkshopProcess> {
    return await apiClient.get<WorkshopProcess>(`${this.basePath}/${id}/`);
  }

  async getProcesses(): Promise<WorkshopProcess[]> {
    return await apiClient.get<WorkshopProcess[]>(`${this.basePath}/`);
  }
}

// Create singleton instance
export const processApiService = new ProcessApiService();
