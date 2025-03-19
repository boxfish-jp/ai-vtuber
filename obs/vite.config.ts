import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), viteSingleFile()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
});
