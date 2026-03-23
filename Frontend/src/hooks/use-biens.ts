import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBiens, getBienById, createBien, updateBien, deleteBien, getDepensesByBien, getCategories, getTypesBien, getPhotosBien, deletePhotoBien } from '@/services/biens.service';

export const usePhotosBien = (bienId: number) => {
  return useQuery({
    queryKey: ['photos-bien', bienId],
    queryFn: () => getPhotosBien(bienId).then(r => r.data),
    enabled: !!bienId,
  });
};

export const useDeletePhotoBien = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, photoId }: { bienId: number; photoId: number }) => deletePhotoBien(bienId, photoId),
    onSuccess: (_, variables) => qc.invalidateQueries({ queryKey: ['photos-bien', variables.bienId] }),
  });
};

export const useBiens = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: ['biens', params],
    queryFn: () => getBiens(params).then(r => r.data.results || r.data),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories-biens'],
    queryFn: () => getCategories().then(r => r.data.results || r.data),
  });
};

export const useTypesBien = () => {
  return useQuery({
    queryKey: ['types-biens'],
    queryFn: () => getTypesBien().then(r => r.data.results || r.data),
  });
};

export const useBien = (id: number) => {
  return useQuery({
    queryKey: ['biens', id],
    queryFn: () => getBienById(id).then(r => r.data.results || r.data),
    enabled: !!id,
  });
};

export const useCreateBien = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createBien(data).then(r => r.data.results || r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['biens'] }),
  });
};

export const useUpdateBien = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updateBien(id, data).then(r => r.data.results || r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['biens'] }),
  });
};

export const useDeleteBien = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBien(id).then(r => r.data.results || r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['biens'] }),
  });
};

export const useDepensesByBien = (bienId: number) => {
  return useQuery({
    queryKey: ['depenses', bienId],
    queryFn: () => getDepensesByBien(bienId).then(r => r.data.results || r.data),
    enabled: !!bienId,
  });
};
