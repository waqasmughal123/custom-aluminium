import { apiClient } from './client';

export interface DashboardStats {
  total_workers: number;
  active_workers: number;
  active_jobs: number;
  completed_jobs: number;
  pending_tasks: number;
  efficiency_rate: number;
  issues: number;
}

export interface RecentJob extends Record<string, unknown> {
  id: string;
  title: string;
  customer: string;
  progress: {
    status: string;
    label: string;
    color: string;
  };
  worker: string;
  date: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recent_jobs: RecentJob[];
}

class DashboardApiService {
  /**
   * Get dashboard overview data
   */
  async getOverview(): Promise<DashboardOverview> {
    return await apiClient.get<DashboardOverview>('/api/dashboard/overview/');
  }
}

export const dashboardApiService = new DashboardApiService();
