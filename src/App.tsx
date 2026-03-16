import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import BiensPage from "@/pages/BiensPage";
import BienDetailPage from "@/pages/BienDetailPage";
import LocatairesPage from "@/pages/LocatairesPage";
import LocataireDetailPage from "@/pages/LocataireDetailPage";
import BauxPage from "@/pages/BauxPage";
import BailDetailPage from "@/pages/BailDetailPage";
import PaiementsPage from "@/pages/PaiementsPage";
import QuittancesPage from "@/pages/QuittancesPage";
import ComptabilitePage from "@/pages/ComptabilitePage";
import AlertesPage from "@/pages/AlertesPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <h2 className="page-title mb-2">{title}</h2>
      <p className="text-muted-foreground">Cette page sera bientôt disponible.</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/biens" element={<BiensPage />} />
            <Route path="/biens/:id" element={<BienDetailPage />} />
            <Route path="/locataires" element={<LocatairesPage />} />
            <Route path="/locataires/:id" element={<LocataireDetailPage />} />
            <Route path="/baux" element={<BauxPage />} />
            <Route path="/baux/:id" element={<BailDetailPage />} />
            <Route path="/paiements" element={<PaiementsPage />} />
            <Route path="/quittances" element={<QuittancesPage />} />
            <Route path="/comptabilite" element={<ComptabilitePage />} />
            <Route path="/alertes" element={<AlertesPage />} />
            <Route path="/parametres" element={<PlaceholderPage title="Paramètres" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
