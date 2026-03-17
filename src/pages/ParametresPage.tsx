import { useState } from 'react';
import { Save, User, Bell, Shield, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ParametresPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telephone, setTelephone] = useState(user?.telephone || '');

  // Notification prefs
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifLoyer, setNotifLoyer] = useState(true);
  const [notifBail, setNotifBail] = useState(true);
  const [notifQuittance, setNotifQuittance] = useState(false);

  // App prefs
  const [devise, setDevise] = useState('FCFA');
  const [langue, setLangue] = useState('fr');

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast({ title: 'Paramètres enregistrés', description: 'Vos modifications ont été sauvegardées.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" subtitle="Gérez votre profil et vos préférences" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Profil</CardTitle>
            </div>
            <CardDescription>Vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input value={nom} onChange={e => setNom(e.target.value)} />
              </div>
              <div>
                <Label>Prénom</Label>
                <Input value={prenom} onChange={e => setPrenom(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={telephone} onChange={e => setTelephone(e.target.value)} />
            </div>
            <Separator />
            <div>
              <Label>Rôle</Label>
              <p className="mt-1 text-sm font-medium capitalize text-muted-foreground">{user?.role || '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
            <CardDescription>Choisissez les alertes que vous souhaitez recevoir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifications par email</p>
                <p className="text-xs text-muted-foreground">Recevoir les alertes par email</p>
              </div>
              <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Loyers impayés</p>
                <p className="text-xs text-muted-foreground">Alertes pour les retards de paiement</p>
              </div>
              <Switch checked={notifLoyer} onCheckedChange={setNotifLoyer} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Fin de bail</p>
                <p className="text-xs text-muted-foreground">Rappels avant l'échéance d'un bail</p>
              </div>
              <Switch checked={notifBail} onCheckedChange={setNotifBail} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Quittances générées</p>
                <p className="text-xs text-muted-foreground">Notification à chaque nouvelle quittance</p>
              </div>
              <Switch checked={notifQuittance} onCheckedChange={setNotifQuittance} />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Préférences</CardTitle>
            </div>
            <CardDescription>Personnalisez votre expérience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Devise</Label>
              <Select value={devise} onValueChange={setDevise}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCFA">FCFA (Franc CFA)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="USD">USD (Dollar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Langue</Label>
              <Select value={langue} onValueChange={setLangue}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Sécurité</CardTitle>
            </div>
            <CardDescription>Gérez votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mot de passe actuel</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label>Nouveau mot de passe</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label>Confirmer le nouveau mot de passe</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}
