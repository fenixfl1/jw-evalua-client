import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import Pages from "vite-plugin-pages";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      open: "/",
      port: Number(env.VITE_APP_PORT),
      host: env.VITE_APP_HOST || "localhost",
    },
    plugins: [
      react(),
      tsconfigPaths(),
      Pages({
        dirs: "src/pages",
        extensions: ["tsx"],
      }),
    ],
  };
});
