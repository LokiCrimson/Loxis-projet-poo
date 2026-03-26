import api from './api';

export interface PropertyReview {
  id: number;
  property: number;
  tenant: number;
  tenant_name: string;
  rating: number;
  comment: string;
  reply: string | null;
  is_public: boolean;
  is_approved: boolean;
  response_date: string | null;
  created_at: string;
}

export const getReviews = async (propertyId?: number) => {
  const url = propertyId ? `/immobilier/biens/${propertyId}/avis/` : '/immobilier/biens/0/avis/';
  return (await api.get<PropertyReview[]>(url)).data;
};

export const createReview = (propertyId: number, data: { rating: number; comment: string }) => 
  api.post<PropertyReview>(`/immobilier/biens/${propertyId}/avis/`, data);

export const replyToReview = (reviewId: number, reply: string) => 
  api.patch<PropertyReview>(`/immobilier/avis/${reviewId}/repondre/`, { reply });

export const reportReview = (data: { review: number; reason: string; details?: string }) => 
  api.post(`/immobilier/avis/signaler/`, data);
