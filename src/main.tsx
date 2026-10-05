import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexAuthProvider } from "@/lib/convex-auth-compat";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { MotionConfig } from "framer-motion";
import App from "@/App";
import "@/index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConvexAuthProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </MotionConfig>
      </ConvexAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
