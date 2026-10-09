import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import PublicLayout from './components/layout/PublicLayout.jsx';
import Spinner from './components/common/Spinner.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const DemoPage = lazy(() => import('./pages/DemoPage.jsx'));
const PublicNotFound = lazy(() => import('./pages/NotFound.jsx'));

const Dashboard = lazy(() => import('./pages/app/Dashboard.jsx'));
const CRM = lazy(() => import('./pages/app/CRM.jsx'));
const Customers = lazy(() => import('./pages/app/Customers.jsx'));
const ProjectsList = lazy(() => import('./pages/app/ProjectsList.jsx'));
const ProjectDetail = lazy(() => import('./pages/app/ProjectDetail.jsx'));
const Designs = lazy(() => import('./pages/app/Designs.jsx'));
const Estimations = lazy(() => import('./pages/app/Estimations.jsx'));
const Procurement = lazy(() => import('./pages/app/Procurement.jsx'));
const Inventory = lazy(() => import('./pages/app/Inventory.jsx'));
const Vendors = lazy(() => import('./pages/app/Vendors.jsx'));
const Finance = lazy(() => import('./pages/app/Finance.jsx'));
const Documents = lazy(() => import('./pages/app/Documents.jsx'));
const Analytics = lazy(() => import('./pages/app/Analytics.jsx'));
const Copilot = lazy(() => import('./pages/app/Copilot.jsx'));
const Settings = lazy(() => import('./pages/app/Settings.jsx'));
const AppShell = lazy(() => import('./components/layout/AppShell.jsx'));

function Protected() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingPage label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

function RedirectIfAuthed() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user) return <Navigate to="/app" replace />;
  return <Outlet />;
}

function LoadingPage({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

const Fallback = () => <LoadingPage label="Preparing the workspace…" />;

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="*" element={<PublicNotFound />} />
        </Route>

        {/* Auth pages */}
        <Route element={<RedirectIfAuthed />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected application */}
        <Route element={<Protected />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="crm" element={<CRM />} />
            <Route path="customers" element={<Customers />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="designs" element={<Designs />} />
            <Route path="estimations" element={<Estimations />} />
            <Route path="procurement" element={<Procurement />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="finance" element={<Finance />} />
            <Route path="documents" element={<Documents />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="copilot" element={<Copilot />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
