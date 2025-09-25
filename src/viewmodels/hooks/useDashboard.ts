import { useQuery } from '@tanstack/react-query';
import { dashboardApiService, type DashboardOverview } from '@/services/api/dashboardApi';

/**
 * Hook to fetch dashboard overview data
 */
export function useDashboardOverview() {
  return useQuery<DashboardOverview, Error>({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApiService.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

