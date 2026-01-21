/**
 * Plugin system exports
 */

// Core
export * from './core';

// Built-in plugins
export * from './builtin';

// Types
export type {
  PluginMetadata,
  PluginOptions,
  MarkdownPlugin,
  PluginManagerConfig,
  PluginLoadResult,
  PluginRegistrationEvent,
} from '@shared/types';
