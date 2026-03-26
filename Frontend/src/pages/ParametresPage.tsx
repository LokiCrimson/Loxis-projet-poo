import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Save, User, Bell, Shield, Building2, Loader2, Database, Plus, Trash2, Key, QrCode, 
  RefreshCw, Smartphone, Eye, EyeOff, Activity, Clock, AlertTriangle, ShieldCheck, Users, Globe, Search, ChevronRight, Download
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
  actor_email: string;
  actor_display?: string;
  action: string;
  action_label?: string;
  entity_name: string;
  entity_label?: string;
  entity_display?: string;
  entity_id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'ALERT';
  severity_label?: string;
  source_app?: string;
  request_id?: string;
  timestamp: string;
  timezone?: string;
  ip_address?: string;
  session_key?: string;
  user_agent?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  changed_fields?: string[];
  message_lisible?: string;
  categorie_null_reason?: string;
  context_summary?: string;
  has_details?: boolean;
  technical_metadata?: Record<string, unknown>;
  details: any;
}

interface AuditPolicy {
  immutability_rule?: {
    mode?: string;
    update?: string;
    delete?: string;
    storage_recommendation?: string;
  };
  retention_policy?: {
    hot_storage_days?: number;
    cold_archive_days?: number;
    recommended_purge?: string;
  };
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
  const [auditUserFilter, setAuditUserFilter] = useState('ALL');
  const [auditDateFrom, setAuditDateFrom] = useState('');
  const [auditDateTo, setAuditDateTo] = useState('');
  const [exportingAudit, setExportingAudit] = useState(false);
  const [auditPolicy, setAuditPolicy] = useState<AuditPolicy | null>(null);
  const [auditDetailOpen, setAuditDetailOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  const filteredAuditLogs = useMemo(() => {
    const seen = new Set<string>();
    const deduped: AuditLog[] = [];

    for (const log of auditLogs) {
      const signature = [
        log.actor_email || '',
        log.timestamp || '',
        log.action || '',
        log.entity_name || '',
        log.entity_id || '',
        JSON.stringify(log.old_values || {}),
        JSON.stringify(log.new_values || {}),
      ].join('|');

      if (!seen.has(signature)) {
        seen.add(signature);
        deduped.push(log);
      }
    }

    return deduped;
  }, [auditLogs]);

  const auditUsers = useMemo(() => {
    return Array.from(
      new Set(
        auditLogs
          .map((log) => log.actor_email)
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [auditLogs]);

  // --- Nouveaux états pour la gestion des utilisateurs (Admin) ---
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [showUserPwdDialog, setShowUserPwdDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adminUserPassword, setAdminUserPassword] = useState('');

  // Fetch Audit Logs when system tab is opened
  useEffect(() => {
    if (activeTab === 'systeme') {
      fetchAuditLogs();
      fetchAuditPolicy();
    }
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'immobilier' && categories.length === 0) {
      loadImmoData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'systeme') return;
    const timeout = setTimeout(() => {
      fetchAuditLogs();
    }, 350);
    return () => clearTimeout(timeout);
  }, [activeTab, auditSearch, auditSeverityFilter, auditActionFilter, auditUserFilter, auditDateFrom, auditDateTo]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/utilisateurs/comptes/');
      setUsersList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/utilisateurs/comptes/${userId}/`, { role: newRole });
      toast({ title: t('role_updated'), description: t('permissions_modified') });
      fetchUsers();
    } catch (e) {
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
    }
  };

  const handleUpdatePasswordByAdmin = async () => {
    if (!selectedUser || !adminUserPassword.trim()) return;
    try {
      await api.patch(`/utilisateurs/comptes/${selectedUser.id}/`, { password: adminUserPassword });
      toast({ title: t('password_changed'), description: t('password_reset_success', { name: selectedUser.first_name }) });
      setShowUserPwdDialog(false);
      setAdminUserPassword('');
      setSelectedUser(null);
    } catch (e) {
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm(t('delete_user_confirm'))) return;
    try {
      await api.delete(`/utilisateurs/comptes/${userId}/`);
      toast({ title: t('success') });
      fetchUsers();
    } catch (e) {
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
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
      toast({ title: t('success'), description: t('category_added') });
      setNewCat('');
      loadImmoData();
    } catch (e) {
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
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
      toast({ title: t('success'), description: t('type_added') });
      setNewType('');
      loadImmoData();
    } catch (e) {
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
    } finally {
      setLoadingImmo(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const params: Record<string, string> = {};
      if (auditSearch.trim()) params.search = auditSearch.trim();
      if (auditSeverityFilter !== 'ALL') params.severity = auditSeverityFilter;
      if (auditActionFilter !== 'ALL') params.action = auditActionFilter;
      if (auditUserFilter !== 'ALL') params.user_email = auditUserFilter;
      if (auditDateFrom) params.date_from = auditDateFrom;
      if (auditDateTo) params.date_to = auditDateTo;

      const { data } = await api.get('/systeme/journal-audit/', { params });
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchAuditPolicy = async () => {
    try {
      const { data } = await api.get('/systeme/journal-audit/politique/');
      setAuditPolicy(data || null);
    } catch {
      setAuditPolicy(null);
    }
  };

  const exportAudit = async (format: 'csv' | 'json') => {
    setExportingAudit(true);
    try {
      const params: Record<string, string> = { export_format: format };
      if (auditSearch.trim()) params.search = auditSearch.trim();
      if (auditSeverityFilter !== 'ALL') params.severity = auditSeverityFilter;
      if (auditActionFilter !== 'ALL') params.action = auditActionFilter;
      if (auditUserFilter !== 'ALL') params.user_email = auditUserFilter;
      if (auditDateFrom) params.date_from = auditDateFrom;
      if (auditDateTo) params.date_to = auditDateTo;

      const response = await api.get('/systeme/journal-audit/export/', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `audit-loxis.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: t('error'), description: 'Export audit impossible', variant: 'destructive' });
    } finally {
      setExportingAudit(false);
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
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
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
      
      toast({ title: t('success'), description: t('save_success') });
    } catch (e: any) {
      console.error(e);
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
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
      toast({ title: t('2fa_disabled'), description: t('2fa_disabled_desc') });
      updateUser({ is_two_factor_enabled: false });
    } catch (e: any) {
      toast({ title: t('error'), description: t('error'), variant: 'destructive' });
    }
  };

  const tabs = [
    { id: 'profil', label: t('profile'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'securite', label: t('security'), icon: Shield },
  ];

  if (user?.role === 'ADMIN') {
    tabs.push({ id: 'systeme', label: t('system'), icon: Database });
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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('settings')}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('manage_identity')}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={toggleLanguage}
          className="rounded-[1.2rem] border-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-md font-bold px-6 h-12 flex gap-3 transition-all active:scale-95 text-slate-900 dark:text-white"
        >
          <Globe className="h-5 w-5 text-indigo-500" />
          {i18n.language.startsWith('fr') ? 'English' : 'Français'}
        </Button>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row px-2">
        {/* Sidebar Nav */}
        <nav className="flex w-full shrink-0 flex-col gap-3 lg:w-72">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-4 rounded-[1.8rem] px-6 py-5 text-sm font-black transition-all duration-500 text-left group",
                  isActive
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-200 dark:shadow-none scale-[1.02]"
                    : "bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm hover:shadow-md border border-transparent"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-2xl transition-colors duration-500",
                  isActive ? "bg-white/10" : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                )}>
                  <tab.icon className="h-5 w-5" />
                </div>
                <span className="flex-1 tracking-tight">{tab.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 lg:p-12 shadow-sm border-none min-h-[600px] transition-all duration-500">
          
          {/* PROFILE TAB */}
          {activeTab === 'profil' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              <div className="flex flex-col sm:flex-row items-center gap-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                <div className="relative group">
                  <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-slate-900 text-3xl font-black text-white shadow-2xl shadow-slate-200 dark:shadow-none transition-transform duration-700 group-hover:rotate-6">
                    {getInitials().toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{prenom} {nom}</h2>
                  <Badge className="rounded-full px-5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-none">
                    {roleLabels[user?.role as keyof typeof roleLabels] || user?.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="prenom" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('first_name')}</Label>
                  <Input 
                    id="prenom" 
                    value={prenom} 
                    onChange={e => setPrenom(e.target.value)} 
                    className="h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 font-bold transition-all text-slate-900 dark:text-white text-base" 
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="nom" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('last_name')}</Label>
                  <Input 
                    id="nom" 
                    value={nom} 
                    onChange={e => setNom(e.target.value)} 
                    className="h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 font-bold transition-all text-slate-900 dark:text-white text-base" 
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('email_readonly')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    disabled 
                    className="h-14 rounded-2xl border-none bg-slate-100 dark:bg-slate-800/50 text-slate-400 font-bold italic cursor-not-allowed opacity-70" 
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="telephone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('phone')}</Label>
                  <Input 
                    id="telephone" 
                    value={telephone} 
                    onChange={e => setTelephone(e.target.value)} 
                    className="h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 font-bold transition-all text-slate-900 dark:text-white text-base" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-10">
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="rounded-2xl px-12 h-16 gap-3 bg-slate-900 hover:bg-slate-800 text-white font-black shadow-2xl shadow-slate-200 dark:shadow-none transition-all hover:-translate-y-1 active:scale-95 text-lg"
                >
                  {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
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
                  <h3 className="text-xl font-bold">{t('manage_categories_types')}</h3>
                  <p className="text-muted-foreground">{t('configure_asset_types')}</p>
                </div>
                {loadingImmo && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>

              <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                {/* Categories Column */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">{t('asset_categories')}</Label>
                  <p className="text-sm text-muted-foreground">{t('asset_categories_desc')}</p>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder={t('new_category')} 
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
                      <div className="p-4 text-center text-sm text-muted-foreground">{t('no_category')}</div>
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
                  <Label className="text-lg font-semibold">{t('asset_types')}</Label>
                  <p className="text-sm text-muted-foreground">{t('asset_types_desc')}</p>

                  <div className="space-y-2">
                    <Select value={selectedCatId} onValueChange={(val) => setSelectedCatId(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('choose_category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Input 
                        placeholder={t('new_type')} 
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
                      <div className="p-4 text-center text-sm text-muted-foreground">{t('no_type')}</div>
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
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                  <Bell className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('notif_preferences')}</h3>
                  <p className="text-sm font-medium text-slate-400">{t('notif_preferences_desc')}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                  <div className="space-y-1">
                    <Label className="text-base font-bold text-slate-900 dark:text-white capitalize leading-none">{t('daily_summary')}</Label>
                    <p className="text-sm font-medium text-slate-400">{t('daily_summary_desc')}</p>
                  </div>
                  <Switch checked={notifEmail} onCheckedChange={setNotifEmail} className="data-[state=checked]:bg-indigo-600" />
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                  <div className="space-y-1">
                    <Label className="text-base font-bold text-slate-900 dark:text-white capitalize leading-none">{t('rent_alerts')}</Label>
                    <p className="text-sm font-medium text-slate-400">{t('rent_alerts_desc')}</p>
                  </div>
                  <Switch checked={notifLoyer} onCheckedChange={setNotifLoyer} className="data-[state=checked]:bg-indigo-600" />
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                  <div className="space-y-1">
                    <Label className="text-base font-bold text-slate-900 dark:text-white capitalize leading-none">{t('maintenance_updates')}</Label>
                    <p className="text-sm font-medium text-slate-400">{t('maintenance_updates_desc')}</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                   onClick={() => toast({ title: t('save_success') })}
                   className="rounded-2xl px-10 h-14 gap-3 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-black shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                >
                  {t('save')}
                </Button>
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
                      <DialogDescription className="font-medium text-muted-foreground italic"> {t('manage_identity')} </DialogDescription>
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
                          <p className="text-[10px] font-bold text-destructive italic animate-in fade-in slide-in-from-top-1">{t('passwords_dont_match')}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter className="pt-6">
                      <Button onClick={handleChangePassword} disabled={changingPwd} className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all">
                        {changingPwd ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {t('update_profile')}
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
                          {user?.is_two_factor_enabled ? t('enabled', 'Activé') : t('disabled', 'Désactivé')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        {user?.is_two_factor_enabled 
                          ? t('congrats_2fa', 'votre compte est securisé par la double authentification') 
                          : t('setup_2fa_instruction', 'Activez la double authentification pour renforcer la sécurité de votre compte.')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {user?.is_two_factor_enabled ? (
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm(t('confirm_disable_2fa', 'Êtes-vous sûr de vouloir désactiver la double authentification ?'))) {
                              handleDisable2FA();
                            }
                          }}
                          className="rounded-2xl px-6 h-12 font-black shadow-lg shadow-rose-100 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Smartphone className="h-4 w-4" />
                          {t('disable_2fa', 'Désactiver')}
                        </Button>
                      ) : (
                        <Dialog open={show2FADialog} onOpenChange={(open) => {
                          setShow2FADialog(open);
                          if (open && !user?.is_two_factor_enabled) handleSetup2FA();
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              className="rounded-2xl px-8 h-12 font-black shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95"
                            >
                              {t('configure_2fa', 'Configurer')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-3xl border-none shadow-2xl p-10 max-w-md bg-white">
                            <DialogHeader className="items-center text-center">
                              <div className="mb-4 h-16 w-16 rounded-3xl bg-indigo-50 flex items-center justify-center">
                                <QrCode className="h-8 w-8 text-indigo-600" />
                              </div>
                              <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">{t('configure_2fa', 'Sécuriser mon compte')}</DialogTitle>
                              <DialogDescription className="font-bold text-slate-500">
                                {t('scan_qr_code', 'Scannez ce code avec Google Authenticator ou une application similaire.')}
                              </DialogDescription>
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
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center block">{t('enter_verification_code', 'Code de vérification')}</Label>
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
                                  {enabling2FA ? <Loader2 className="h-5 w-5 animate-spin" /> : t('verify_and_activate', 'Activer maintenant')}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportAudit('csv')}
                    disabled={exportingAudit}
                    className="rounded-xl border-slate-100 font-bold h-10 px-4 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportAudit('json')}
                    disabled={exportingAudit}
                    className="rounded-xl border-slate-100 font-bold h-10 px-4 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
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
              </div>

              <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                  <div className="relative xl:col-span-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Recherche plein texte (IP, entité, message, request-id...)"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="pl-10 h-10 rounded-xl bg-white border-slate-100 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div className="xl:col-span-2">
                    <Select value={auditSeverityFilter} onValueChange={(val) => setAuditSeverityFilter(val)}>
                      <SelectTrigger className="h-10 w-full rounded-xl bg-white border-slate-100 shadow-sm font-bold text-xs uppercase tracking-widest text-slate-600">
                        <SelectValue placeholder={t('severity')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 font-bold">
                        <SelectItem value="ALL">{t('all_severities')}</SelectItem>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="WARNING">Attention</SelectItem>
                        <SelectItem value="CRITICAL">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="xl:col-span-2">
                    <Select value={auditActionFilter} onValueChange={(val) => setAuditActionFilter(val)}>
                      <SelectTrigger className="h-10 w-full rounded-xl bg-white border-slate-100 shadow-sm font-bold text-xs uppercase tracking-widest text-slate-600">
                        <SelectValue placeholder={t('action')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 font-bold">
                        <SelectItem value="ALL">{t('all_actions')}</SelectItem>
                        <SelectItem value="LOGIN">Connexion</SelectItem>
                        <SelectItem value="LOGOUT">Déconnexion</SelectItem>
                        <SelectItem value="CREATE">Création</SelectItem>
                        <SelectItem value="UPDATE">Mise à jour</SelectItem>
                        <SelectItem value="DELETE">Suppression</SelectItem>
                        <SelectItem value="PAYMENT">Paiement</SelectItem>
                        <SelectItem value="ALERT">Alerte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="xl:col-span-2">
                    <Select value={auditUserFilter} onValueChange={(val) => setAuditUserFilter(val)}>
                      <SelectTrigger className="h-10 w-full rounded-xl bg-white border-slate-100 shadow-sm font-bold text-xs text-slate-600">
                        <SelectValue placeholder="Utilisateur" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 font-bold">
                        <SelectItem value="ALL">Tous les utilisateurs</SelectItem>
                        {auditUsers.map((email) => (
                          <SelectItem key={email} value={email}>{email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <Input
                      type="date"
                      value={auditDateFrom}
                      onChange={(e) => setAuditDateFrom(e.target.value)}
                      className="h-10 rounded-xl bg-white border-slate-100 shadow-sm w-full sm:w-[170px]"
                    />
                    <Input
                      type="date"
                      value={auditDateTo}
                      onChange={(e) => setAuditDateTo(e.target.value)}
                      className="h-10 rounded-xl bg-white border-slate-100 shadow-sm w-full sm:w-[170px]"
                    />
                  </div>

                  {(auditSearch || auditSeverityFilter !== 'ALL' || auditActionFilter !== 'ALL' || auditUserFilter !== 'ALL' || auditDateFrom || auditDateTo) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAuditSearch('');
                        setAuditSeverityFilter('ALL');
                        setAuditActionFilter('ALL');
                        setAuditUserFilter('ALL');
                        setAuditDateFrom('');
                        setAuditDateTo('');
                      }}
                      className="h-10 rounded-xl px-4 text-xs font-black uppercase text-rose-500 hover:bg-rose-50 hover:text-rose-600 self-start md:self-auto"
                    >
                      {t('reset')}
                    </Button>
                  )}
                </div>
              </div>

              {auditPolicy && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900">
                  <p className="font-bold">Politique d'audit (immutabilité et rétention)</p>
                  <p>
                    Immutabilité: {auditPolicy.immutability_rule?.mode || 'append_only'} | update: {auditPolicy.immutability_rule?.update || 'forbidden'} | delete: {auditPolicy.immutability_rule?.delete || 'forbidden'}
                  </p>
                  <p>
                    Rétention: stockage chaud {auditPolicy.retention_policy?.hot_storage_days || 365} jours, archive froide {auditPolicy.retention_policy?.cold_archive_days || 1825} jours.
                  </p>
                </div>
              )}

              {loadingAudit ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center animate-bounce">
                    <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-400 animate-pulse">{t('loading_logs')}</p>
                </div>
              ) : filteredAuditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/30">
                  <Database className="h-12 w-12 text-slate-200" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{t('no_logs')}</p>
                    <p className="text-sm text-slate-400 max-w-xs">{ (auditSearch || auditSeverityFilter !== 'ALL' || auditActionFilter !== 'ALL' || auditUserFilter !== 'ALL' || auditDateFrom || auditDateTo) ? t('adjust_filters') : t('traceability_msg') }</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto overflow-y-auto rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 max-h-[650px] custom-scrollbar">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 px-4">Horodatage</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Utilisateur</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Action</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Entité</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Message</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Niveau</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Contexte</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 pr-4 text-right">Détails</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAuditLogs.map((log) => (
                        <TableRow key={log.id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                          <TableCell className="py-4 px-4 align-top">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs whitespace-nowrap">
                              <Clock className="h-3.5 w-3.5 text-slate-300" />
                              {log.timestamp ? new Date(log.timestamp).toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR', {
                                day: '2-digit', month: '2-digit', year: '2-digit',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              }) : t('unknown_date')}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">{log.timezone || 'UTC'}</div>
                          </TableCell>

                          <TableCell className="py-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-xs tracking-tight whitespace-nowrap">
                                {log.actor_display || log.actor_email || t('system_label')}
                              </span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">#{log.id} {log.source_app ? `• ${log.source_app}` : ''}</span>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 align-top">
                            <Badge variant="outline" className={cn(
                              "rounded-lg border-2 px-3 py-1 font-black text-[10px] uppercase tracking-widest",
                              log.action === 'LOGIN' && "bg-blue-50 text-blue-600 border-blue-100",
                              log.action === 'CREATE' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                              log.action === 'UPDATE' && "bg-amber-50 text-amber-600 border-amber-100",
                              log.action === 'DELETE' && "bg-rose-50 text-rose-600 border-rose-100",
                              log.action === 'ALERT' && "bg-indigo-50 text-indigo-600 border-indigo-100"
                            )}>
                              {log.action_label || log.action}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4 align-top text-xs font-bold text-slate-700 min-w-[220px]">{log.entity_display || log.entity_label || log.entity_name}</TableCell>

                          <TableCell className="py-4 align-top min-w-[320px]">
                            <div className="text-xs font-medium text-slate-700 leading-relaxed">
                              {log.message_lisible || '-'}
                              {log.categorie_null_reason && (
                                <div className="mt-1 text-[10px] text-amber-700">Catégorie absente: {log.categorie_null_reason}</div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="py-4 align-top">
                            <div className="flex items-center gap-2">
                              {log.severity === 'CRITICAL' ? (
                                <AlertTriangle className="h-4 w-4 text-rose-500 fill-rose-50" />
                              ) : (
                                <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                              )}
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                log.severity === 'CRITICAL' ? "text-rose-600" : "text-emerald-600"
                              )}>
                                {log.severity_label || log.severity}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 align-top min-w-[230px]">
                            <div className="text-[11px] text-slate-500 break-words leading-relaxed">
                              {log.context_summary || `App: ${log.source_app || 'core'}`}
                            </div>
                          </TableCell>

                          <TableCell className="py-4 pr-4 align-top text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!log.has_details}
                              className="h-8 rounded-lg border-slate-100 text-xs"
                              onClick={() => {
                                setSelectedAuditLog(log);
                                setAuditDetailOpen(true);
                              }}
                            >
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Dialog open={auditDetailOpen} onOpenChange={setAuditDetailOpen}>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-3xl bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight text-foreground">Détails de l'événement d'audit</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Vue technique complète pour investigation.
                    </DialogDescription>
                  </DialogHeader>

                  {selectedAuditLog && (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3"><span className="font-bold">Utilisateur:</span> {selectedAuditLog.actor_display || selectedAuditLog.actor_email || 'Système'}</div>
                        <div className="rounded-xl bg-slate-50 p-3"><span className="font-bold">Action:</span> {selectedAuditLog.action_label || selectedAuditLog.action}</div>
                        <div className="rounded-xl bg-slate-50 p-3"><span className="font-bold">Entité:</span> {selectedAuditLog.entity_display || selectedAuditLog.entity_label || selectedAuditLog.entity_name}</div>
                        <div className="rounded-xl bg-slate-50 p-3"><span className="font-bold">Sévérité:</span> {selectedAuditLog.severity_label || selectedAuditLog.severity}</div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Champs modifiés</Label>
                        <div className="rounded-xl bg-slate-50 p-3 text-slate-700">
                          {(selectedAuditLog.changed_fields || []).join(', ') || 'Aucun champ calculé'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Ancienne valeur</Label>
                          <pre className="rounded-xl bg-slate-50 p-3 text-[11px] whitespace-pre-wrap break-words max-h-52 overflow-auto">{JSON.stringify(selectedAuditLog.old_values || {}, null, 2)}</pre>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Nouvelle valeur</Label>
                          <pre className="rounded-xl bg-slate-50 p-3 text-[11px] whitespace-pre-wrap break-words max-h-52 overflow-auto">{JSON.stringify(selectedAuditLog.new_values || {}, null, 2)}</pre>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Métadonnées techniques</Label>
                        <pre className="rounded-xl bg-slate-50 p-3 text-[11px] whitespace-pre-wrap break-words max-h-52 overflow-auto">{JSON.stringify(selectedAuditLog.technical_metadata || {}, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
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
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('users')}</h3>
                    <p className="text-sm font-medium text-slate-400">{t('manage_users_desc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input 
                    placeholder={t('search_user')} 
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
                    {t('refresh')}
                  </Button>
                </div>
              </div>

              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-400">{t('loading_users')}</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 px-8">{t('identity')}</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">{t('current_role')}</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 text-right px-8">{t('actions')}</TableHead>
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
                                <SelectItem value="ADMIN">{t('role_admin')}</SelectItem>
                                <SelectItem value="OWNER">{t('role_owner')}</SelectItem>
                                <SelectItem value="TENANT">{t('role_tenant')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-5 text-right px-8">
                            <div className="flex justify-end gap-2">
                              {u.role !== 'ADMIN' && (
                                <Dialog open={showUserPwdDialog && selectedUser?.id === u.id} onOpenChange={(open) => {
                                  setShowUserPwdDialog(open);
                                  if (!open) {
                                    setSelectedUser(null);
                                    setAdminUserPassword('');
                                  } else {
                                    setSelectedUser(u);
                                  }
                                }}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                      title={t('reset_user_password')}
                                    >
                                      <Key className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-sm bg-white dark:bg-slate-900">
                                    <DialogHeader>
                                      <DialogTitle className="text-xl font-black tracking-tight">{t('password')} : {u.first_name}</DialogTitle>
                                      <DialogDescription className="text-xs font-bold text-slate-400 uppercase">
                                        {t('enter_new_password_for')}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('new_password')}</Label>
                                        <Input 
                                          type="text"
                                          placeholder="Ex: Loxis2024!"
                                          value={adminUserPassword}
                                          onChange={e => setAdminUserPassword(e.target.value)}
                                          className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        onClick={handleUpdatePasswordByAdmin}
                                        disabled={!adminUserPassword.trim()}
                                        className="w-full h-12 rounded-xl bg-slate-900 text-white font-black"
                                      >
                                        {t('save')}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={u.id === user?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
        </div>
      </div>
    </div>
  );
}
