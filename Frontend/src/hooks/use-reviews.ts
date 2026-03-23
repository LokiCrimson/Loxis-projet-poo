import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reviewsService from '@/services/reviews.service';
import { useToast } from './use-toast';

export function useReviews(propertyId: number) {
  return useQuery({
    queryKey: ['reviews', propertyId],
    queryFn: () => reviewsService.getReviews(propertyId).then(res => res.data),
    enabled: !!propertyId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['createReview'],
    mutationFn: ({ propertyId, rating, comment }: { propertyId: number; rating: number; comment: string }) =>
      reviewsService.createReview(propertyId, { rating, comment }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['biens'] });
      toast({
        title: 'Avis envoyé',
        description: 'Votre commentaire a bien été publié.',
      });
    },
    onError: (error: any) => {
        const errorData = error.response?.data;
        const errorMessage = typeof errorData === 'object' && errorData.non_field_errors 
            ? errorData.non_field_errors[0] 
            : "Impossible de publier l'avis.";
            
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}
