
import React from "react";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
} from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { CartProvider } from "./context/cartcontex";
import { WishlistProvider } from "./context/WishlistContext";
import GlobalLoadingScreen from "./components/GlobalLoadingScreen";
import useAuthuser from "./hooks/authuser";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function GlobalLoadingController() {
  const { isLoading: authLoading } = useAuthuser();
  const isFetching = useIsFetching();
  const isPageLoading = authLoading || isFetching > 0;
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (!isPageLoading) {
      setShowLoader(false);
      return;
    }

    const timer = setTimeout(() => setShowLoader(true), 250);

    return () => clearTimeout(timer);
  }, [isPageLoading]);

  return (
    <GlobalLoadingScreen
      loading={showLoader}
      minimumDuration={900}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          <WishlistProvider>
            <App />
            <GlobalLoadingController />
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

