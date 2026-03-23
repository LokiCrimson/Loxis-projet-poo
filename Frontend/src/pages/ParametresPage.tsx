import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Save, User, Bell, Shield, Building2, Loader2, Database, Plus, Trash2, Key, QrCode, 
  RefreshCw, Smartphone, Eye, EyeOff, Activity, Clock, AlertTriangle, ShieldCheck, Users, Globe, Search, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { getCategories, getTypesBien } from '@/services/biens.service';

interface AuditLog {
  id: number;
  actor_email: string; // Correspond au Backend (source='user.email')
  action: string;
  entity_name: string;
  entity_id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'ALERT';
  timestamp: string; // Correspond au Backend
  details: any;
}

export default function ParametresPage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profil');

  const toggleLanguage = () => {
    const nextLng = i18n.language.startsWith('fr') ? 'en' : 'fr';
    i18n.changeLanguage(nextLng);
  };

  // Profile form state
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telephone, setTelephone] = useState(user?.telephone || '');

  // Notifications state
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifLoyer, setNotifLoyer] = useState(true);

  // Real Estate state (Missing from previous update)
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loadingImmo, setLoadingImmo] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [newType, setNewType] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');

  // Security state
  const [showPwdDialog, setShowPwdDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{ qr_code: string; secret: string } | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [enabling2FA, setEnabling2FA] = useState(false);

  // System/Audit state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState('ALL');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        (log.actor_email?.toLowerCase().includes(auditSearch.toLowerCase()) || false) ||
        (log.entity_name?.toLowerCase().includes(auditSearch.toLowerCase()) || false) ||
        (JSON.stringify(log.details)?.toLowerCase().includes(auditSearch.toLowerCase()) || false);
      
      const matchesSeverity = auditSeverityFilter === 'ALL' || log.severity === auditSeverityFilter;
      const matchesAction = auditActionFilter === 'ALL' || log.action === auditActionFilter;

      return matchesSearch && matchesSeverity && matchesAction;
    });
  }, [auditLogs, auditSearch, auditSeverityFilter, auditActionFilter]);

  // --- Nouveaux états pour la gestion des utilisateurs (Admin) ---
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  // Fetch Audit Logs when system tab is opened
  useEffect(() => {
    if (activeTab === 'systeme') {
      fetchAuditLogs();
    }
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'immobilier' && categories.length === 0) {
      loadImmoData();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/utilisateurs/comptes/');
      setUsersList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs.', variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/utilisateurs/comptes/${userId}/`, { role: newRole });
      toast({ title: 'Rôle mis à jour', description: 'Les permissions de l\'utilisateur ont été modifiées.' });
      fetchUsers();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de modifier le rôle.', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/utilisateurs/comptes/${userId}/`);
      toast({ title: 'Utilisateur supprimé' });
      fetchUsers();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'utilisateur.', variant: 'destructive' });
    }
  };

  const loadImmoData = async () => {
    setLoadingImmo(true);
    try {
      const [catsRes, typsRes] = await Promise.all([getCategories(), getTypesBien()]);
      setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      setTypes(Array.isArray(typsRes.data) ? typsRes.data : []);
    } catch (e) {
      console.error(e);
      setCategories([]);
      setTypes([]);
    } finally {
      setLoadingImmo(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    setLoadingImmo(true);
    try {
      // URL corrigée selon le service et config/urls.py
      await api.post('/immobilier/categories-biens/', { name: newCat });
      toast({ title: 'Succès', description: 'Catégorie ajoutée.' });
      setNewCat('');
      loadImmoData();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter la catégorie.', variant: 'destructive' });
    } finally {
      setLoadingImmo(false);
    }
  };

  const handleAddType = async () => {
    if (!newType.trim() || !selectedCatId) return;
    setLoadingImmo(true);
    try {
      // URL corrigée selon le service et config/urls.py
      await api.post('/immobilier/types-biens/', { name: newType, category: selectedCatId });
      toast({ title: 'Succès', description: 'Type de bien ajouté.' });
      setNewType('');
      loadImmoData();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter le type.', variant: 'destructive' });
    } finally {
      setLoadingImmo(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      // URL corrigée : /systeme/journal-audit/ (Backend/apps/core/urls.py et config/urls.py)
      const { data } = await api.get('/systeme/journal-audit/');
      setAuditLogs(data);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Impossible de charger l\'historique système.', variant: 'destructive' });
    } finally {
      setLoadingAudit(false);
    }
  };

  // Update state when user context changes (e.g. after fresh login or update)
  useEffect(() => {
    if (user) {
      setNom(user.nom || '');
      setPrenom(user.prenom || '');
      setEmail(user.email || '');
      setTelephone(user.telephone || '');
    }
  }, [user]);

  // ... rest of state ...

  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim()) {
      toast({ title: 'Erreur', description: 'Le nom et le prénom sont obligatoires.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await api.put('/utilisateurs/me/', {
        first_name: prenom,
        last_name: nom,
        phone: telephone
      });
      
      // Update local context
      updateUser({ nom, prenom, telephone });
      
      toast({ title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées avec succès.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder les modifications.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }
    setChangingPwd(true);
    try {
      await api.put('/utilisateurs/mot-de-passe/modifier/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      toast({ title: t('success'), description: t('password_changed') });
      setShowPwdDialog(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast({ 
        title: t('error'), 
        description: e.response?.data?.detail || t('invalid_old_password'), 
        variant: 'destructive' 
      });
    } finally {
      setChangingPwd(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      const { data } = await api.post('/utilisateurs/2fa/activer/');
      setTwoFactorData(data);
    } catch (e: any) {
      toast({ title: t('error'), description: t('qr_code_error'), variant: 'destructive' });
    }
  };

  const handleConfirm2FA = async () => {
    setEnabling2FA(true);
    try {
      await api.post('/utilisateurs/2fa/confirmer/', { token: otpCode });
      toast({ title: t('2fa_enabled'), description: t('2fa_enabled_desc') });
      updateUser({ is_two_factor_enabled: true });
      setShow2FADialog(false);
      setOtpCode('');
      setTwoFactorData(null);
    } catch (e: any) {
      toast({ title: t('error'), description: t('invalid_otp'), variant: 'destructive' });
    } finally {
      setEnabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm(t('confirm_disable_2fa'))) return;
    try {
      await api.post('/utilisateurs/2fa/desactiver/');
      toast({ title: '2FA désactivé', description: 'La double authentification a été retirée.' });
      updateUser({ is_two_factor_enabled: false });
    } catch (e: any) {
      toast({ title: 'Erreur', description: 'Impossible de désactiver le 2FA.', variant: 'destructive' });
    }
  };

  const tabs = [
    { id: 'profil', label: t('profile'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'securite', label: t('security'), icon: Shield },
    { id: 'systeme', label: t('system'), icon: Database },
  ];

  if (user?.role === 'ADMIN') {
    tabs.push({ id: 'immobilier', label: t('immobilier'), icon: Building2 });
    tabs.push({ id: 'users', label: t('users'), icon: Users });
  }

  if (user?.role === 'OWNER') {
    tabs.push({ id: 'immobilier', label: t('immobilier'), icon: Building2 });
  }

  const getInitials = () => {
    if (!user) return '??';
    return (prenom?.[0] || user.prenom?.[0] || '') + (nom?.[0] || user.nom?.[0] || '');
  };

  const roleLabels = {
    'admin': t('role_admin'),
    'ADMIN': t('role_admin'),
    'OWNER': t('role_owner'),
    'proprietaire': t('role_owner'),
    'TENANT': t('role_tenant'),
    'locataire': t('role_tenant')
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tighter text-foreground">{t('settings')}</h1>
          <p className="text-muted-foreground font-medium">{t('manage_identity')}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={toggleLanguage}
          className="rounded-xl border-border hover:bg-muted font-bold px-4 h-10 flex gap-2 transition-all active:scale-95"
        >
          <Globe className="h-4 w-4 text-primary" />
          {i18n.language.startsWith('fr') ? 'English' : 'Français'}
        </Button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Nav */}
        <nav className="flex w-full shrink-0 flex-col gap-2 md:w-64">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                    : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-transparent hover:border-border"
                )}
              >
                <tab.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 rounded-[2.5rem] bg-card p-8 shadow-2xl shadow-foreground/5 border border-border min-h-[550px]">
          
          {/* PROFILE TAB */}
          {activeTab === 'profil' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-border">
                <div className="relative group">
                  <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-primary text-3xl font-black text-primary-foreground shadow-2xl shadow-primary/20 transition-transform duration-500 group-hover:rotate-6">
                    {getInitials().toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-card border-4 border-card shadow-lg flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-3xl font-black text-foreground tracking-tight leading-none">{prenom} {nom}</h2>
                  <div className="inline-flex items-center px-3 py-1 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {roleLabels[user?.role as keyof typeof roleLabels] || user?.role}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('first_name')}</Label>
                  <Input 
                    id="prenom" 
                    value={prenom} 
                    onChange={e => setPrenom(e.target.value)} 
                    className="h-12 rounded-xl border-border bg-muted/30 focus:bg-card focus:ring-primary focus:border-primary font-bold transition-all text-foreground" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('last_name')}</Label>
                  <Input 
                    id="nom" 
                    value={nom} 
                    onChange={e => setNom(e.target.value)} 
                    className="h-12 rounded-xl border-border bg-muted/30 focus:bg-card focus:ring-primary focus:border-primary font-bold transition-all text-foreground" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('email_readonly')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    disabled 
                    className="h-12 rounded-xl border-border bg-muted text-muted-foreground font-bold italic cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('phone')}</Label>
                  <Input 
                    id="telephone" 
                    value={telephone} 
                    onChange={e => setTelephone(e.target.value)} 
                    className="h-12 rounded-xl border-border bg-muted/30 focus:bg-card focus:ring-primary focus:border-primary font-bold transition-all text-foreground" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="rounded-2xl px-10 h-14 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {t('update_profile')}
                </Button>
              </div>
            </div>
          )}

          {/* IMMOBILIER TAB */}
          {activeTab === 'immobilier' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Gestion des Catégories et Types</h3>
                  <p className="text-muted-foreground">Configurez les types de biens disponibles sur la plateforme.</p>
                </div>
                {loadingImmo && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>

              <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                {/* Categories Column */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Catégories de biens</Label>
                  <p className="text-sm text-muted-foreground">Ex: Maison, Appartement, Bureau...</p>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nouvelle catégorie" 
                      value={newCat} 
                      onChange={e => setNewCat(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Button 
                      onClick={handleAddCategory} 
                      size="icon" 
                      className="shrink-0 bg-primary hover:bg-primary/90" 
                      disabled={loadingImmo || !newCat.trim()}
                    >
                      {loadingImmo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="mt-4 rounded-xl border border-divider bg-white/30 dark:bg-slate-900/30 overflow-hidden">
                    {categories.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Aucune catégorie définie.</div>
                    ) : (
                      <ul className="divide-y divide-divider">
                        {categories.map((cat) => (
                          <li key={cat.id} className="flex items-center justify-between p-3 hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <span className="font-medium">{cat.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Types Column */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Types de biens</Label>
                  <p className="text-sm text-muted-foreground">Ex: Studio, T2, Villa 4 pièces...</p>

                  <div className="space-y-2">
                    <Select value={selectedCatId} onValueChange={setSelectedCatId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Nouveau type" 
                        value={newType} 
                        onChange={e => setNewType(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddType()}
                      />
                      <Button 
                        onClick={handleAddType} 
                        size="icon" 
                        className="shrink-0 bg-primary hover:bg-primary/90" 
                        disabled={loadingImmo || !selectedCatId || !newType.trim()}
                      >
                        {loadingImmo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-divider bg-white/30 dark:bg-slate-900/30 overflow-hidden">
                    {types.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Aucun type de bien défini.</div>
                    ) : (
                      <ul className="divide-y divide-divider">
                        {types.map((type) => (
                          <li key={type.id} className="flex flex-col p-3 hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <span className="font-medium">{type.name}</span>
                            <span className="text-xs text-muted-foreground">{type.category_name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertes par Email</Label>
                    <p className="text-sm text-muted-foreground">Recevoir un récapitulatif quotidien.</p>
                  </div>
                  <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Loyers Impayés</Label>
                    <p className="text-sm text-muted-foreground">Alerte immédiate en cas de retard.</p>
                  </div>
                  <Switch checked={notifLoyer} onCheckedChange={setNotifLoyer} />
                </div>
              </div>
            </div>
          )}

          {/* SECURITE TAB */}
          {activeTab === 'securite' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              {/* Section Mot de Passe */}
              <div className="flex flex-col gap-8 pb-10 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                    <Key className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">{t('password')}</h3>
                    <p className="text-sm text-muted-foreground">{t('change_password')}</p>
                  </div>
                </div>

                <Dialog open={showPwdDialog} onOpenChange={setShowPwdDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-fit rounded-xl border-border hover:bg-muted font-bold px-6 h-12 flex gap-2 transition-colors">
                       <RefreshCw className="h-4 w-4" />{t('change_password')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-md bg-card">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black tracking-tight text-foreground">{t('change_password')}</DialogTitle>
                      <DialogDescription className="font-medium text-muted-foreground italic">{t('manage_identity')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('old_password')}</Label>
                        <div className="relative">
                          <Input 
                            type={showOldPwd ? "text" : "password"} 
                            value={oldPassword} 
                            onChange={e => setOldPassword(e.target.value)} 
                            className="h-12 rounded-xl bg-muted/50 border-border focus:bg-card font-bold pr-12 text-foreground" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPwd(!showOldPwd)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showOldPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('new_password')}</Label>
                        <div className="relative">
                          <Input 
                            type={showNewPwd ? "text" : "password"} 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            className="h-12 rounded-xl bg-muted/50 border-border focus:bg-card font-bold pr-12 text-foreground" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPwd(!showNewPwd)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showNewPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('confirm_password')}</Label>
                        <div className="relative">
                          <Input 
                            type={showConfirmPwd ? "text" : "password"} 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            className={cn(
                              "h-12 rounded-xl bg-muted/50 border-border focus:bg-card font-bold pr-12 transition-all text-foreground",
                              confirmPassword && newPassword !== confirmPassword && "border-destructive ring-destructive focus:ring-destructive"
                            )} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirmPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-[10px] font-bold text-destructive italic animate-in fade-in slide-in-from-top-1">Les mots de passe ne correspondent pas.</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter className="pt-6">
                      <Button onClick={handleChangePassword} disabled={changingPwd} className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all">
                        {changingPwd ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {t('refresh')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Section 2FA */}
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-colors",
                    user?.is_two_factor_enabled ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
                  )}>
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">{t('two_factor')}</h3>
                    <p className="text-sm text-muted-foreground italic">{t('two_factor_desc')}</p>
                  </div>
                </div>

                <div className={cn(
                  "rounded-3xl p-8 border-2 transition-all duration-500",
                  user?.is_two_factor_enabled 
                    ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 shadow-xl shadow-emerald-500/5" 
                    : "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 shadow-xl shadow-amber-500/5"
                )}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 max-w-sm">
                      <div className="flex items-center gap-2">
                        {user?.is_two_factor_enabled ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200 animate-pulse" />
                        ) : (
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        )}
                        <span className={cn("text-xs font-black uppercase tracking-widest", user?.is_two_factor_enabled ? "text-emerald-600" : "text-amber-600")}>
                          {user?.is_two_factor_enabled ? t('enabled') : t('disabled')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        {user?.is_two_factor_enabled 
                          ? "Félicitations ! Votre compte est protégé par la sécurité maximale." 
                          : "Configurez Google Authenticator sur votre smartphone pour obtenir des codes de validation."}
                      </p>
                    </div>

                    <Dialog open={show2FADialog} onOpenChange={(open) => {
                      setShow2FADialog(open);
                      if (open && !user?.is_two_factor_enabled) handleSetup2FA();
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant={user?.is_two_factor_enabled ? "ghost" : "default"}
                          onClick={user?.is_two_factor_enabled ? handleDisable2FA : undefined}
                          className={cn(
                            "rounded-2xl px-8 h-12 font-black shadow-lg transition-all active:scale-95",
                            user?.is_two_factor_enabled 
                              ? "bg-card/80 hover:bg-destructive/10 hover:text-destructive border border-emerald-200 text-emerald-700" 
                              : "bg-primary hover:bg-primary/90 text-primary-foreground"
                          )}
                        >
                          {user?.is_two_factor_enabled ? t('disable_2fa') : t('configure_2fa')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl border-none shadow-2xl p-10 max-w-md bg-white">
                        <DialogHeader className="items-center text-center">
                          <div className="mb-4 h-16 w-16 rounded-3xl bg-indigo-50 flex items-center justify-center">
                            <QrCode className="h-8 w-8 text-indigo-600" />
                          </div>
                          <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">Configurer 2FA</DialogTitle>
                          <DialogDescription className="font-bold text-slate-500">Scannez le code avec votre application Google Authenticator.</DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center gap-8 py-8">
                          {twoFactorData?.qr_code ? (
                            <div className="relative p-4 rounded-3xl border-4 border-slate-50 bg-white shadow-xl">
                               <img src={twoFactorData.qr_code} alt="2FA QR Code" className="h-48 w-48 rounded-xl object-contain" />
                            </div>
                          ) : (
                            <div className="h-48 w-48 rounded-3xl bg-slate-50 flex items-center justify-center animate-pulse">
                              <Loader2 className="h-10 w-10 text-slate-200 animate-spin" />
                            </div>
                          )}
                          
                          <div className="w-full space-y-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center block">Saisissez le code de vérification</Label>
                              <Input 
                                placeholder="000000" 
                                value={otpCode} 
                                onChange={e => setOtpCode(e.target.value)} 
                                className="h-16 rounded-2xl bg-slate-50/50 border-none text-center text-2xl font-black tracking-[0.5em] focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all shadow-inner"
                                maxLength={6}
                              />
                            </div>
                            <Button 
                              onClick={handleConfirm2FA} 
                              disabled={enabling2FA || otpCode.length < 6} 
                              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-lg shadow-xl shadow-indigo-100 transition-all"
                            >
                              {enabling2FA ? <Loader2 className="h-5 w-5 animate-spin" /> : "Vérifier et activer"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEME (AUDIT) TAB */}
          {activeTab === 'systeme' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('audit_system')}</h3>
                    <p className="text-sm font-medium text-slate-400">{t('audit_desc')} ({filteredAuditLogs.length} {t('events_count')}).</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchAuditLogs} 
                  disabled={loadingAudit}
                  className="rounded-xl border-slate-100 font-bold h-10 px-4 hover:bg-slate-50"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", loadingAudit && "animate-spin")} />
                  {t('refresh')}
                </Button>
              </div>

              {/* BARRE DE FILTRES AMÉLIORÉE */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t('search_placeholder')}
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-white border-slate-100 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <Select value={auditSeverityFilter} onValueChange={setAuditSeverityFilter}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl bg-white border-slate-100 shadow-sm font-bold text-xs uppercase tracking-widest text-slate-600">
                      <SelectValue placeholder={t('severity')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 font-bold">
                      <SelectItem value="ALL">{t('all_severities')}</SelectItem>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="WARNING">Attention</SelectItem>
                      <SelectItem value="CRITICAL">Critique</SelectItem>
                      <SelectItem value="ALERT">Alerte</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl bg-white border-slate-100 shadow-sm font-bold text-xs uppercase tracking-widest text-slate-600">
                      <SelectValue placeholder={t('action')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 font-bold">
                      <SelectItem value="ALL">{t('all_actions')}</SelectItem>
                      <SelectItem value="LOGIN">Connexion</SelectItem>
                      <SelectItem value="CREATE">Création</SelectItem>
                      <SelectItem value="UPDATE">Mise à jour</SelectItem>
                      <SelectItem value="DELETE">Suppression</SelectItem>
                      <SelectItem value="SECURITY">Sécurité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(auditSearch || auditSeverityFilter !== 'ALL' || auditActionFilter !== 'ALL') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setAuditSearch(''); setAuditSeverityFilter('ALL'); setAuditActionFilter('ALL'); }}
                    className="h-10 rounded-xl px-4 text-xs font-black uppercase text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    {t('reset')}
                  </Button>
                )}
              </div>

              {loadingAudit ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center animate-bounce">
                    <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-400 animate-pulse">Chargement des registres...</p>
                </div>
              ) : filteredAuditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/30">
                  <Database className="h-12 w-12 text-slate-200" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{t('no_logs')}</p>
                    <p className="text-sm text-slate-400 max-w-xs">{ (auditSearch || auditSeverityFilter !== 'ALL' || auditActionFilter !== 'ALL') ? t('adjust_filters') : t('traceability_msg') }</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 max-h-[600px] overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 px-8">{t('timestamp')}</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">{t('user')}</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 text-center">{t('action')}</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">{t('severity')}</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 px-8">{t('details')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAuditLogs.map((log) => (
                        <TableRow key={log.id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                          <TableCell className="py-5 px-8">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                              <Clock className="h-3.5 w-3.5 text-slate-300" />
                              {log.timestamp ? new Date(log.timestamp).toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR', {
                                day: '2-digit', month: '2-digit', year: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                              }) : (i18n.language === 'en' ? 'Unknown date' : 'Date inconnue')}
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm tracking-tight">
                                {log.actor_email || 'Système'}
                              </span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: {log.id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 text-center">
                            <Badge variant="outline" className={cn(
                              "rounded-lg border-2 px-3 py-1 font-black text-[10px] uppercase tracking-widest",
                              log.action === 'LOGIN' && "bg-blue-50 text-blue-600 border-blue-100",
                              log.action === 'CREATE' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                              log.action === 'UPDATE' && "bg-amber-50 text-amber-600 border-amber-100",
                              log.action === 'DELETE' && "bg-rose-50 text-rose-600 border-rose-100",
                              log.action === 'SECURITY' && "bg-indigo-50 text-indigo-600 border-indigo-100"
                            )}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-2">
                              {log.severity === 'CRITICAL' || log.severity === 'ALERT' ? (
                                <AlertTriangle className="h-4 w-4 text-rose-500 fill-rose-50" />
                              ) : (
                                <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                              )}
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                (log.severity === 'CRITICAL' || log.severity === 'ALERT') ? "text-rose-600" : "text-emerald-600"
                              )}>
                                {log.severity}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 px-8">
                            <div className="max-w-[300px] truncate text-xs font-bold text-slate-500 italic">
                              {log.entity_name} #{log.entity_id} - {JSON.stringify(log.details)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* UTILISATEURS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Utilisateurs</h3>
                    <p className="text-sm font-medium text-slate-400">Gérez les comptes et les accès de la plateforme.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input 
                    placeholder="Rechercher un utilisateur..." 
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                    className="h-10 rounded-xl border-slate-100 bg-slate-50/50 w-64"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchUsers} 
                    disabled={loadingUsers}
                    className="rounded-xl border-slate-100 font-bold h-10 px-4 hover:bg-slate-50"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", loadingUsers && "animate-spin")} />
                    Actualiser
                  </Button>
                </div>
              </div>

              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-400">Chargement des utilisateurs...</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 px-8">Identité</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Rôle Actuel</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 text-right px-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersList
                        .filter(u => u.email.toLowerCase().includes(searchUser.toLowerCase()) || 
                                     (u.first_name + " " + u.last_name).toLowerCase().includes(searchUser.toLowerCase()))
                        .map((u) => (
                        <TableRow key={u.id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                          <TableCell className="py-5 px-8">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                                {u.first_name?.[0] || u.email[0]}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-sm tracking-tight">{u.first_name} {u.last_name}</span>
                                <span className="text-xs text-slate-400">{u.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <Select 
                              value={u.role} 
                              onValueChange={(val) => handleUpdateUserRole(u.id, val)}
                              disabled={u.id === user?.id}
                            >
                              <SelectTrigger className="h-9 w-40 rounded-lg border-slate-100 bg-slate-50/50 font-bold text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Administrateur</SelectItem>
                                <SelectItem value="OWNER">Propriétaire</SelectItem>
                                <SelectItem value="TENANT">Locataire</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-5 text-right px-8">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.id === user?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
