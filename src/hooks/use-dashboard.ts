import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRevenueChart, getAlertes, getBienStatuts } from '@/services/dashboard.service';
import { useAuth } from '@/contexts/AuthContext';

const useOwnerId = () => {
  const { user } = useAuth();
  // Admin sees everything (no filter), proprietaire sees only their data
  return user?.role === 'proprietaire' ? user.id : undefined;
};

export const useDashboardStats = () => {
  const ownerId = useOwnerId();
  return useQuery({
    queryKey: ['dashboard-stats', ownerId],
    queryFn: () => getDashboardStats(ownerId).then(r => r.data),
  });
};

export const useRevenueChart = () => {
  const ownerId = useOwnerId();
  return useQuery({
    queryKey: ['revenue-chart', ownerId],
    queryFn: () => getRevenueChart(ownerId).then(r => r.data),
  });
};

export const useAlertes = () => {
  const ownerId = useOwnerId();
  return useQuery({
    queryKey: ['alertes', ownerId],
    queryFn: () => getAlertes(undefined, ownerId).then(r => r.data),
  });
};

export const useBienStatuts = () => {
  const ownerId = useOwnerId();
  return useQuery({
    queryKey: ['bien-statuts', ownerId],
    queryFn: () => getBienStatuts(ownerId).then(r => r.data),
  });
};
