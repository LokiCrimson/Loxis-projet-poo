import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllAlertes, marquerAlerteLue, marquerToutesLues } from '@/services/alertes.service';

export const useAllAlertes = (params?: Record<string, string>) =>
  useQuery({ 
    queryKey: ['all-alertes', params], 
    queryFn: () => getAllAlertes(params).then(r => r.data) 
  });

export const useAlertCount = () => {
  return useQuery({
    queryKey: ['alert-count'],
    queryFn: () => getAllAlertes({ lu: 'false' }).then(r => r.data),
    select: (data) => data?.length || 0,
    staleTime: 0, // Force un rafraîchissement rapide
  });
};

export const useMarquerAlerteLue = () => {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (id: number) => marquerAlerteLue(id).then(r => r.data), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-alertes'] });
      qc.invalidateQueries({ queryKey: ['alert-count'] });
    }
  });
};

export const useMarquerToutesLues = () => {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: () => marquerToutesLues().then(r => r.data), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-alertes'] });
      qc.invalidateQueries({ queryKey: ['alert-count'] });
    }
  });
};
