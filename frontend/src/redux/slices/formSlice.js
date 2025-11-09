import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  contactForm: {
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    message: '',
    isSubmitting: false,
    submitted: false,
    errors: {},
  },
  quoteForm: {
    projectType: '',
    location: '',
    startDate: '',
    duration: '',
    height: '',
    area: '',
    additionalRequirements: '',
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      company: '',
    },
    isSubmitting: false,
    submitted: false,
    errors: {},
  },
  newsletter: {
    email: '',
    isSubscribing: false,
    subscribed: false,
    error: null,
  },
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    // Contact Form Actions
    updateContactForm: (state, action) => {
      state.contactForm = { ...state.contactForm, ...action.payload };
    },
    setContactFormSubmitting: (state, action) => {
      state.contactForm.isSubmitting = action.payload;
    },
    setContactFormSubmitted: (state, action) => {
      state.contactForm.submitted = action.payload;
    },
    setContactFormErrors: (state, action) => {
      state.contactForm.errors = action.payload;
    },
    resetContactForm: (state) => {
      state.contactForm = initialState.contactForm;
    },

    // Quote Form Actions
    updateQuoteForm: (state, action) => {
      state.quoteForm = { ...state.quoteForm, ...action.payload };
    },
    updateQuoteFormContact: (state, action) => {
      state.quoteForm.contactInfo = { ...state.quoteForm.contactInfo, ...action.payload };
    },
    setQuoteFormSubmitting: (state, action) => {
      state.quoteForm.isSubmitting = action.payload;
    },
    setQuoteFormSubmitted: (state, action) => {
      state.quoteForm.submitted = action.payload;
    },
    setQuoteFormErrors: (state, action) => {
      state.quoteForm.errors = action.payload;
    },
    resetQuoteForm: (state) => {
      state.quoteForm = initialState.quoteForm;
    },

    // Newsletter Actions
    updateNewsletterEmail: (state, action) => {
      state.newsletter.email = action.payload;
    },
    setNewsletterSubscribing: (state, action) => {
      state.newsletter.isSubscribing = action.payload;
    },
    setNewsletterSubscribed: (state, action) => {
      state.newsletter.subscribed = action.payload;
    },
    setNewsletterError: (state, action) => {
      state.newsletter.error = action.payload;
    },
    resetNewsletter: (state) => {
      state.newsletter = initialState.newsletter;
    },

    // Reset All Forms
    resetAllForms: (state) => {
      return initialState;
    },
  },
});

export const {
  updateContactForm,
  setContactFormSubmitting,
  setContactFormSubmitted,
  setContactFormErrors,
  resetContactForm,
  updateQuoteForm,
  updateQuoteFormContact,
  setQuoteFormSubmitting,
  setQuoteFormSubmitted,
  setQuoteFormErrors,
  resetQuoteForm,
  updateNewsletterEmail,
  setNewsletterSubscribing,
  setNewsletterSubscribed,
  setNewsletterError,
  resetNewsletter,
  resetAllForms,
} = formSlice.actions;

export default formSlice.reducer;

// Selectors
export const selectContactForm = (state) => state.form.contactForm;
export const selectQuoteForm = (state) => state.form.quoteForm;
export const selectNewsletter = (state) => state.form.newsletter;
