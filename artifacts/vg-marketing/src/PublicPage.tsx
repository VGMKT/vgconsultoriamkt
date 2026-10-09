// Keep the public island in a separate Vite module graph so Rollup can remove
// the authenticated CRM app and its PDF generator from public pages.
// @ts-expect-error Vite uses this query to create an independently tree-shaken entry.
import { PublicPage as PublicPageComponent } from './App.tsx?public';

export function PublicPage({ path }: { path: string }) {
  return <PublicPageComponent path={path} />;
}