import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'


export default defineConfig(({ mode }) => {
  // Load env variables from .env files for the given mode
  // The third argument '' enables reading variables without the VITE_ prefix
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.PORT, 10) || 5173,
      strictPort: false,
    },
  };
});