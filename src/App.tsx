import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import BiensPage from "@/pages/BiensPage";
import BienDetailPage from "@/pages/BienDetailPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <h2 className="page-title mb-2">{title}</h2>
      <p className="text-muted-foreground">Cette page sera disponible dans la Phase 2.</p>
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
            <Route path="/locataires" element={<PlaceholderPage title="Locataires" />} />
            <Route path="/baux" element={<PlaceholderPage title="Baux" />} />
            <Route path="/paiements" element={<PlaceholderPage title="Paiements" />} />
            <Route path="/quittances" element={<PlaceholderPage title="Quittances" />} />
            <Route path="/comptabilite" element={<PlaceholderPage title="Comptabilité" />} />
            <Route path="/alertes" element={<PlaceholderPage title="Alertes" />} />
            <Route path="/parametres" element={<PlaceholderPage title="Paramètres" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
