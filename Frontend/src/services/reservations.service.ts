import api from './api';

export interface Reservation {
  id: number;
  property: number;
  property_details: any;
  tenant: number;
  tenant_email: string;
  tenant_name: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  message: string;
  created_at: string;
  updated_at: string;
}

export const getReservations = async () => {
  return api.get<Reservation[]>('/baux/reservations/');
};

export const createReservation = async (data: { property: number; message?: string }) => {
  return api.post<Reservation>('/baux/reservations/', data);
};

export const updateReservationStatus = async (id: number, status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED') => {
  return api.patch<Reservation>(`/baux/reservations/${id}/`, { status });
};

export const deleteReservation = async (id: number) => {
  return api.delete(`/baux/reservations/${id}/`);
};

export const getPublicBiens = async () => {
  // Les locataires voient tous les biens VACANT pour réserver
  return api.get('/immobilier/biens/?statut=VACANT');
};
