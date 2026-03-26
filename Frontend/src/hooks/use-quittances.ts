import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuittances, envoyerQuittance, downloadQuittance, exportQuittancesCsv } from '@/services/quittances.service';

export const useQuittances = (params?: Record<string, string>) =>
  useQuery({ queryKey: ['quittances', params], queryFn: () => getQuittances(params).then(r => r.data) });

export const useEnvoyerQuittance = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => envoyerQuittance(id).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['quittances'] }) });
};

export const useDownloadQuittance = () => {
  return useMutation({
    mutationFn: (id: number) => downloadQuittance(id)
  });
};

export const useExportQuittances = () => {
  return useMutation({
    mutationFn: () => exportQuittancesCsv()
  });
};
