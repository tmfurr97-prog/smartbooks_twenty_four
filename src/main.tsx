import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Only enable Sentry on deployed builds, not in local/preview dev
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "https://2e09b2e7e804be080edde5055f975f9b@o4511561599942656.ingest.us.sentry.io/4511561602564096",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
    environment: import.meta.env.MODE,
  });
}

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-foreground">
            We have been notified and are looking into it. Please refresh the page or try again in a moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg bg-gold text-black-deep font-medium hover:opacity-90 transition"
          >
            Reload
          </button>
        </div>
      </div>
    }
  >
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </Sentry.ErrorBoundary>
);
