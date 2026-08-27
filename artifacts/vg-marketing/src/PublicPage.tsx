import { lazy, Suspense } from 'react';

const PublicPageComponent = lazy(async () => {
  const module = await import('./App');
  return { default: module.PublicPage };
});

export function PublicPage({ path }: { path: string }) {
  return (
    <Suspense fallback={null}>
      <PublicPageComponent path={path} />
    </Suspense>
  );
}