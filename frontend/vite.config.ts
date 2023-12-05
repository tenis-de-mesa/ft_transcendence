import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
// https://github.com/vitejs/vite/issues/1930
export default defineConfig(({ command, mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return {
    plugins: [react()],
    define: {
      "process.env": process.env,
    },
  };
});
