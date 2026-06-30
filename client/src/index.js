import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CustomerProvider } from "./context/CustomerContext";

// 1. AUTO-REFRESH KE LIYE REACT QUERY IMPORT KAREIN
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 2. GLOBAL SETTING BANAYEIN (Tab focus par apne aap refresh karne ke liye)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // ⚡ Pure project me tab focus par auto-refresh ON!
      staleTime: 1000 * 60 * 5, // 5 minute tak data ko fresh manega
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* 3. REACT QUERY PROVIDER SE WRAP KAREIN */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CustomerProvider>
          <App />
        </CustomerProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// 4. PWA SERVICE WORKER REGISTRATION (Aapke line 15 ke ); ke niche wala code)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker Registered Successfully!', reg.scope))
      .catch(err => console.log('Service Worker Registration Failed:', err));
  });
}
