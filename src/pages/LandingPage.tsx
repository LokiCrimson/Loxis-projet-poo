import { Link } from 'react-router-dom';
import { Building2, FileText, Receipt, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const features = [
  { icon: Building2, title: 'Gestion des biens', desc: 'Centralisez tous vos biens immobiliers, suivez leur statut et gérez les détails en un clic.' },
  { icon: FileText, title: 'Suivi des baux & paiements', desc: 'Créez vos baux, suivez les loyers et recevez des alertes automatiques en cas d\'impayé.' },
  { icon: Receipt, title: 'Quittances automatiques', desc: 'Générez et envoyez les quittances de loyer automatiquement à vos locataires.' },
];

const steps = [
  { num: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement en quelques secondes.' },
  { num: '02', title: 'Ajoutez vos biens', desc: 'Renseignez vos propriétés avec tous les détails nécessaires.' },
  { num: '03', title: 'Gérez tout en un clic', desc: 'Baux, paiements, quittances — tout est centralisé.' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-primary">LOXIS</span>
          </Link>
          <div className="hidden gap-3 sm:flex">
            <ThemeToggle />
            <Button variant="outline" asChild><Link to="/login">Se connecter</Link></Button>
            <Button asChild><Link to="/register">S'inscrire</Link></Button>
          </div>
          <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="flex flex-col gap-2 border-t px-4 py-3 sm:hidden">
            <div className="flex justify-center py-2">
              <ThemeToggle />
            </div>
            <Button variant="outline" asChild className="w-full"><Link to="/login">Se connecter</Link></Button>
            <Button asChild className="w-full"><Link to="/register">S'inscrire</Link></Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-32">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Gérez votre patrimoine immobilier
            <span className="block text-primary">en toute sérénité</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            LOXIS simplifie la gestion locative : biens, baux, paiements et quittances, tout en un seul endroit. Conçu pour les propriétaires en Afrique.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">Créer un compte <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Tout ce qu'il vous faut</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map(f => (
              <div key={f.title} className="rounded-xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Comment ça marche ?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(s => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {s.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">LOXIS</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">© {new Date().getFullYear()} LOXIS. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
