import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Ensure Supabase env vars are injected at build time (prevents runtime undefined)
  const VITE_SUPABASE_URL = env.VITE_SUPABASE_URL || "https://cggwrsztafeosmigfckc.supabase.co";
  const VITE_SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZ3dyc3p0YWZlb3NtaWdmY2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjM0MjEsImV4cCI6MjA3NDk5OTQyMX0.J84ZhH7rBDp9OJvAPhhkjdsjfzenyu3WIgR2thqg94U";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(VITE_SUPABASE_PUBLISHABLE_KEY),
    },
  };
});
