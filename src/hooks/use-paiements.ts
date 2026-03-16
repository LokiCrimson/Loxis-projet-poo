import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaiements, enregistrerPaiement } from '@/services/paiements.service';

export const usePaiements = (params?: Record<string, string>) =>
  useQuery({ queryKey: ['paiements', params], queryFn: () => getPaiements(params).then(r => r.data) });

export const useEnregistrerPaiement = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => enregistrerPaiement(id, data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['paiements'] }) });
};
