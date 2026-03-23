import api from './api';

export const getExpenses = async (params?: Record<string, string>) => {
  return api.get('/finances/depenses/', { params });
};

export const createExpense = async (data: Record<string, unknown>) => {
  return api.post('/finances/depenses/', data);
};

export const getExpenseCategories = async () => {
  return api.get('/finances/categories-depense/');
};

export const deleteExpense = async (id: number) => {
  return api.delete(`/finances/depenses/${id}/`);
};
