import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBaux, getBailById, createBail, resilierBail } from '@/services/baux.service';

export const useBaux = (params?: Record<string, string>) =>
  useQuery({ queryKey: ['baux', params], queryFn: () => getBaux(params).then(r => r.data) });

export const useBail = (id: number) =>
  useQuery({ queryKey: ['baux', id], queryFn: () => getBailById(id).then(r => r.data), enabled: !!id });

export const useCreateBail = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => createBail(data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['baux'] }) });
};

export const useResilierBail = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => resilierBail(id, data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['baux'] }) });
};
