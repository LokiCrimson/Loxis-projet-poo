import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuittances, envoyerQuittance } from '@/services/quittances.service';

export const useQuittances = (params?: Record<string, string>) =>
  useQuery({ queryKey: ['quittances', params], queryFn: () => getQuittances(params).then(r => r.data) });

export const useEnvoyerQuittance = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => envoyerQuittance(id).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['quittances'] }) });
};
