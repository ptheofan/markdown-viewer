import type MarkdownIt from 'markdown-it';

/**
 * Plugin metadata for identification and display
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
}

/**
 * Plugin configuration options
 */
export type PluginOptions = Record<string, unknown>;

/**
 * Interface that all markdown plugins must implement
 */
export interface MarkdownPlugin {
  /**
   * Plugin identification and metadata
   */
  metadata: PluginMetadata;

  /**
   * Called when plugin is registered, before apply()
   * Use for async initialization (e.g., loading external resources)
   */
  initialize?: () => Promise<void> | void;

  /**
   * Apply markdown-it plugin modifications
   * @param md - The markdown-it instance to modify
   */
  apply: (md: MarkdownIt) => void;

  /**
   * Get CSS styles to inject for this plugin
   * @returns CSS string(s) or path(s) to CSS files
   */
  getStyles?: () => string | string[];

  /**
   * Post-render processing hook
   * Called after HTML is rendered and inserted into DOM
   * Use for plugins that need to modify rendered content (e.g., Mermaid)
   * @param container - The container element with rendered content
   */
  postRender?: (container: HTMLElement) => Promise<void> | void;

  /**
   * Cleanup when plugin is unregistered
   * Use for releasing resources
   */
  destroy?: () => Promise<void> | void;
}

/**
 * Plugin manager configuration
 */
export interface PluginManagerConfig {
  enabledPlugins: string[];
  pluginOptions: Record<string, PluginOptions>;
}

/**
 * Result of loading a plugin
 */
export interface PluginLoadResult {
  success: boolean;
  pluginId: string;
  error?: string;
}

/**
 * Plugin registration event
 */
export interface PluginRegistrationEvent {
  pluginId: string;
  metadata: PluginMetadata;
  action: 'registered' | 'unregistered';
}
