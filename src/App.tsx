
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Restaurants from "./pages/Restaurants";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Menu from "./pages/Menu";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import AutomatedCallsPage from "./pages/AutomatedCallsPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/Login";
import InventoryList from "./pages/inventory/InventoryList";
import InventoryDetail from "./pages/inventory/InventoryDetail";
import StaffList from "./pages/staff/StaffList";
import StaffDetail from "./pages/staff/StaffDetail";
import ScheduleList from "./pages/staff/ScheduleList";
import ScheduleDetail from "./pages/staff/ScheduleDetail";
import ReviewsList from "./pages/reviews/ReviewsList";
import ReviewDetail from "./pages/reviews/ReviewDetail";
import WaitTimePage from "./pages/wait-time/WaitTimePage";
import UpsellPage from "./pages/upsell/UpsellPage";

// New AI Feature Pages (proposed in audit)
import DynamicPricingPage from "./pages/dynamic-pricing/DynamicPricingPage";
import PredictiveInventoryPage from "./pages/predictive-inventory/PredictiveInventoryPage";
import PersonalizedRecsPage from "./pages/personalized-recs/PersonalizedRecsPage";
import StaffOptimizerPage from "./pages/staff-optimizer/StaffOptimizerPage";
import SustainabilityPage from "./pages/sustainability/SustainabilityPage";
import VoiceOrderPage from "./pages/voice-order/VoiceOrderPage";
import AffiliateNetworkPage from "./pages/affiliate-network/AffiliateNetworkPage";
import GroupOrderPage from "./pages/group-order/GroupOrderPage";

import { ErrorBoundary } from "./components/shared/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename="/">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogArticle />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderTracking />} />
                <Route path="/automated-calls" element={<AutomatedCallsPage />} />

                {/* Admin Routes */}
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
                <Route path="/admin/inventory" element={<ErrorBoundary><InventoryList /></ErrorBoundary>} />
                <Route path="/admin/inventory/:id" element={<ErrorBoundary><InventoryDetail /></ErrorBoundary>} />
                <Route path="/admin/staff" element={<ErrorBoundary><StaffList /></ErrorBoundary>} />
                <Route path="/admin/staff/:id" element={<ErrorBoundary><StaffDetail /></ErrorBoundary>} />
                <Route path="/admin/schedules" element={<ErrorBoundary><ScheduleList /></ErrorBoundary>} />
                <Route path="/admin/schedules/:id" element={<ErrorBoundary><ScheduleDetail /></ErrorBoundary>} />
                <Route path="/admin/reviews" element={<ErrorBoundary><ReviewsList /></ErrorBoundary>} />
                <Route path="/admin/reviews/:id" element={<ErrorBoundary><ReviewDetail /></ErrorBoundary>} />
                <Route path="/admin/wait-time" element={<ErrorBoundary><WaitTimePage /></ErrorBoundary>} />
                <Route path="/admin/upsell" element={<ErrorBoundary><UpsellPage /></ErrorBoundary>} />

                {/* New AI Feature Routes */}
                <Route path="/admin/dynamic-pricing" element={<ErrorBoundary><DynamicPricingPage /></ErrorBoundary>} />
                <Route path="/admin/predictive-inventory" element={<ErrorBoundary><PredictiveInventoryPage /></ErrorBoundary>} />
                <Route path="/admin/staff-optimizer" element={<ErrorBoundary><StaffOptimizerPage /></ErrorBoundary>} />
                <Route path="/admin/affiliate-network" element={<ErrorBoundary><AffiliateNetworkPage /></ErrorBoundary>} />
                <Route path="/recommendations" element={<ErrorBoundary><PersonalizedRecsPage /></ErrorBoundary>} />
                <Route path="/sustainability" element={<ErrorBoundary><SustainabilityPage /></ErrorBoundary>} />
                <Route path="/voice-order" element={<ErrorBoundary><VoiceOrderPage /></ErrorBoundary>} />
                <Route path="/group-order" element={<ErrorBoundary><GroupOrderPage /></ErrorBoundary>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
