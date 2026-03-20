import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CurrencyContext, useCurrencyState } from './hooks/useCurrency';
import { LogoContext, useLogoState } from './hooks/useLogo';
import { SiteSettingsContext, useSiteSettingsState } from './hooks/useSiteSettings';

// ── Page loading skeleton ──
function PageSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(212,175,55,0.6)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ width: 120, height: 4, borderRadius: '2px', background: 'rgba(212,175,55,0.15)', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#B8860B,#D4AF37)', animation: 'shimmer 1.2s ease-in-out infinite', width: '60%' }} />
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%,100% { margin-left:0; } 50% { margin-left:40%; } }
      `}</style>
    </div>
  );
}

// ── Lazy-loaded public pages ──
const Home          = lazy(() => import('./pages/Home'));
const Pricing       = lazy(() => import('./pages/Pricing'));
const Gallery       = lazy(() => import('./pages/Gallery'));
const About         = lazy(() => import('./pages/About'));
const Contact       = lazy(() => import('./pages/Contact'));
const FAQ           = lazy(() => import('./pages/FAQ'));
const Payment       = lazy(() => import('./pages/Payment'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));
const Terms         = lazy(() => import('./pages/Terms'));
const Privacy       = lazy(() => import('./pages/Privacy'));
const NotFound      = lazy(() => import('./pages/NotFound'));

// ── Lazy-loaded admin pages ──
const AdminLogin    = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout   = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard     = lazy(() => import('./pages/admin/Dashboard'));
const AdminLeads    = lazy(() => import('./pages/admin/AdminLeads'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminGallery  = lazy(() => import('./pages/admin/AdminGallery'));
const AdminPlans    = lazy(() => import('./pages/admin/AdminPlans'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// ── Layout wrappers ──
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

export default function App() {
  const currencyState     = useCurrencyState();
  const logoState         = useLogoState();
  const { settings: siteSettings } = useSiteSettingsState();

  return (
    <SiteSettingsContext.Provider value={siteSettings}>
      <LogoContext.Provider value={logoState}>
        <CurrencyContext.Provider value={currencyState}>
          <BrowserRouter>
            <Routes>
              {/* ── Public ── */}
              <Route path="/" element={<PublicLayout><Wrap><Home /></Wrap></PublicLayout>} />
              <Route path="/pricing" element={<PublicLayout><Wrap><Pricing /></Wrap></PublicLayout>} />
              <Route path="/gallery" element={<PublicLayout><Wrap><Gallery /></Wrap></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><Wrap><About /></Wrap></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Wrap><Contact /></Wrap></PublicLayout>} />
              <Route path="/faq" element={<PublicLayout><Wrap><FAQ /></Wrap></PublicLayout>} />
              <Route path="/payment" element={<PublicLayout><Wrap><Payment /></Wrap></PublicLayout>} />
              <Route path="/payment-success" element={<PublicLayout><Wrap><PaymentSuccess /></Wrap></PublicLayout>} />
              <Route path="/payment-failure" element={<PublicLayout><Wrap><PaymentFailure /></Wrap></PublicLayout>} />
              <Route path="/terms" element={<PublicLayout><Wrap><Terms /></Wrap></PublicLayout>} />
              <Route path="/privacy" element={<PublicLayout><Wrap><Privacy /></Wrap></PublicLayout>} />

              {/* ── Admin ── */}
              <Route path="/admin" element={<Wrap><AdminLogin /></Wrap>} />
              <Route path="/admin/dashboard" element={<Wrap><AdminLayout /></Wrap>}>
                <Route index element={<Wrap><Dashboard /></Wrap>} />
              </Route>
              <Route path="/admin/leads" element={<Wrap><AdminLayout /></Wrap>}>
                <Route index element={<Wrap><AdminLeads /></Wrap>} />
              </Route>
              <Route path="/admin/payments" element={<Wrap><AdminLayout /></Wrap>}>
                <Route index element={<Wrap><AdminPayments /></Wrap>} />
              </Route>
              <Route path="/admin/gallery" element={<Wrap><AdminLayout /></Wrap>}>
                <Route index element={<Wrap><AdminGallery /></Wrap>} />
              </Route>
              <Route path="/admin/plans" element={<Wrap><AdminLayout /></Wrap>}>
                <Route index element={<Wrap><AdminPlans /></Wrap>} />
              </Route>
              <Route path="/admin/analytics" element={<Wrap><AdminLayout /></Wrap>}>
                <Route index element={<Wrap><AdminAnalytics /></Wrap>} />
              </Route>
              <Route path="/admin/settings" element={<Wrap><AdminLayout /></Wrap>}>
                <Route index element={<Wrap><AdminSettings /></Wrap>} />
              </Route>

              {/* ── 404 ── */}
              <Route path="*" element={<Wrap><NotFound /></Wrap>} />
            </Routes>
          </BrowserRouter>
        </CurrencyContext.Provider>
      </LogoContext.Provider>
    </SiteSettingsContext.Provider>
  );
}
