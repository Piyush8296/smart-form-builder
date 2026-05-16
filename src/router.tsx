import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Brand } from './components/ui/Brand';

const Home = lazy(() => import('./pages/Home'));
const BuilderPage = lazy(() => import('./pages/BuilderPage'));
const FillPage = lazy(() => import('./pages/FillPage'));
const InstancesPage = lazy(() => import('./pages/InstancesPage'));

function SuspenseFallback() {
  return (
    <div className="min-h-screen bg-bg grid place-items-center">
      <Brand nameHidden />
    </div>
  );
}

export const routes: RouteObject[] = [
  { path: '/',                          element: <Suspense fallback={<SuspenseFallback />}><Home /></Suspense> },
  { path: '/builder/new',               element: <Suspense fallback={<SuspenseFallback />}><BuilderPage /></Suspense> },
  { path: '/builder/:id',               element: <Suspense fallback={<SuspenseFallback />}><BuilderPage /></Suspense> },
  { path: '/fill/:templateId',          element: <Suspense fallback={<SuspenseFallback />}><FillPage /></Suspense> },
  { path: '/templates/:id/instances',   element: <Suspense fallback={<SuspenseFallback />}><InstancesPage /></Suspense> },
];

export const router = createBrowserRouter(routes);
