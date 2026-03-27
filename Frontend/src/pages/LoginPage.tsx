import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, is2faRequired ? otp : undefined);
      const stored = localStorage.getItem('loxis_user');
      const user = stored ? JSON.parse(stored) : null;
      if (user?.role === 'locataire' || user?.role === 'TENANT') {
        navigate('/mon-espace', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      if (err.response?.data?.["2fa_required"]) {
        setIs2faRequired(true);
        toast({ title: "Sécurité Double Facteur", description: "Veuillez entrer le code de votre application d'authentification." });
      } else if (err.response?.status === 401) {
        toast({ title: "Identification échouée", description: "Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.", variant: 'destructive' });
      } else if (err.response?.status === 404) {
        toast({ title: "Compte introuvable", description: "Cette adresse email n'est associée à aucun compte Loxis.", variant: 'destructive' });
      } else if (err.response?.status === 403) {
        toast({ title: "Compte bloqué", description: "Votre compte est temporairement désactivé. Contactez l'administrateur.", variant: 'destructive' });
      } else if (!err.response) {
        toast({ title: "Mode Hors-ligne", description: "Impossible de se connecter. Vérifiez votre connexion internet.", variant: 'destructive' });
      } else {
        toast({ title: "Problème technique", description: "Une erreur inattendue est survenue lors de la connexion. Réessayez plus tard.", variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md dark:bg-[hsl(222,47%,18%)] bg-card">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-4 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">LOXIS</span>
          </Link>
          <CardTitle className="text-xl">{t('login')}</CardTitle>
          <CardDescription>{t('access_management_space')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!is2faRequired ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <div className="relative">
                    <Input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Label htmlFor="otp">{t('authenticator_code')}</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                  maxLength={6} 
                  placeholder="123456" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                  required 
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">
                  {t('authenticator_instruction')}
                </p>
                <button 
                  type="button" 
                  className="text-xs text-primary hover:underline mt-2"
                  onClick={() => { setIs2faRequired(false); setOtp(''); }}
                >
                  {t('back_to_standard')}
                </button>
              </div>
            )}
            <div className="text-right">
              <button type="button" className="text-sm text-primary hover:underline">{t('forgot_pw')}</button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {is2faRequired ? t('verify_code') : t('sign_in')}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('no_account_yet')}{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">{t('register')}</Link>
          </p>
          <div className="mt-4 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">{t('demo_accounts_title')}</p>
            <p>admin@loxis.com / admin123</p>
            <p>proprio@loxis.com / proprio123</p>
            <p>locataire@loxis.com / locataire123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
