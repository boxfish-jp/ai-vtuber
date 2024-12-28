import dotenv from "dotenv";
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		env: dotenv.config({ path: ".env" }).parsed,
	},
});
