import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlansPage from "./pages/PlansPage";
import PlanFormPage from "./pages/PlanFormPage";
import AddOnsPage from "./pages/AddOnsPage";
import AddOnFormPage from "./pages/AddOnFormPage";
import CouponsPage from "./pages/CouponsPage";
import CouponFormPage from "./pages/CouponFormPage";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/new" element={<PlanFormPage />} />
          <Route path="/plans/:id/edit" element={<PlanFormPage />} />
          <Route path="/addons" element={<AddOnsPage />} />
          <Route path="/addons/new" element={<AddOnFormPage />} />
          <Route path="/addons/:id/edit" element={<AddOnFormPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/coupons/new" element={<CouponFormPage />} />
          <Route path="/coupons/:id/edit" element={<CouponFormPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
