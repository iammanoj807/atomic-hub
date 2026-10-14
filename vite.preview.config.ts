// TEMPORARY preview harness — delete before finishing.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const mock = fileURLToPath(new URL('./src/__preview__/mockFoundations.ts', import.meta.url));
export default defineConfig({
    plugins: [react()],
    resolve: { alias: [{ find: /^\.\.\/hooks\/useFoundations$/, replacement: mock }] },
    server: { port: 5199, strictPort: true },
});
