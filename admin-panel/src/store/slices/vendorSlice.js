/**
 * Vendor Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { vendorService } from '../../services/api';

const vendorSlice = createResourceSlice('vendors', vendorService);

export const {
  fetchAll: fetchVendors,
  fetchById: fetchVendorById,
  fetchStats: fetchVendorStats,
  create: createVendor,
  update: updateVendor,
  delete: deleteVendor
} = vendorSlice.actions;

export const { clearError, clearCurrentItem } = vendorSlice.actions;

export default vendorSlice.reducer;
