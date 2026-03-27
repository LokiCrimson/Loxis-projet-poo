import { useState } from "react";
import { useReviews, useReplyToReview, useReportReview, useCreateReview } from "@/hooks/use-reviews";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, Reply, Send, X, Loader2, Quote, AlertTriangle, CheckCircle2, PenLine } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface PropertyReviewsProps {
  propertyId: number;
}

export function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: reviews, isLoading } = useReviews(propertyId);
  const createMut = useCreateReview();
  const replyMut = useReplyToReview();
  const reportMut = useReportReview();
  
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [reporting, setReporting] = useState<number | null>(null);
  
  const canPostReview = user?.role === "TENANT";

  const handleCreateReview = () => {
    if (!newComment.trim()) return;
    createMut.mutate({ propertyId, rating: newRating, comment: newComment }, {
      onSuccess: () => {
        setIsAddingReview(false);
        setNewComment("");
        setNewRating(5);
      }
    });
  };

  const handleReply = (reviewId: number) => {
    if (!replyText.trim()) return;
    replyMut.mutate({ reviewId, reply: replyText, propertyId }, {
      onSuccess: () => {
        setReplyingTo(null);
        setReplyText("");
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Chargement...</div>;

  const averageRating = reviews && reviews.length > 0 
    ? (reviews.reduce((acc: number, r: any) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Avis Clients ({reviews?.length || 0})</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full text-amber-700 font-bold">
            <Star className="h-4 w-4 fill-amber-500 mr-1" /> {averageRating}/5
          </div>
          {canPostReview && !reviews?.find((r: any) => r.tenant_email === user?.email) && (
            <Button onClick={() => setIsAddingReview(true)} size="sm">Laisser un avis</Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddingReview && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="p-6 border-indigo-100 bg-slate-50">
              <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} onClick={() => setNewRating(s)} className={cn("h-6 w-6 cursor-pointer", s <= newRating ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                  ))}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsAddingReview(false)}><X className="h-4 w-4" /></Button>
              </div>
              <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Votre avis..." className="mb-4 bg-white" />
              <div className="flex justify-end">
                <Button onClick={handleCreateReview} disabled={createMut.isPending}>{createMut.isPending ? "Publication..." : "Publier"}</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {reviews?.map((review: any) => (
          <Card key={review.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{review.tenant_name?.[0]}</AvatarFallback></Avatar>
                <div>
                  <p className="font-bold">{review.tenant_name || "Locataire"}</p>
                  <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200")} />)}
              </div>
            </div>
            <p className="text-slate-600 mb-4">{review.comment}</p>
            {review.reply && (
              <div className="ml-6 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                <p className="text-xs font-bold text-indigo-600 mb-1">Réponse du propriétaire :</p>
                <p className="text-sm italic">{review.reply}</p>
              </div>
            )}
            {!review.reply && user?.role === "OWNER" && (
              <div className="flex justify-end">
                {replyingTo === review.id ? (
                  <div className="w-full mt-2">
                    <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Votre réponse..." className="mb-2" />
                    <div className="flex justify-end gap-2">
                       <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Annuler</Button>
                       <Button size="sm" onClick={() => handleReply(review.id)} disabled={replyMut.isPending}>Répondre</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(review.id)}><Reply className="h-4 w-4 mr-1"/>Répondre</Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
