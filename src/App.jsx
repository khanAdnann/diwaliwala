import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FestiveBackground from './components/FestiveBackground';
import DiyaSvg from './components/DiyaSvg';
import Home from './pages/Home';

// Code-split routes for fast initial bundle loading
const WishGenerator = lazy(() => import('./pages/WishGenerator'));
const NameInLights = lazy(() => import('./pages/NameInLights'));
const PhotoFrameMaker = lazy(() => import('./pages/PhotoFrameMaker'));
const FireworksSimulator = lazy(() => import('./pages/FireworksSimulator'));
const About = lazy(() => import('./pages/About'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);
  return null;
}

function FestiveLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <DiyaSvg size={72} lit />
      <p className="font-display text-lg font-bold gold-gradient-text animate-pulse">
        Lighting the Festive Diyas...
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col relative text-[#FFF4DC] selection:bg-[#FFD700] selection:text-[#0D0618]">
      <ScrollToTop />
      <FestiveBackground />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Suspense fallback={<FestiveLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wishes" element={<WishGenerator />} />
            <Route path="/name-in-lights" element={<NameInLights />} />
            <Route path="/photo-frames" element={<PhotoFrameMaker />} />
            <Route path="/fireworks" element={<FireworksSimulator />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

