import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMobileMenuOpen: false,
  activeSection: 'home',
  scrollPosition: 0,
  isScrollingDown: false,
  showBackToTop: false,
  breadcrumbs: [],
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.isMobileMenuOpen = action.payload;
    },
    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
    },
    setScrollPosition: (state, action) => {
      const newPosition = action.payload;
      state.isScrollingDown = newPosition > state.scrollPosition;
      state.scrollPosition = newPosition;
      state.showBackToTop = newPosition > 300;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload);
    },
    removeBreadcrumb: (state) => {
      state.breadcrumbs.pop();
    },
    resetNavigation: (state) => {
      return initialState;
    },
  },
});

export const {
  toggleMobileMenu,
  setMobileMenuOpen,
  setActiveSection,
  setScrollPosition,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  resetNavigation,
} = navigationSlice.actions;

export default navigationSlice.reducer;

// Selectors
export const selectMobileMenuOpen = (state) => state.navigation.isMobileMenuOpen;
export const selectActiveSection = (state) => state.navigation.activeSection;
export const selectScrollPosition = (state) => state.navigation.scrollPosition;
export const selectIsScrollingDown = (state) => state.navigation.isScrollingDown;
export const selectShowBackToTop = (state) => state.navigation.showBackToTop;
export const selectBreadcrumbs = (state) => state.navigation.breadcrumbs;
