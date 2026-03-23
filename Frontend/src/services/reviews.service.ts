import api from './api';

export const getReviews = (propertyId: number) => 
  api.get(`/properties/biens/${propertyId}/avis/`);

export const createReview = (propertyId: number, data: { rating: number; comment: string }) => 
  api.post(`/properties/biens/${propertyId}/avis/`, data);
