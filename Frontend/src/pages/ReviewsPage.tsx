import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Trash2, Edit2, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

export interface Review {
    id: string;
    bien_nom: string;
    rating: number;
    comment: string;
    response: string | null;
    is_approved: boolean;
    created_at: string;
}

const ReviewsPage = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Pour les locataires, on récupère tous leurs avis via une route sans ID spécifique de bien
                // Le backend gère le filtrage par utilisateur connecté si property_id est 0
                const response = await api.get('/immobilier/biens/0/avis/');
                // On s'assure de récupérer la liste des avis (le backend ListAPI renvoie direct le tableau)
                setReviews(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Erreur avis", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;
        try {
            await api.delete(`/immobilier/avis/${id}/`);
            setReviews(reviews.filter(r => r.id !== id));
            toast({ title: 'Avis supprimé', description: "Votre évaluation a été retirée." });
        } catch (error) {
            toast({ title: 'Échec de suppression', variant: 'destructive', description: "Vous n'avez peut-être pas les droits nécessaires." });
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Mes Avis et Évaluations</h1>
                <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                    {reviews.length} Avis donnés
                </Badge>
            </div>

            {loading ? (
                <div className="p-12 text-center text-muted-foreground">Chargement de vos avis...</div>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                        <Card key={review.id} className="group relative border border-slate-200 hover:border-primary/40 transition-all shadow-sm">
                            <CardHeader className="pb-3 border-b flex flex-row justify-between items-start space-y-0">
                                <div>
                                    <CardTitle className="text-lg font-bold">{review.bien_nom}</CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium uppercase mt-1">
                                        Publié le {format(new Date(review.created_at), 'dd/MM/yyyy')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-primary font-bold">
                                    <Star className="w-4 h-4 fill-primary" />
                                    <span>{review.rating}/5</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <p className="italic text-slate-700 leading-relaxed font-medium">
                                    "{review.comment}"
                                </p>

                                {review.response ? (
                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2 mt-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <div className="w-4 h-[1px] bg-slate-400"></div>
                                            Réponse du propriétaire
                                        </div>
                                        <p className="text-sm text-slate-600 pl-2">
                                            {review.response}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 pl-1 italic">
                                        <Clock className="w-3 h-3" /> En attente de réponse du propriétaire
                                    </div>
                                )}

                                {!review.is_approved && (
                                    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit">
                                        <AlertCircle className="w-3 h-3" /> Note: Cet avis est en cours de modération.
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 pt-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(review.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="p-16 text-center border-2 border-dashed rounded-2xl bg-slate-50/50">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-10 text-primary" />
                    <h3 className="text-xl font-bold text-slate-800">Aucun avis publié</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2 font-medium">
                        Vous pourrez laisser un avis sur vos logements une fois vos contrats de location terminés.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReviewsPage;
