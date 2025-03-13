import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OBSProvider } from "@/context/OBSContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { MobileCheck } from "@/components/MobileCheck";
import { SplashScreen } from "@/components/SplashScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MobileCheck>
      <OBSProvider>
        <TooltipProvider>
          <SplashScreen />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OBSProvider>
    </MobileCheck>
  </QueryClientProvider>
);

export default App;
