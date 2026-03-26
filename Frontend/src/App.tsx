import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import MonEspacePage from "@/pages/MonEspacePage";
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
import ParametresPage from "@/pages/ParametresPage";
import ReserverBienPage from "@/pages/ReserverBienPage";
import ExplorerBiensPage from "@/pages/ExplorerBiensPage";
import PublicBienDetailPage from "@/pages/PublicBienDetailPage";
import MesLocationsPage from "@/pages/MesLocationsPage";
import MyRentalRequestsPage from "@/pages/MyRentalRequestsPage";
import OwnerReservationsPage from "@/pages/OwnerReservationsPage";
import DashboardReviewsPage from "@/pages/DashboardReviewsPage";
import ActiveLeasePage from "@/pages/ActiveLeasePage";
import PaymentsPage from "@/pages/PaymentsPage";
import ReviewsPage from "@/pages/ReviewsPage";
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

const OwnerRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['admin', 'proprietaire', 'ADMIN', 'OWNER']}>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated routes for all users (Shared) */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
               <Route path="/alertes" element={<AlertesPage />} />
               <Route path="/parametres" element={<ParametresPage />} />
            </Route>

            {/* Tenant space */}
            <Route element={<ProtectedRoute allowedRoles={['locataire', 'TENANT']}><AppLayout /></ProtectedRoute>}>
               <Route path="/mon-espace" element={<MonEspacePage />} />
               <Route path="/explorer" element={<ExplorerBiensPage />} />
               <Route path="/mes-locations" element={<MesLocationsPage />} />
               <Route path="/reserver" element={<ReserverBienPage />} />
               <Route path="/reserver/:id" element={<PublicBienDetailPage />} />
               <Route path="/mes-demandes" element={<MyRentalRequestsPage />} />
               <Route path="/mon-bail" element={<ActiveLeasePage />} />
               <Route path="/mes-paiements" element={<PaymentsPage />} />
               <Route path="/mes-avis" element={<ReviewsPage />} />
               <Route path="/mes-quittances" element={<QuittancesPage />} />
            </Route>

            {/* Owner/Admin dashboard */}
            <Route element={<OwnerRoute><AppLayout /></OwnerRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reservations" element={<OwnerReservationsPage />} />
              <Route path="/biens" element={<BiensPage />} />
              <Route path="/biens/:id" element={<BienDetailPage />} />
              <Route path="/locataires" element={<LocatairesPage />} />
              <Route path="/locataires/:id" element={<LocataireDetailPage />} />
              <Route path="/baux" element={<BauxPage />} />
              <Route path="/baux/:id" element={<BailDetailPage />} />
              <Route path="/paiements" element={<PaiementsPage />} />
              <Route path="/quittances" element={<QuittancesPage />} />
              <Route path="/comptabilite" element={<ComptabilitePage />} />
              <Route path="/avis" element={<DashboardReviewsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;
