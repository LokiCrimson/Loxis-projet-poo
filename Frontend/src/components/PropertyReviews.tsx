import { useState } from 'react';
import { useReviews, useReplyToReview, useReportReview } from '@/hooks/use-reviews';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star, MessageSquare, Reply, User, Send, X, Loader2, Quote, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatFCFA, formatDate } from '@/lib/format';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyReviewsProps {
  propertyId: number;
}

export function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const { t } = useTranslation();
  const { data: reviews, isLoading } = useReviews(propertyId);
  const replyMut = useReplyToReview();
  const reportMut = useReportReview();
  
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [reporting, setReporting] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('INAPPROPRIATE');
  const [reportDetails, setReportDetails] = useState('');

  const handleReply = (reviewId: number) => {
    if (!replyText.trim()) return;
    replyMut.mutate({ reviewId, reply: replyText, propertyId }, {
      onSuccess: () => {
        setReplyingTo(null);
        setReplyText('');
      }
    });
  };

  const handleReport = (reviewId: number) => {
    reportMut.mutate({ reviewId, reason: reportReason, details: reportDetails, propertyId }, {
      onSuccess: () => {
        setReporting(null);
        setReportDetails('');
      }
    });
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="animate-pulse h-32 bg-slate-100/50 rounded-3xl" />
      ))}
    </div>
  );

  if (!reviews || reviews.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-b from-slate-50/50 to-white rounded-[2.5rem] border-2 border-dashed border-slate-100"
      >
        <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-slate-200" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 mb-1">{t('no_reviews_title', 'Soyez le premier !')}</h4>
        <p className="text-sm font-medium text-slate-400 max-w-[200px]">{t('no_reviews_yet', 'Aucun avis n\'a encore été laissé pour ce bien.')}</p>
      </motion.div>
    );
  }

  const averageRating = (reviews.reduce((acc: number, r: any) => acc + Number(r.rating), 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="flex items-center justify-between px-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {t('reviews', 'Avis Clients')}
            <Badge className="bg-indigo-600 text-white border-none px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-indigo-200/50">
              {reviews.length}
            </Badge>
          </h3>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-2xl shadow-sm border border-slate-50">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moyenne</p>
            <p className="text-xl font-black text-slate-900">{averageRating}<span className="text-slate-300">/5</span></p>
          </div>
          <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <Star className="h-6 w-6 fill-amber-500" />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {reviews.map((review: any, index: number) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              key={review.id}
            >
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden group">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-4 border-slate-50 shadow-inner">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg">
                            {review.tenant_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                          <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-base">{review.tenant_name || t('anonymous_tenant', 'Locataire Vérifié')}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{formatDate(review.created_at)}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex gap-1.5 bg-slate-50/50 p-3 rounded-2xl items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4 transition-all duration-300",
                              star <= review.rating ? "text-amber-500 fill-amber-500 scale-110" : "text-slate-200"
                            )}
                          />
                        ))}
                        <span className="ml-2 text-sm font-black text-slate-700">{review.rating}</span>
                      </div>
                      
                      {review.is_reported_by_me ? (
                        <Badge variant="outline" className="text-[10px] font-bold text-amber-600 border-amber-200 bg-amber-50 py-1 px-3 rounded-full flex gap-1 items-center">
                          <CheckCircle2 className="h-3 w-3" /> Signalé
                        </Badge>
                      ) : (
                        <button 
                          onClick={() => setReporting(review.id)}
                          className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors uppercase tracking-wider"
                        >
                          <AlertTriangle className="h-3 w-3" /> Signaler
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mt-8 relative">
                    <Quote className="absolute -top-4 -left-2 h-10 w-10 text-indigo-50/50 -z-0" />
                    <p className="text-lg text-slate-600 font-medium leading-relaxed relative z-10 pl-2">
                      {review.comment}
                    </p>
                  </div>

                  {/* Modale de signalement simplifiée */}
                  <AnimatePresence>
                    {reporting === review.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 p-6 bg-red-50/50 rounded-3xl border border-red-100 flex flex-col gap-4 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-black text-red-900 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> Pourquoi signalez-vous cet avis ?
                          </h5>
                          <Button variant="ghost" size="icon" onClick={() => setReporting(null)} className="h-8 w-8 rounded-full">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ['INAPPROPRIATE', 'Inapproprié'],
                            ['SPAM', 'Spam'],
                            ['HATE_SPEECH', 'Haineux'],
                            ['OTHER', 'Autre']
                          ].map(([val, lab]) => (
                            <button
                              key={val}
                              onClick={() => setReportReason(val)}
                              className={cn(
                                "py-2 px-4 rounded-xl text-xs font-bold border transition-all",
                                reportReason === val 
                                  ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200" 
                                  : "bg-white border-slate-100 text-slate-600 hover:border-red-200"
                              )}
                            >
                              {lab}
                            </button>
                          ))}
                        </div>

                        <Textarea 
                          placeholder="Détails additionnels (optionnel)" 
                          className="text-xs font-bold rounded-xl border-slate-200"
                          value={reportDetails}
                          onChange={(e) => setReportDetails(e.target.value)}
                        />

                        <div className="flex justify-end gap-2">
                          <Button 
                            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 rounded-xl h-10 shadow-lg shadow-red-200"
                            onClick={() => handleReport(review.id)}
                            disabled={reportMut.isPending}
                          >
                            {reportMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                            Envoyer le signalement
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Response Section */}
                  <AnimatePresence>
                    {review.reply ? (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-8 ml-4 md:ml-12 p-6 bg-indigo-50/50 rounded-[1.5rem] border-l-4 border-indigo-500 relative"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-indigo-600 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                            Réponse du propriétaire
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed">
                          {review.reply}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="mt-8 flex justify-end">
                        {replyingTo === review.id ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full space-y-3"
                          >
                            <Textarea 
                              autoFocus
                              placeholder="Votre réponse..." 
                              className="rounded-2xl border-2 border-slate-100 focus-visible:ring-indigo-500 min-h-[100px] font-bold text-sm"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setReplyingTo(null)}
                                className="rounded-xl font-bold text-slate-400 hover:text-slate-600"
                              >
                                {t('cancel', 'Annuler')}
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleReply(review.id)}
                                disabled={replyMut.isPending || !replyText.trim()}
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex gap-2 shadow-lg shadow-indigo-100"
                              >
                                {replyMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                {t('send_reply', 'Publier la réponse')}
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setReplyingTo(review.id);
                              setReplyText('');
                            }}
                            className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 transition-all rounded-xl py-5 px-6"
                          >
                            <Reply className="h-4 w-4" />
                            {t('reply', 'Répondre à cet avis')}
                          </Button>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper pour l'icône de vérification
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

