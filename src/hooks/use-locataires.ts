import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocataires, getLocataireById, createLocataire, updateLocataire, deleteLocataire } from '@/services/locataires.service';

export const useLocataires = (params?: Record<string, string>) =>
  useQuery({ queryKey: ['locataires', params], queryFn: () => getLocataires(params).then(r => r.data) });

export const useLocataire = (id: number) =>
  useQuery({ queryKey: ['locataires', id], queryFn: () => getLocataireById(id).then(r => r.data), enabled: !!id });

export const useCreateLocataire = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => createLocataire(data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['locataires'] }) });
};

export const useUpdateLocataire = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updateLocataire(id, data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['locataires'] }) });
};

export const useDeleteLocataire = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => deleteLocataire(id).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['locataires'] }) });
};
