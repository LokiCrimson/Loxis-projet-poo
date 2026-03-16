import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRevenueChart, getAlertes, getBienStatuts } from '@/services/dashboard.service';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats().then(r => r.data),
  });
};

export const useRevenueChart = () => {
  return useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => getRevenueChart().then(r => r.data),
  });
};

export const useAlertes = () => {
  return useQuery({
    queryKey: ['alertes'],
    queryFn: () => getAlertes().then(r => r.data),
  });
};

export const useBienStatuts = () => {
  return useQuery({
    queryKey: ['bien-statuts'],
    queryFn: () => getBienStatuts().then(r => r.data),
  });
};
