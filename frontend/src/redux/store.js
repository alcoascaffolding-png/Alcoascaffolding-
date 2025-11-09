import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import formReducer from './slices/formSlice';
import navigationReducer from './slices/navigationSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    form: formReducer,
    navigation: navigationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
