import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pencil, Plus, Building2, MapPin, Maximize2, DoorOpen, Tag, Thermometer, ShieldCheck, Zap, Droplets, User, Calendar, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { BienFormModal } from '@/components/BienFormModal';
import { useState } from 'react';
import { useBien, useDepensesByBien, usePhotosBien } from '@/hooks/use-biens';
import { formatFCFA, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useBaux } from '@/hooks/use-baux';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ExpenseFormModal } from '@/components/ExpenseFormModal';
import { BailFormModal } from '@/components/BailFormModal';
import { PropertyFurniture } from '@/components/PropertyFurniture';
import { PropertyReviews } from '@/components/PropertyReviews';
import { useUpdateReservationStatus } from '@/hooks/use-reservations';

const gradients = [
  'from-indigo-600/20 to-blue-600/20',
  'from-emerald-600/20 to-teal-600/20',
  'from-amber-600/20 to-orange-600/20',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function BienDetailPage() {
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isBailOpen, setIsBailOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const bienId = Number(id);
  const { data: bien, isLoading } = useBien(bienId);
  const { data: photos = [] } = usePhotosBien(bienId);
  const { data: depenses } = useDepensesByBien(bienId);
  const { data: baux = [] } = useBaux({ statut: 'actif', bien_id: bienId.toString() });
  const updateStatus = useUpdateReservationStatus();

  const { data: furnitures = [] } = useQuery({
    queryKey: ['furniture', bienId],
    queryFn: () => api.get(`/immobilier/biens/${bienId}/meubles/`).then(res => res.data),
    enabled: !!bienId,
  });

  const activeBaux = baux.filter((b: any) => b.bien_id === bienId && b.statut === 'actif');

  if (isLoading) {
    return <div className="space-y-4"><LoadingSkeleton lines={2} /><LoadingSkeleton type="card" /><LoadingSkeleton type="card" /></div>;
  }

  if (!bien) {
    return <EmptyState title="Bien non trouvé" description="Ce bien n'existe pas ou a été supprimé." />;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Breadcrumb & Header */}
      <div className="space-y-4 px-2">
        <motion.div variants={itemVariants} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link to="/biens" className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Mes Biens
          </Link>
          <span className="opacity-30">/</span>
          <span className="text-slate-900 dark:text-white">{bien.reference}</span>
        </motion.div>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {bien.name || bien.address}
              </h1>
              <StatusBadge status={bien.status} />
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <MapPin className="h-3.5 w-3.5 text-indigo-500" />
              {bien.reference} · {bien.name ? `${bien.address}, ` : ""}{((bien.city || bien.ville || "") || bien.ville || "")}
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditOpen(true)}
              className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-md h-12 px-6 font-black flex gap-2 text-slate-900 dark:text-white"
            >
              <Pencil className="h-4 w-4 text-indigo-500" /> Modifier
            </Button>
            <Button 
              onClick={() => setIsBailOpen(true)}
              className="rounded-2xl shadow-lg shadow-indigo-500/20 h-12 px-6 font-black flex gap-2 bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-transform"
            >
              <Plus className="h-4 w-4" /> Nouveau Bail
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Hero Visual Section */}
      <motion.div variants={itemVariants} className="px-2">
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 relative group">
          {photos && photos.length > 0 ? (
            <Carousel 
              className="w-full"
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {photos.map((p: any) => (
                  <CarouselItem key={p.id}>
                    <div className="relative h-[450px] w-full overflow-hidden">
                      <img 
                        src={p.image} 
                        alt={`Photo ${p.id}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />
                      {p.is_main && (
                        <div className="absolute top-6 left-6 bg-indigo-500 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                          VEDETTE
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {photos.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                  <CarouselPrevious className="relative left-0 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md h-12 w-12 rounded-2xl" />
                  <CarouselNext className="relative right-0 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md h-12 w-12 rounded-2xl" />
                </div>
              )}
            </Carousel>
          ) : (
            <div className={cn('h-[450px] w-full bg-gradient-to-br flex flex-col items-center justify-center gap-6 text-white', gradients[bienId % gradients.length])}>
               <div className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/10 animate-pulse">
                <Building2 className="h-20 w-20 opacity-40" />
               </div>
               <span className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Aucun visuel disponible</span>
            </div>
          )}

          {/* 3D Visual overlay */}
          {bien.tour_3d_url && (
            <div className="absolute top-6 right-6 z-10">
              <Button 
                asChild 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md rounded-2xl px-6 h-12 gap-2 shadow-2xl transition-all"
              >
                <a href={bien.tour_3d_url} target="_blank" rel="noopener noreferrer">
                  <Maximize2 className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Vision 3D</span>
                </a>
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 px-2">
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-8">
          {/* Quick Stats Card */}
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-indigo-600 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-500">
              <Zap className="h-40 w-40" />
            </div>
            <h3 className="text-xl font-black tracking-tight mb-8 relative z-10 italic">Performance de l'unité</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center group/item">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Loyer Mensuel</span>
                <span className="text-2xl font-black">{formatFCFA(Number(bien.base_rent_hc || 0))}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Charges Fixes</span>
                <span className="text-xl font-black">{formatFCFA(Number(bien.base_charges || 0))}</span>
              </div>
            </div>
            <div className="mt-10 pt-10 border-t border-white/10 flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-xl">Rentabilité Optimale</span>
            </div>
          </Card>

          {/* Characteristics Card */}
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8">
            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-[11px] opacity-40">Spécifications</h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Maximize2, label: 'Surface', value: `${((bien.surface_area || bien.surface || 0) || bien.surface || 0)} m²` },
                { icon: DoorOpen, label: 'Pièces', value: ((bien.rooms_count || bien.nombre_pieces || 1) || bien.nombre_pieces || 1) },
                { icon: Tag, label: 'Catégorie', value: (bien.category_name || bien.category || '' ) },
                { icon: Thermometer, label: 'Type', value: (bien.type || bien.property_type || '') },
              ].map((item, i) => (
                <div key={i} className="space-y-1 group transition-all">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <item.icon className="h-3.5 w-3.5 text-indigo-500 transition-transform group-hover:scale-110" />
                    {item.label}
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Content Tabs (Right side) - Takes 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-2 overflow-hidden h-full">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="p-6">
                <TabsList className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl h-14 w-full justify-start gap-2 border-none">
                  <TabsTrigger value="overview" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Aperçu Général</TabsTrigger>
                  {(bien.active_lease || (bien.pending_reservations && bien.pending_reservations.length > 0)) && (
                    <TabsTrigger value="occupants" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Occupants & Résas</TabsTrigger>
                  )}
                  {(furnitures && furnitures.length > 0) && (
                    <TabsTrigger value="furniture" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Mobilier</TabsTrigger>
                  )}
                  <TabsTrigger value="history" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Historique</TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Avis</TabsTrigger>
                </TabsList>
              </div>

              <div className="px-8 pb-8 flex-1 overflow-y-auto min-h-[400px]">
                <AnimatePresence mode="wait">
                  <TabsContent key="overview" value="overview" className="mt-0 focus-visible:outline-none">
                    <motion.div 
                      key="overview-content"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      {bien.description && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description du bien</h4>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">{bien.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Plus className="h-3.5 w-3.5 text-blue-500" /> Baux
                          </h4>
                          {activeBaux.length > 0 ? (
                            <div className="space-y-4">
                              {activeBaux.map((bail: any) => (
                                <div key={bail.id} className="flex justify-between items-center group/bail transition-all">
                                  <div>
                                    <div className="text-sm font-black text-slate-900 dark:text-white">{bail.locataire_nom || bail.locataire || 'Locataire'}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{formatDate(bail.date_debut)}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-black text-indigo-500">{formatFCFA(bail.loyer)}</div>
                                    <StatusBadge status={bail.statut} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-slate-500 italic">Aucun bail actif</div>
                          )}
                        </div>
                        
                        <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              <Zap className="h-3.5 w-3.5 text-orange-500" /> Dernières Dépenses
                            </h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setIsExpenseOpen(true)}
                              className="h-6 w-6 p-0 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          {depenses && depenses.length > 0 ? (
                            <div className="space-y-4">
                              {depenses.slice(0, 3).map((dep: any) => (
                                <div key={dep.id} className="flex justify-between items-center">
                                  <div>
                                    <div className="text-sm font-black text-slate-800 dark:text-white">{dep.libelle}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(dep.date_depense || dep.date)}</div>
                                  </div>
                                  <div className="text-sm font-black text-rose-500">-{formatFCFA(dep.montant)}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-slate-500 italic">Aucune dépense enregistrée</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="occupants" value="occupants" className="mt-0 focus-visible:outline-none">
                    <motion.div 
                      key="occupants-content"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      {bien.active_lease && (
                        <div className="space-y-6">
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-3">
                            <User className="h-4 w-4" /> Locataire en place
                          </h4>
                          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800/40 dark:to-slate-900 border border-indigo-100/50 dark:border-slate-800 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                              <div className="h-20 w-20 rounded-[1.8rem] bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border border-indigo-100 dark:border-slate-700">
                                <User className="h-10 w-10 text-indigo-600" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{bien.active_lease.locataire_name}</div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Zap className="h-3.5 w-3.5 text-indigo-400" /> {bien.active_lease.locataire_email}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Entrée
                                  </div>
                                  <div className="text-sm font-black text-slate-900 dark:text-white">{formatDate(bien.active_lease.date_debut)}</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" /> Statut
                                  </div>
                                  <div className="text-sm font-black text-emerald-500 uppercase tracking-tight">VIGUEUR</div>
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                              <Building2 className="h-40 w-40" />
                            </div>
                          </div>
                        </div>
                      )}

                      {bien.pending_reservations && bien.pending_reservations.length > 0 && (
                        <div className="space-y-6">
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-3">
                            <Clock className="h-4 w-4" /> Réservations en attente
                          </h4>
                          <div className="grid gap-4">
                            {bien.pending_reservations.map((resa: any) => (
                              <div key={resa.id} className="group p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                  <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-amber-600">
                                      <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                      <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{resa.tenant_name}</div>
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{resa.tenant_email}</div>
                                      <div className="text-[10px] font-black text-slate-400 uppercase mt-1">Demandé le {formatDate(resa.created_at)}</div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap md:justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-xl border-emerald-100 hover:bg-emerald-50 text-emerald-600 font-bold"
                                      onClick={() => updateStatus.mutate({ id: resa.id, status: 'ACCEPTED' })}
                                      disabled={updateStatus.isPending || bien.status === 'RESERVED'}
                                    >
                                      <Check className="h-3.5 w-3.5 mr-1" />
                                      Accepter
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-xl border-rose-100 hover:bg-rose-50 text-rose-600 font-bold"
                                      onClick={() => updateStatus.mutate({ id: resa.id, status: 'REJECTED' })}
                                      disabled={updateStatus.isPending}
                                    >
                                      <X className="h-3.5 w-3.5 mr-1" />
                                      Refuser
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold"
                                      onClick={() => setIsBailOpen(true)}
                                      disabled={resa.status !== 'ACCEPTED'}
                                    >
                                      <Plus className="h-3.5 w-3.5 mr-1" />
                                      Créer le Bail
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="furniture" className="mt-0 focus-visible:outline-none">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <PropertyFurniture propertyId={bienId} />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="history" value="history" className="mt-0 focus-visible:outline-none">
                    <motion.div 
                      key="history-content"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="py-10 text-center"
                    >
                      <div className="inline-flex p-6 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                        <Building2 className="h-8 w-8 text-slate-300" />
                      </div>
                      <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Historique vide</h5>
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-tight">Aucun événement majeur répertorié pour ce bien.</p>
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="reviews" value="reviews" className="mt-0 focus-visible:outline-none">
                    <motion.div 
                      key="reviews-content"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <PropertyReviews propertyId={bienId} />
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <BienFormModal open={isEditOpen} onOpenChange={setIsEditOpen} bienId={bienId} />
      <BailFormModal open={isBailOpen} onOpenChange={setIsBailOpen} initialBienId={bienId} />
      <ExpenseFormModal open={isExpenseOpen} onOpenChange={setIsExpenseOpen} bienId={bienId} />
    </motion.div>
  );
};

export default BienDetailPage;

