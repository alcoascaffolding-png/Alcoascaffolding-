import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { productCategories } from '../../data/productCategories';
import aluminiumCover from '../../assets/FOLDING-TOWER.png?format=webp&w=600';
import laddersCover from '../../assets/aluminium a type dual purpose.jpg?format=webp&w=600';
import cuplockCover from '../../assets/product images/cup lock standar.webp?w=600';
import couplersCover from '../../assets/product images/swivel clamp.jpg.jpeg?format=webp&w=600';

const CARDS = [
  {
    id: 'aluminium-scaffolding',
    title: 'Aluminium Scaffold Towers',
    text: 'Single, double width, folding and stairway mobile towers.',
    image: aluminiumCover,
  },
  {
    id: 'steel-cuplock-scaffolding',
    title: 'Steel Cuplock Scaffolding',
    text: 'Standards, ledgers, transoms, jacks and planks for heavy-duty work.',
    image: cuplockCover,
  },
  {
    id: 'ladders',
    title: 'Aluminium Ladders',
    text: 'A-type, extension, platform and fiberglass ladders.',
    image: laddersCover,
  },
  {
    id: 'couplers',
    title: 'Couplers & Clamps',
    text: 'Double, swivel, putlog, sleeve and beam couplers.',
    image: couplersCover,
  },
];

const ProductCategoryCards = ({ title = 'Our Products', subtitle = 'Rent or buy from our Musaffah 37 warehouse.' }) => (
  <section className="bg-gray-50 py-14 dark:bg-gray-900 sm:py-16">
    <div className="container-custom">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{title}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{subtitle}</p>
        </div>
        <Link
          to="/services/folding-tower"
          className="inline-flex items-center text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          Mobile scaffolding towers
          <FiArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <Link
            key={card.id}
            to={`/products/${card.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-white dark:bg-gray-100">
              <img
                src={card.image}
                alt={`${card.title} — Alcoa Aluminium Scaffolding, Abu Dhabi`}
                width={600}
                height={450}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{card.title}</h3>
              <p className="mt-1 flex-1 text-sm text-gray-600 dark:text-gray-300">{card.text}</p>
              <p className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {productCategories[card.id].serviceKeys.length} products
                </span>
                <span className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400">
                  View range
                  <FiArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default ProductCategoryCards;
