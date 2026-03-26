import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  CheckCheck, 
  Check, 
  Filter, 
  Trash2, 
  Calendar, 
  Search,
  FileText,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useAllAlertes, useMarquerAlerteLue, useMarquerToutesLues } from '@/hooks/use-alertes';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function AlertesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [luFilter, setLuFilter] = useState('tous');

  const alertConfig: Record<string, { border: string; icon: any; iconColor: string; label: string; bgColor: string; badgeColor: string }> = {
    UNPAID_RENT: { border: 'border-rose-500', icon: AlertTriangle, iconColor: 'text-rose-600', label: t('unpaid_rent'), bgColor: 'bg-rose-50', badgeColor: 'bg-rose-100' },
    LEASE_END: { border: 'border-amber-500', icon: Clock, iconColor: 'text-amber-600', label: t('lease_end'), bgColor: 'bg-amber-50', badgeColor: 'bg-amber-100' },
    RENT_REVISION: { border: 'border-indigo-500', icon: RefreshCw, iconColor: 'text-indigo-600', label: t('rent_revision'), bgColor: 'bg-indigo-50', badgeColor: 'bg-indigo-100' },
    RECEIPT_READY: { border: 'border-emerald-500', icon: FileText, iconColor: 'text-emerald-600', label: t('receipt_ready'), bgColor: 'bg-emerald-50', badgeColor: 'bg-emerald-100' },
    SUSPICIOUS_ACTIVITY: { border: 'border-rose-600', icon: Shield, iconColor: 'text-rose-700', label: t('suspicious_activity'), bgColor: 'bg-rose-50', badgeColor: 'bg-rose-100' },
  };

  const params: Record<string, string> = {};
  if (typeFilter !== 'tous') params.alert_type = typeFilter;
  if (luFilter === 'non_lues') params.lu = 'false';
  if (luFilter === 'lues') params.lu = 'true';

  const { data: alertes, isLoading, refetch } = useAllAlertes(params);
  const marquerLueMut = useMarquerAlerteLue();
  const marquerToutesMut = useMarquerToutesLues();

  const filteredAlertes = (alertes || []).filter(a => {
    const searchLower = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(searchLower) ||
      a.message?.toLowerCase().includes(searchLower) ||
      a.bien_reference?.toLowerCase().includes(searchLower)
    );
  });

  const handleMarquerLue = async (id: number) => {
    await marquerLueMut.mutateAsync(id);
    refetch();
  };

  const handleMarquerToutesLues = async () => {
    await marquerToutesMut.mutateAsync();
    refetch();
  };

  const nonLues = (Array.isArray(alertes) ? alertes : []).filter(a => !a.is_read).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-200 relative group overflow-hidden transition-transform hover:scale-105 duration-500">
            <Bell className="h-7 w-7 group-hover:rotate-12 transition-transform" />
            {nonLues > 0 && (
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black border-4 border-white dark:border-slate-900 animate-bounce">
                {nonLues}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('alerts_center')}</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{t('manage_critical_alerts')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {nonLues > 0 && (
            <Button 
              className="rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black px-6 h-12 shadow-xl shadow-indigo-100 transition-all duration-300 gap-2 overflow-hidden relative group"
              onClick={handleMarquerToutesLues} 
              disabled={marquerToutesMut.isPending}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <CheckCheck className="h-5 w-5 relative z-10" />
              <span className="relative z-10">{t('mark_all_read')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm flex flex-wrap items-center gap-4 border-none mx-2">
        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[240px]">
           <Filter className="h-4 w-4 text-indigo-500" />
           <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val)}>
             <SelectTrigger className="bg-transparent border-none focus:ring-0 font-black text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest p-0 h-auto">
               <SelectValue placeholder={t('alert_type')} />
             </SelectTrigger>
             <SelectContent className="rounded-[1.5rem] shadow-2xl border-none bg-white dark:bg-slate-900 p-2">
               <SelectItem value="tous" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">{t('all_types')}</SelectItem>
               <SelectItem value="UNPAID_RENT" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">{t('unpaid_rent')}</SelectItem>
               <SelectItem value="LEASE_END" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">{t('lease_end')}</SelectItem>
               <SelectItem value="RENT_REVISION" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">{t('rent_revision')}</SelectItem>
               <SelectItem value="LEASE_CREATED" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">{t('lease_created')}</SelectItem>
               <SelectItem value="PROPERTY_VACANT" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">{t('property_vacant')}</SelectItem>
             </SelectContent>
           </Select>
        </div>

        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[200px]">
           <Search className="h-4 w-4 text-indigo-500" />
           <Input 
             placeholder={t('search_dots')} 
             className="bg-transparent border-none focus-visible:ring-0 font-black text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest p-0 h-auto w-full placeholder:text-slate-400"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4 px-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <LoadingSkeleton key={i} lines={3} />)
        ) : !Array.isArray(filteredAlertes) || filteredAlertes.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <Check className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('no_alerts_found')}</h3>
            <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">{t('adjust_filters_search')}</p>
          </div>
        ) : (
          filteredAlertes.map((alerte, idx) => {
            const config = alertConfig[alerte.alert_type as keyof typeof alertConfig] || { 
              border: 'border-slate-200', 
              icon: Bell, 
              iconColor: 'text-slate-400', 
              label: t('notification'),
              bgColor: 'bg-slate-50',
              badgeColor: 'bg-slate-100'
            };
            return (
              <Card
                key={alerte.id}
                className={cn(
                  'group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900',
                  !alerte.is_read ? 'ring-2 ring-indigo-500/20' : 'opacity-85'
                )}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch min-h-[140px]">
                    {/* Color Indicator */}
                    <div className={cn("w-2.5 group-hover:w-4 transition-all duration-500", config.border.replace('border-', 'bg-'))} />
                    
                    <div className="flex-1 p-8 flex items-center gap-8">
                      {/* Icon */}
                      <div className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] shadow-sm group-hover:scale-110 transition-transform duration-500', config.bgColor)}>
                        <config.icon className={cn('h-8 w-8', alerte.is_read ? 'text-slate-400' : config.iconColor)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={cn('text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none shadow-sm', config.badgeColor, config.iconColor)}>
                            {config.label}
                          </Badge>
                          {!alerte.is_read && (
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                          )}
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-auto">
                            <Calendar className="h-3 w-3" /> {formatDate(alerte.created_at)}
                          </span>
                        </div>
                        
                        <h4 className={cn("text-lg font-black tracking-tight mb-1", alerte.is_read ? "text-slate-500" : "text-slate-900 dark:text-white")}>
                          {alerte.title || config.label}
                        </h4>
                        <p className="text-sm font-bold text-slate-400 italic">
                          {alerte.message}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {(() => {
                           // Déterminer le lien de redirection
                           let link = "";
                           if (alerte.related_entity_type === 'Property' && alerte.related_entity_id) {
                             link = `/biens/${alerte.related_entity_id}`;
                           } else if (alerte.related_entity_type === 'Lease' && alerte.related_entity_id) {
                             link = `/baux/${alerte.related_entity_id}`;
                           } else if (alerte.related_entity_type === 'RentPayment' && alerte.related_entity_id && alerte.metadata?.lease_id) {
                             link = `/baux/${alerte.metadata.lease_id}`;
                           }
                           
                           if (!link) return null;
                           
                           return (
                             <Link to={link}>
                               <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-none bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                                 <ChevronRight className="h-5 w-5" />
                               </Button>
                             </Link>
                           )
                        })()}

                        {!alerte.is_read ? (
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-12 w-12 rounded-2xl border-none bg-slate-50 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            onClick={() => handleMarquerLue(alerte.id)}
                            title={t('mark_read')}
                          >
                            <Check className="h-5 w-5" />
                          </Button>
                        ) : (
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300">
                             <CheckCheck className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
