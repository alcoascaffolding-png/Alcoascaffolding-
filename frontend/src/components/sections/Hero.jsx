import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiAward, FiUsers, FiTool } from 'react-icons/fi';

const stats = [
  { icon: FiAward, number: '15+', label: 'Years Experience' },
  { icon: FiUsers, number: '500+', label: 'Projects Done' },
  { icon: FiTool, number: '24/7', label: 'Always Available' },
];

const trustPoints = ['ISO 9001:2015', 'Musaffah 37 warehouse', 'UAE-wide delivery'];

const LEVELS = [12.5, 25, 37.5, 50, 62.5, 75, 87.5];

/** Percentage-based so the drawing scales with the card on every screen size. */
const ScaffoldIllustration = () => (
  <div
    aria-hidden="true"
    className="relative aspect-[4/3] w-full max-w-xs rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 sm:max-w-md lg:max-w-lg"
  >
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-3/4 aspect-[3/4]">
        <div className="absolute inset-y-0 left-[16%] w-[4%] rounded-sm bg-gray-400" />
        <div className="absolute inset-y-0 right-[16%] w-[4%] rounded-sm bg-gray-400" />
        {LEVELS.map((top, i) => (
          <div
            key={top}
            className={`absolute left-[16%] right-[16%] h-[1.5%] min-h-[3px] rounded-sm ${i === 2 || i === 3 ? 'bg-blue-300' : 'bg-gray-400'}`}
            style={{ top: `${top}%` }}
          />
        ))}
        <div className="absolute -bottom-[3%] left-[12%] h-[3%] w-[10%] rounded-sm bg-gray-900 dark:bg-gray-200" />
        <div className="absolute -bottom-[3%] right-[12%] h-[3%] w-[10%] rounded-sm bg-gray-900 dark:bg-gray-200" />
      </div>
    </div>
  </div>
);

const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
    <div className="container-custom relative py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <p className="mb-4 inline-block rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300 sm:text-sm">
            Alcoa Scaffolding UAE
          </p>

          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl xl:text-5xl">
            Aluminium Scaffolding{' '}
            <span className="whitespace-nowrap text-blue-600 dark:text-blue-400">Abu Dhabi</span>{' '}
            <br className="hidden sm:block" />
            &amp; United Arab Emirates
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg lg:mx-0">
            Alcoa Aluminium Scaffolding is an ISO 9001:2015 manufacturer, supplier and rental company based in
            Musaffah, Abu Dhabi. We supply aluminium scaffold towers, mobile scaffolding, ladders and access
            equipment for construction and maintenance across the UAE.
          </p>

          <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            {trustPoints.join(' · ')}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              to="/contact-us"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
            >
              Get Free Quote
            </Link>
            <Link
              to="/aluminum-scaffolding-abu-dhabi"
              className="inline-flex items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:border-slate-400 dark:border-slate-600 dark:bg-transparent dark:text-slate-100"
            >
              View Products
              <FiArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-3 lg:mx-0">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <stat.icon className="mx-auto mb-1 h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-lg font-bold text-gray-900 dark:text-white">{stat.number}</dd>
                <dd className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex justify-center lg:justify-end">
          <ScaffoldIllustration />
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
