/**
 * Theme mode setting
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Resolved theme (actual applied theme, not 'system')
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Theme definition
 */
export interface Theme {
  id: string;
  name: string;
  mode: ResolvedTheme;
  cssPath: string;
}

/**
 * Theme configuration stored in preferences
 */
export interface ThemeConfig {
  currentTheme: ThemeMode;
  customThemes: Theme[];
}

/**
 * Theme change event
 */
export interface ThemeChangeEvent {
  theme: ResolvedTheme;
  isSystemChange: boolean;
}
