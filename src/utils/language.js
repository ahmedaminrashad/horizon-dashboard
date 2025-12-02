// Language utility functions
import { LANGUAGES } from '../enums/languagesEnum'

const LANGUAGE_STORAGE_KEY = 'app_language'

/**
 * Get the current language from localStorage or default to English
 * @returns {string} Language code (e.g., 'en', 'ar')
 */
export function getCurrentLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored && (stored === LANGUAGES.EN || stored === LANGUAGES.AR)) {
      return stored
    }
  } catch (error) {
    console.warn('Error reading language from localStorage:', error)
  }
  return LANGUAGES.EN // Default to English
}

/**
 * Set the current language in localStorage
 * @param {string} lang - Language code (e.g., 'en', 'ar')
 */
export function setCurrentLanguage(lang) {
  try {
    if (lang === LANGUAGES.EN || lang === LANGUAGES.AR) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } else {
      console.warn('Invalid language code:', lang)
    }
  } catch (error) {
    console.warn('Error saving language to localStorage:', error)
  }
}

