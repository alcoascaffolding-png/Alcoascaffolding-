/**
 * Photos supplied in src/assets/product images/ only.
 * UI shows real images when a key exists here; otherwise the package/tool icon placeholder.
 */
import cuplockStandard from '../assets/product images/cup lock standar.webp';
import cuplockLedger from '../assets/product images/leger cup lock photo.jpeg';
import intermediateTransom from '../assets/product images/cup lock trasfrom.jpg.jpeg';
import baseJacks from '../assets/product images/base plate jack.webp';
import propJacks from '../assets/product images/prop jack.jpeg';
import giPipe from '../assets/product images/Gi-Pipe-Hot-Dipped-Galvanized-Steel-Pipe.avif';
import msPipe from '../assets/product images/MS-Pipe.jpg.jpeg';
import uHeadJack from '../assets/product images/adjustable-u-head-jacks.jpg.jpeg';
import swivelBaseJack from '../assets/product images/rocking or swvivwl base plate jack.webp';
import woodenPlanks from '../assets/product images/wooden plank.webp';
import doubleCoupler from '../assets/product images/doubal clamp.png';
import boardRetainingCoupler from '../assets/product images/brc clamp.webp';
import swivelCoupler from '../assets/product images/swivel clamp.jpg.jpeg';
import putlogCoupler from '../assets/product images/singal clamp.jpg.jpeg';
import beamCoupler from '../assets/product images/beam clamp.avif';
import universalClamp from '../assets/product images/universal jack.jpg.jpeg';
import spigotPin from '../assets/product images/spogot pin.jpg.jpeg';
import jointPin from '../assets/product images/pipe jainet.webp';
import beamLadder from '../assets/product images/beam laddar.png';
import fixedBasePlateJack from '../assets/product images/base plate jack.jpg.jpeg';
import standardWoodPlank from '../assets/product images/wooden plank.jpg.jpeg';

export const productImageMap = {
  'cuplock-standard': cuplockStandard,
  'cuplock-ledger': cuplockLedger,
  'intermediate-transom': intermediateTransom,
  'base-jacks': baseJacks,
  'prop-jacks': propJacks,
  'gi-pipe': giPipe,
  'ms-pipe': msPipe,
  'u-head-jack': uHeadJack,
  'swivel-base-jack': swivelBaseJack,
  'wooden-planks': woodenPlanks,
  'double-coupler': doubleCoupler,
  'board-retaining-coupler': boardRetainingCoupler,
  'swivel-coupler': swivelCoupler,
  'putlog-coupler': putlogCoupler,
  'beam-coupler': beamCoupler,
  'universal-clamp': universalClamp,
  'spigot-pin': spigotPin,
  'joint-pin': jointPin,
  'beam-ladder': beamLadder,
  'fixed-base-plate-jack': fixedBasePlateJack,
  'standard-wood-plank': standardWoodPlank,
};

export const getProductImage = (productId) => productImageMap[productId] ?? null;

export const categoryIcons = {
  'Aluminium Scaffolding': '🏗️',
  Ladders: '🪜',
  'Steel Cuplock Scaffolding': '🔧',
  Couplers: '🔩',
};

export const getCategoryIcon = (category) => categoryIcons[category] ?? '📦';

export const getServiceIdFromLink = (link = '') =>
  link.replace(/^\/services\//, '').split('?')[0];
