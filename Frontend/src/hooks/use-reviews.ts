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

export function useReplyToReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['replyToReview'],
    mutationFn: ({ reviewId, reply }: { reviewId: number; reply: string; propertyId: number }) =>
      reviewsService.replyToReview(reviewId, reply),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.propertyId] });
      toast({
        title: 'Réponse envoyée',
        description: 'Votre réponse a bien été publiée.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de répondre à cet avis.',
        variant: 'destructive',
      });
    },
  });
}

export function useReportReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['reportReview'],
    mutationFn: ({ reviewId, reason, details, propertyId }: { reviewId: number; reason: string; details?: string; propertyId: number }) =>
      reviewsService.reportReview({ review: reviewId, reason, details }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.propertyId] });
      toast({
        title: 'Signalement envoyé',
        description: 'Merci, nous allons examiner cet avis.',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.non_field_errors?.[0] || 'Impossible de signaler cet avis.';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}
