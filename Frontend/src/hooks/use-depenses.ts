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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['depenses'] }); // For compatibility
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
