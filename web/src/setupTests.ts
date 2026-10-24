import '@testing-library/jest-dom/vitest'
import i18n from './i18n'

// Tests assert on English copy; pin the language so a stray localStorage
// value or jsdom's navigator.language can't make this non-deterministic.
i18n.changeLanguage('en')
