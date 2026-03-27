import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '', confirmPassword: '', role: 'proprietaire' as 'proprietaire' | 'locataire' });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const passwordStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'][strength] || '';
  const strengthColor = ['', 'bg-destructive', 'bg-warning', 'bg-secondary', 'bg-success'][strength] || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 6 caractères', variant: 'destructive' });
      return;
    }
    if (!acceptTerms) {
      toast({ title: 'Erreur', description: 'Veuillez accepter les conditions d\'utilisation', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await register({ nom: form.nom, prenom: form.prenom, email: form.email, telephone: form.telephone, mot_de_passe: form.password, role: form.role });
      toast({ title: 'Bienvenue chez Loxis !', description: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.' });
      navigate('/login');
    } catch (err: any) {
      if (err.response?.status === 400) {
        const data = err.response.data;
        if (data.email) {
          toast({ title: "Email déjà utilisé", description: "Cette adresse email possède déjà un compte Loxis.", variant: 'destructive' });
        } else if (data.telephone) {
          toast({ title: "Numéro de téléphone invalide", description: "Veuillez vérifier le format de votre numéro de téléphone.", variant: 'destructive' });
        } else {
          toast({ title: "Inscription impossible", description: "Certaines informations fournies sont invalides.", variant: 'destructive' });
        }
      } else {
        toast({ title: 'Erreur d\'inscription', description: "Une erreur est survenue lors de la création de votre compte.", variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md dark:bg-[hsl(222,47%,18%)] bg-card">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-4 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">LOXIS</span>
          </Link>
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>Rejoignez LOXIS pour gérer vos biens</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={form.nom} onChange={e => set('nom', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input value={form.prenom} onChange={e => set('prenom', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input type="tel" placeholder="+228 90 00 00 00" value={form.telephone} onChange={e => set('telephone', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-muted'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{strengthLabel}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Confirmer le mot de passe</Label>
              <Input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Je suis un :</Label>
              <RadioGroup value={form.role} onValueChange={v => set('role', v)} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="proprietaire" id="r-proprio" />
                  <Label htmlFor="r-proprio" className="font-normal">Propriétaire</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="locataire" id="r-locataire" />
                  <Label htmlFor="r-locataire" className="font-normal">Locataire</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={v => setAcceptTerms(v === true)} />
              <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                J'accepte les conditions d'utilisation
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer mon compte
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">Se connecter</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
