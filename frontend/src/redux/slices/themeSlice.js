import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: false,
  colorScheme: 'default', // default, aluminium, industrial
  animationsEnabled: true,
  reducedMotion: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
    setColorScheme: (state, action) => {
      state.colorScheme = action.payload;
    },
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
    },
    setReducedMotion: (state, action) => {
      state.reducedMotion = action.payload;
    },
    resetTheme: (state) => {
      return initialState;
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  setColorScheme,
  toggleAnimations,
  setReducedMotion,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;

// Selectors
export const selectDarkMode = (state) => state.theme.darkMode;
export const selectColorScheme = (state) => state.theme.colorScheme;
export const selectAnimationsEnabled = (state) => state.theme.animationsEnabled;
export const selectReducedMotion = (state) => state.theme.reducedMotion;
