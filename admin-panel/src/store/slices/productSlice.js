/**
 * Product Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { productService } from '../../services/api';

const productSlice = createResourceSlice('products', productService);

export const {
  fetchAll: fetchProducts,
  fetchById: fetchProductById,
  fetchStats: fetchProductStats,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct
} = productSlice.actions;

export const { clearError, clearCurrentItem } = productSlice.actions;

export default productSlice.reducer;
