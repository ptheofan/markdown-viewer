import { DomainError } from './DomainError';

/**
 * Error thrown when a plugin fails to load
 */
export class PluginLoadError extends DomainError {
  readonly code = 'PLUGIN_LOAD_ERROR';
  readonly isOperational = true;

  constructor(pluginId: string, reason: string) {
    super(`Failed to load plugin '${pluginId}': ${reason}`, {
      pluginId,
      reason,
    });
  }

  override toUserMessage(): string {
    const pluginId = this.context['pluginId'] as string;
    return `The plugin "${pluginId}" could not be loaded. Some features may be unavailable.`;
  }
}

/**
 * Error thrown when a plugin fails to initialize
 */
export class PluginInitError extends DomainError {
  readonly code = 'PLUGIN_INIT_ERROR';
  readonly isOperational = true;

  constructor(pluginId: string, reason?: string) {
    super(`Failed to initialize plugin '${pluginId}'`, {
      pluginId,
      reason: reason ?? 'Unknown error',
    });
  }

  override toUserMessage(): string {
    const pluginId = this.context['pluginId'] as string;
    return `The plugin "${pluginId}" failed to start properly. Some features may not work correctly.`;
  }
}

/**
 * Error thrown when a plugin is not found
 */
export class PluginNotFoundError extends DomainError {
  readonly code = 'PLUGIN_NOT_FOUND';
  readonly isOperational = true;

  constructor(pluginId: string) {
    super(`Plugin not found: '${pluginId}'`, { pluginId });
  }

  override toUserMessage(): string {
    const pluginId = this.context['pluginId'] as string;
    return `The plugin "${pluginId}" is not installed.`;
  }
}

/**
 * Error thrown when a plugin is already registered
 */
export class PluginAlreadyRegisteredError extends DomainError {
  readonly code = 'PLUGIN_ALREADY_REGISTERED';
  readonly isOperational = true;

  constructor(pluginId: string) {
    super(`Plugin already registered: '${pluginId}'`, { pluginId });
  }

  override toUserMessage(): string {
    const pluginId = this.context['pluginId'] as string;
    return `The plugin "${pluginId}" is already active.`;
  }
}

/**
 * Error thrown when plugin rendering fails
 */
export class PluginRenderError extends DomainError {
  readonly code = 'PLUGIN_RENDER_ERROR';
  readonly isOperational = true;

  constructor(pluginId: string, reason: string) {
    super(`Plugin '${pluginId}' render failed: ${reason}`, {
      pluginId,
      reason,
    });
  }

  override toUserMessage(): string {
    const pluginId = this.context['pluginId'] as string;
    return `The "${pluginId}" plugin encountered an error while rendering content.`;
  }
}

/**
 * Error thrown when a plugin has invalid configuration
 */
export class PluginConfigError extends DomainError {
  readonly code = 'PLUGIN_CONFIG_ERROR';
  readonly isOperational = true;

  constructor(pluginId: string, configKey: string, reason: string) {
    super(`Invalid plugin configuration for '${pluginId}': ${reason}`, {
      pluginId,
      configKey,
      reason,
    });
  }

  override toUserMessage(): string {
    const pluginId = this.context['pluginId'] as string;
    return `The plugin "${pluginId}" has an invalid configuration. Please check its settings.`;
  }
}
