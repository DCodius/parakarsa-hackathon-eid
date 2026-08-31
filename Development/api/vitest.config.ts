import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    // Seluruh tes proyek ini tinggal di test/ sebagai *.e2e-spec.ts. Keduanya
    // ikut supaya `npm test` menjalankan semuanya, bukan gagal tanpa berkas.
    include: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  },
});
