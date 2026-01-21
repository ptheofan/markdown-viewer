/**
 * ThemeService - Manages theme preferences and system theme detection
 */
import { nativeTheme, app } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';

import type { ThemeMode, ResolvedTheme } from '@shared/types';

/**
 * Theme preferences stored on disk
 */
interface ThemePreferences {
  theme: ThemeMode;
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: ThemePreferences = {
  theme: 'system',
};

/**
 * ThemeService handles theme management
 */
export class ThemeService {
  private preferencesPath: string;
  private preferences: ThemePreferences = { ...DEFAULT_PREFERENCES };
  private initialized = false;

  constructor(preferencesDir?: string) {
    const dir = preferencesDir ?? app.getPath('userData');
    this.preferencesPath = path.join(dir, 'theme-preferences.json');
  }

  /**
   * Initialize the service and load preferences
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadPreferences();
    } catch {
      // Use defaults if preferences can't be loaded
      this.preferences = { ...DEFAULT_PREFERENCES };
    }

    this.initialized = true;
  }

  /**
   * Get the current theme preference
   */
  getCurrentTheme(): ThemeMode {
    return this.preferences.theme;
  }

  /**
   * Set the theme preference
   */
  async setTheme(theme: ThemeMode): Promise<void> {
    this.preferences.theme = theme;
    await this.savePreferences();
  }

  /**
   * Get the system theme (light or dark)
   */
  getSystemTheme(): ResolvedTheme {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }

  /**
   * Subscribe to system theme changes
   * Returns a cleanup function to unsubscribe
   */
  onSystemThemeChange(callback: (theme: ResolvedTheme) => void): () => void {
    const handler = (): void => {
      callback(this.getSystemTheme());
    };

    nativeTheme.on('updated', handler);

    return () => {
      nativeTheme.off('updated', handler);
    };
  }

  /**
   * Load preferences from disk
   */
  private async loadPreferences(): Promise<void> {
    try {
      const data = await fs.readFile(this.preferencesPath, 'utf-8');
      const parsed = JSON.parse(data) as Partial<ThemePreferences>;

      // Validate and merge with defaults
      if (parsed.theme && this.isValidThemeMode(parsed.theme)) {
        this.preferences.theme = parsed.theme;
      }
    } catch (error) {
      // File doesn't exist or is invalid - use defaults
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('Failed to load theme preferences:', error);
      }
    }
  }

  /**
   * Save preferences to disk
   */
  private async savePreferences(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.preferencesPath);
      await fs.mkdir(dir, { recursive: true });

      // Write preferences
      await fs.writeFile(
        this.preferencesPath,
        JSON.stringify(this.preferences, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to save theme preferences:', error);
      throw error;
    }
  }

  /**
   * Check if a value is a valid ThemeMode
   */
  private isValidThemeMode(value: unknown): value is ThemeMode {
    return value === 'light' || value === 'dark' || value === 'system';
  }

  /**
   * Get the preferences file path (for testing)
   */
  getPreferencesPath(): string {
    return this.preferencesPath;
  }
}

// Singleton instance
let themeServiceInstance: ThemeService | null = null;

/**
 * Get the singleton ThemeService instance
 */
export function getThemeService(): ThemeService {
  if (!themeServiceInstance) {
    themeServiceInstance = new ThemeService();
  }
  return themeServiceInstance;
}

/**
 * Create a new ThemeService instance (for testing)
 */
export function createThemeService(preferencesDir?: string): ThemeService {
  return new ThemeService(preferencesDir);
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetThemeService(): void {
  themeServiceInstance = null;
}
