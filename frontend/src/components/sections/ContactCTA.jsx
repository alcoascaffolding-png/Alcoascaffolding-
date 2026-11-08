import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMessageCircle, FiMapPin, FiArrowRight } from 'react-icons/fi';
import {
  PHONE_PRIMARY,
  PHONE_PRIMARY_E164,
  STREET_ADDRESS_SHORT,
  OPENING_HOURS_SUMMARY,
  MAPS_SEARCH_URL,
  whatsappUrl,
  telHref,
} from '../../data/businessFacts';

const ContactCTA = () => (
  <section className="bg-gradient-to-br from-blue-700 to-slate-800 py-14 text-white sm:py-16">
    <div className="container-custom text-center">
      <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Ready to start your project?</h2>
      <p className="mx-auto mt-3 max-w-2xl text-blue-100">
        Share your site location, height and hire period — we'll send a free quote in AED.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to="/contact-us"
          className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow-md transition-colors hover:bg-blue-50"
        >
          Get Free Quote
          <FiArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-green-800"
        >
          <FiMessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </a>
        <a
          href={telHref(PHONE_PRIMARY_E164)}
          className="inline-flex items-center justify-center rounded-lg border-2 border-white/70 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
        >
          <FiPhone className="mr-2 h-4 w-4" />
          {PHONE_PRIMARY}
        </a>
      </div>

      <p className="mt-8 flex flex-col items-center justify-center gap-1 text-sm text-blue-100 sm:flex-row sm:gap-2">
        <FiMapPin className="h-4 w-4" aria-hidden="true" />
        <a href={MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {`${STREET_ADDRESS_SHORT}, Abu Dhabi`}
        </a>
        <span className="hidden sm:inline">·</span>
        <span>{OPENING_HOURS_SUMMARY}</span>
        <span className="hidden sm:inline">·</span>
        <a href={telHref(PHONE_PRIMARY_E164)} className="hover:underline">
          24/7 emergency line
        </a>
      </p>
    </div>
  </section>
);

export default ContactCTA;
