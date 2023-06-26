import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { setDefaultResultOrder } from 'dns'
import { resolve } from 'path'

setDefaultResultOrder('verbatim')

export default defineConfig({
  plugins: [
    svelte(),
    viteSingleFile({
      removeViteModuleLoader: true,
      useRecommendedBuildConfig: true,
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
    ],
  },
  build: {
    outDir: 'build',
    target: 'es2019',
  },
})
