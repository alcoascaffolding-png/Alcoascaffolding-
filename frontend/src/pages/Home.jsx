import React from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import About from '../components/sections/About';
import Services from '../components/sections/Services';
import ServiceCategories from '../components/sections/ServiceCategories';
import Projects from '../components/sections/Projects';
import Testimonials from '../components/sections/Testimonials';
import ContactCTA from '../components/sections/ContactCTA';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <About />
      <Services />
      <Projects />
      <Testimonials />
      <ServiceCategories />
      <ContactCTA />
    </div>
  );
};

export default Home;
