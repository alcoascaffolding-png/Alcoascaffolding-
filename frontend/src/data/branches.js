import {
  EMAIL_SALES,
  EMAIL_INFO,
  PHONE_PRIMARY,
  PHONE_SECONDARY,
  PHONE_FAX,
  STREET_ADDRESS,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  ADDRESS_COUNTRY_NAME,
  GEO,
  OPENING_HOURS,
} from './businessFacts';

export const branchesData = [
  {
    id: 'abu-dhabi-hq',
    name: 'Abu Dhabi Headquarters — Musaffah 37',
    type: 'headquarters',
    address: {
      street: STREET_ADDRESS,
      city: ADDRESS_LOCALITY,
      state: ADDRESS_REGION,
      postcode: '',
      country: ADDRESS_COUNTRY_NAME,
    },
    contact: {
      phone: PHONE_PRIMARY,
      phone2: PHONE_SECONDARY,
      fax: PHONE_FAX,
      email: EMAIL_SALES,
      email2: EMAIL_INFO,
      manager: 'Syed Tawakal',
      managerTitle: 'Regional Director',
    },
    services: [
      'MS Scaffolding Rent',
      'MS Scaffolding Sale',
      'Installation & Setup',
      'Installation/Disassembly',
      'Maintenance',
      'Safety Inspections',
      'Training',
      'Scaffolding Delivery',
      'Aluminium Scaffolding',
      'Fiberglass Ladder',
      'A Type Ladder',
      'Ladder Manufacturers',
    ],
    hours: {
      monday: OPENING_HOURS.monday.label,
      tuesday: OPENING_HOURS.tuesday.label,
      wednesday: OPENING_HOURS.wednesday.label,
      thursday: OPENING_HOURS.thursday.label,
      friday: OPENING_HOURS.friday.label,
      saturday: OPENING_HOURS.saturday.label,
      sunday: OPENING_HOURS.sunday.label,
    },
    specialties: ['High-rise Projects', 'Industrial Constructions', 'Marine Scaffolding'],
    // Unconfirmed operational claims — display lightly, not in schema
    established: null,
    staffCount: null,
    warehouseSize: null,
    serviceRadius: 'UAE-wide delivery from Musaffah 37',
    coordinates: { lat: GEO.latitude, lng: GEO.longitude },
  },
];

export const getBranchById = (id) => branchesData.find((branch) => branch.id === id);

export const getBranchesByState = (state) =>
  branchesData.filter((branch) => branch.address.state === state);

export const getHeadquarters = () =>
  branchesData.find((branch) => branch.type === 'headquarters');

export const getAllBranches = () =>
  branchesData.filter((branch) => branch.type === 'branch');

export const getBranchesWithService = (service) =>
  branchesData.filter((branch) => branch.services.includes(service));

export const getBranchesWithSpecialty = (specialty) =>
  branchesData.filter((branch) => branch.specialties.includes(specialty));
