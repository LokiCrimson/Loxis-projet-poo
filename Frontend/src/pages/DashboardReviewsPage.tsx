import React, { useState, useEffect } from 'react';
import { getReviews, replyToReview, PropertyReview } from '@/services/reviews.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Star, MessageSquareReply, Filter, History, Trash, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DashboardReviewsPage = () => {
    const [reviews, setReviews] = useState<PropertyReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState<number | 'all'>('all');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const data = await getReviews();
            setReviews(data);
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de charger les avis.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (id: number) => {
        if (!replyText.trim()) return;
        try {
            await api.patch(`/immobilier/avis/${id}/repondre/`, { reply: replyText });
            toast({ title: "Réponse envoyée", description: "Votre réponse a été publiée." });
            setReplyingTo(null);
            setReplyText('');
            loadReviews(); // Rafraîchir
        } catch (error) {
            toast({ title: "Erreur", description: "Échec de l'envoi.", variant: "destructive" });
        }
    };

    const filteredReviews = reviews.filter(rev => 
        filterRating === 'all' || rev.rating === filterRating
    );

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    if (loading) return <div className="p-8 text-center text-muted-foreground">Chargement des avis...</div>;

    return (
        <div className="container mx-auto p-4 lg:p-8">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Gestion des Avis</h1>
                    <p className="text-muted-foreground">Consultez et répondez aux retours de vos locataires.</p>
                </div>
                <div className="bg-primary/10 px-6 py-4 rounded-xl border border-primary/20 flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-black text-primary flex items-center gap-2">
                             {averageRating} <Star className="w-5 h-5 fill-primary text-primary" />
                        </p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Satisfaction Moyenne</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <Button variant={filterRating === 'all' ? 'default' : 'outline'} onClick={() => setFilterRating('all')} size="sm">Tous</Button>
                {[5, 4, 3, 2, 1].map((rating) => (
                    <Button 
                        key={rating} 
                        variant={filterRating === rating ? 'default' : 'outline'} 
                        onClick={() => setFilterRating(rating)} 
                        size="sm"
                        className="flex items-center gap-1"
                    >
                        {rating} <Star className="w-3 h-3" />
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredReviews.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <p className="text-muted-foreground">Aucun avis correspondant à vos critères.</p>
                    </Card>
                ) : (
                    filteredReviews.map((review) => (
                        <Card key={review.id} className={`${!review.is_approved ? 'opacity-60 border-destructive/30' : ''}`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="flex bg-yellow-400/20 px-2 py-1 rounded text-yellow-600 font-bold gap-1">
                                            {review.rating} <Star className="w-4 h-4 fill-current" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-base">{review.tenant_name}</p>
                                            <p className="text-xs text-muted-foreground">Le {format(new Date(review.created_at), 'dd MMM yyyy', { locale: fr })}</p>
                                        </div>
                                    </div>
                                    {!review.is_approved && <Badge variant="destructive">Non approuvé / Modéré</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-muted/30 p-4 rounded-lg italic">
                                    "{review.comment}"
                                </div>

                                {review.reply ? (
                                    <div className="ml-8 border-l-2 border-primary/20 pl-4 py-2 bg-primary/5 rounded-r-lg">
                                        <p className="text-xs font-bold text-primary flex items-center gap-2 mb-2">
                                            <ShieldCheck className="w-4 h-4" /> Réponse du propriétaire ({review.response_date ? format(new Date(review.response_date), 'dd/MM/yyyy') : 'N/A'})
                                        </p>
                                        <p className="text-sm">"{review.reply}"</p>
                                        <Button variant="ghost" size="sm" className="mt-2 text-[10px] h-6" onClick={() => { setReplyingTo(review.id); setReplyText(review.reply || ''); }}>
                                            Modifier la réponse
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end">
                                        {replyingTo !== review.id && (
                                            <Button variant="outline" size="sm" onClick={() => setReplyingTo(review.id)} className="gap-2">
                                                <MessageSquareReply className="w-4 h-4" /> Répondre
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {replyingTo === review.id && (
                                    <div className="mt-4 space-y-2 border p-4 rounded-lg bg-background shadow-sm">
                                        <Textarea 
                                            placeholder="Votre réponse..." 
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Annuler</Button>
                                            <Button size="sm" onClick={() => handleReply(review.id)}>Publier la réponse</Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default DashboardReviewsPage;
