import App from './App.svelte'
// this is very heavy ~600KB, we shoulse use the CDN version or per-component css
import "carbon-components-svelte/css/all.css";

if (import.meta.env.DEV) {
  await import('./lib/hmr')
}

const app = new App({
  target: document.body,
})

export default app;
