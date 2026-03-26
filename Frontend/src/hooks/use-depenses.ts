import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, createExpense, getExpenseCategories, deleteExpense } from '@/services/depenses.service';

export const useExpenses = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => getExpenses(params).then(r => r.data.results || r.data),
  });
};

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => getExpenseCategories().then(r => r.data.results || r.data),
  });
};

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createExpense(data),
    onSuccess: (_resp, variables) => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['depenses'] });

      const bienId = Number(variables?.bien_id);
      if (!Number.isNaN(bienId) && bienId > 0) {
        qc.invalidateQueries({ queryKey: ['depenses', bienId] });
      }

      qc.invalidateQueries({ queryKey: ['compta-resume'] });
      qc.invalidateQueries({ queryKey: ['compta-mensuel'] });
      qc.invalidateQueries({ queryKey: ['compta-par-bien'] });
    },
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
};
