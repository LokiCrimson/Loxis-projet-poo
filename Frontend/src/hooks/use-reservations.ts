import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reservationsService from '@/services/reservations.service';
import { useToast } from './use-toast';

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: () => reservationsService.getReservations().then(res => res.data),
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: reservationsService.createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['biens'] });
      toast({
        title: 'Réservation envoyée',
        description: 'Votre demande a bien été transmise au propriétaire.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible d\'envoyer la réservation.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED' }) =>
      reservationsService.updateReservationStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['biens'] });
      const message = variables.status === 'ACCEPTED' ? 'Réservation acceptée' : 'Réservation mise à jour';
      toast({ title: message });
    },
  });
}

export function usePublicBiens() {
  return useQuery({
    queryKey: ['biens', 'public'],
    queryFn: () => reservationsService.getPublicBiens().then(res => res.data),
  });
}
