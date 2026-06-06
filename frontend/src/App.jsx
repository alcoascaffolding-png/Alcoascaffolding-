import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';
import WhatsAppButton from './components/common/WhatsAppButton';
import ErrorBoundary from './components/common/ErrorBoundary';

import Home from './pages/Home';
import ArabicPage from './pages/ArabicPage';

const Products = lazy(() => import('./pages/Products'));
const Services = lazy(() => import('./pages/Services'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const ProjectGallery = lazy(() => import('./pages/ProjectGallery'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const SafetyStandards = lazy(() => import('./pages/SafetyStandards'));
const Branches = lazy(() => import('./pages/Branches'));
const LocationPage = lazy(() => import('./pages/LocationPage'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ProductDetail = lazy(() => import('./pages/products/ProductDetail'));
const ServiceDetail = lazy(() => import('./pages/services/ServiceDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen flex flex-col bg-white">
            <ScrollToTop />
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/ar" element={<ArabicPage pageKey="home" />} />
                  <Route path="/ar/products" element={<ArabicPage pageKey="products" />} />
                  <Route path="/ar/services" element={<ArabicPage pageKey="services" />} />
                  <Route path="/ar/contact-us" element={<ArabicPage pageKey="contact" />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/aluminum-scaffolding-dubai" element={<Products />} />
                  <Route path="/products/:productId" element={<ProductDetail />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/construction-scaffolding-uae" element={<Services />} />
                  <Route path="/services/:serviceId" element={<ServiceDetail />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/projects" element={<ProjectGallery />} />
                  <Route path="/project-details/:id" element={<ProjectDetails />} />
                  <Route path="/safety" element={<SafetyStandards />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/scaffolding-rental-dubai" element={<LocationPage locationKey="dubai" />} />
                  <Route path="/scaffolding-rental-abu-dhabi" element={<LocationPage locationKey="abu-dhabi" />} />
                  <Route path="/scaffolding-rental-musaffah" element={<LocationPage locationKey="musaffah" />} />
                  <Route path="/scaffolding-near-me-uae" element={<LocationPage locationKey="near-me" />} />
                  <Route path="/alcoa-scaffolding" element={<AboutUs />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <WhatsAppButton />
            <BackToTop />
          </div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            className="mt-16"
          />
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
