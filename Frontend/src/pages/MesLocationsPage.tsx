import React, { useState } from 'react';
import { 
  Building2, MapPin, Maximize2, DoorOpen, 
  Calendar, Info, MessageSquare, ArrowRight, Eye, Star,
  CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';
import { useReservations } from '@/hooks/use-reservations';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatFCFA, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

export default function MesLocationsPage() {
  const navigate = useNavigate();
  const { data: reservations, isLoading: resLoading } = useReservations();
  
  const { data: baux, isLoading: bauxLoading } = useQuery({
    queryKey: ['mon-bail-actif'],
    queryFn: () => api.get('/baux/').then(res => res.data),
  });

  const isLoading = resLoading || bauxLoading;

  if (isLoading) return <LoadingSkeleton />;

  const reservationsList = Array.isArray(reservations) ? reservations : [];
  const bauxList = Array.isArray(baux) ? baux : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Mes Locations</h1>
        <p className="text-muted-foreground font-medium">Gérez vos contrats actifs et vos demandes de réservation.</p>
      </div>

      <Tabs defaultValue="baux" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-full max-w-md gap-2">
          <TabsTrigger value="baux" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Mon Bail Actif ({bauxList.length})
          </TabsTrigger>
          <TabsTrigger value="demandes" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Mes Demandes ({reservationsList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="baux" className="space-y-6">
          {bauxList.length === 0 ? (
            <EmptyState 
              title="Aucun contrat actif" 
              description="Dès qu'un propriétaire accepte votre demande, votre bail apparaîtra ici." 
              icon={Clock} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bauxList.map((bail: any) => (
                <Card key={bail.id} className="border-none shadow-xl rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative">
                   <div className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <Badge className="bg-white/20 text-white border-none uppercase tracking-widest text-[8px] font-black">
                               Bail ACTIF
                            </Badge>
                            <h2 className="text-2xl font-black">{bail.bien_details?.reference || bail.bien_reference}</h2>
                         </div>
                         <Button size="icon" variant="ghost" className="rounded-2xl bg-white/10 hover:bg-white/20 text-white" onClick={() => navigate('/mes-paiements')}>
                            <Eye className="h-5 w-5" />
                         </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase opacity-60">Loyer mensuel</span>
                            <p className="font-black text-xl">{formatFCFA(bail.loyer_actuel)}</p>
                         </div>
                         <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase opacity-60">Depuis le</span>
                            <p className="font-black text-lg">{formatDate(bail.date_debut)}</p>
                         </div>
                      </div>
                      <Button className="w-full h-12 rounded-2xl bg-white text-indigo-600 font-black hover:bg-slate-100 transition-all gap-2" onClick={() => navigate('/mes-paiements')}>
                        <ArrowRight className="h-4 w-4" /> Voir mes loyers
                      </Button>
                   </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="demandes" className="space-y-6">
          {reservationsList.length === 0 ? (
            <EmptyState 
              title="Aucun historique de demande" 
              description="Explorez le catalogue pour trouver votre futur bien !" 
              icon={Building2} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservationsList.map((req: any) => (
                <Card key={req.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all group">
                   <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge 
                          className={cn(
                            "uppercase tracking-widest text-[8px] font-black rounded-lg py-1 px-2 border-none",
                            req.status === 'PENDING' && "bg-amber-50 text-amber-600",
                            req.status === 'ACCEPTED' && "bg-emerald-50 text-emerald-600",
                            req.status === 'REJECTED' && "bg-rose-50 text-rose-600",
                          )}
                        >
                          {req.status === 'PENDING' ? 'En attente' : req.status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-bold">{formatDate(req.created_at)}</span>
                      </div>
                      <CardTitle className="text-lg font-black text-slate-800">{req.property_details?.reference}</CardTitle>
                      <CardDescription className="flex items-center gap-1 font-medium">
                        <MapPin className="h-3 w-3" /> {req.property_details?.city}
                      </CardDescription>
                   </CardHeader>
                   <CardContent className="pt-0 space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-[11px] text-slate-500 font-medium line-clamp-2">
                        "{req.message || "Aucun message envoyé."}"
                      </div>
                   </CardContent>
                   <CardFooter>
                      <Button 
                        onClick={() => navigate('/mes-demandes')}
                        variant="secondary" 
                        className="w-full rounded-xl bg-slate-100 text-slate-600 font-bold gap-2 text-xs"
                      >
                         <MessageSquare className="h-4 w-4" /> Discussion avec propriétaire
                      </Button>
                   </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
