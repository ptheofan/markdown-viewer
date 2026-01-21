import { describe, it, expect } from 'vitest';

import { DomainError } from '../../../../src/shared/errors/DomainError';
import {
  PluginLoadError,
  PluginInitError,
  PluginNotFoundError,
  PluginAlreadyRegisteredError,
  PluginRenderError,
  PluginConfigError,
} from '../../../../src/shared/errors/PluginError';

describe('PluginLoadError', () => {
  const pluginId = 'mermaid';
  const reason = 'Module not found';

  it('should extend DomainError', () => {
    const error = new PluginLoadError(pluginId, reason);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new PluginLoadError(pluginId, reason);
    expect(error.code).toBe('PLUGIN_LOAD_ERROR');
  });

  it('should be operational', () => {
    const error = new PluginLoadError(pluginId, reason);
    expect(error.isOperational).toBe(true);
  });

  it('should include pluginId in message', () => {
    const error = new PluginLoadError(pluginId, reason);
    expect(error.message).toContain(pluginId);
    expect(error.message).toContain(reason);
  });

  it('should include pluginId and reason in context', () => {
    const error = new PluginLoadError(pluginId, reason);
    expect(error.context['pluginId']).toBe(pluginId);
    expect(error.context['reason']).toBe(reason);
  });

  it('should provide user-friendly message', () => {
    const error = new PluginLoadError(pluginId, reason);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain(pluginId);
    expect(userMessage).toContain('could not be loaded');
  });
});

describe('PluginInitError', () => {
  const pluginId = 'syntax-highlight';
  const reason = 'Failed to load highlight.js';

  it('should extend DomainError', () => {
    const error = new PluginInitError(pluginId);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new PluginInitError(pluginId);
    expect(error.code).toBe('PLUGIN_INIT_ERROR');
  });

  it('should be operational', () => {
    const error = new PluginInitError(pluginId);
    expect(error.isOperational).toBe(true);
  });

  it('should include pluginId in message', () => {
    const error = new PluginInitError(pluginId);
    expect(error.message).toContain(pluginId);
  });

  it('should include pluginId in context', () => {
    const error = new PluginInitError(pluginId, reason);
    expect(error.context['pluginId']).toBe(pluginId);
  });

  it('should include reason in context when provided', () => {
    const error = new PluginInitError(pluginId, reason);
    expect(error.context['reason']).toBe(reason);
  });

  it('should use default reason when not provided', () => {
    const error = new PluginInitError(pluginId);
    expect(error.context['reason']).toBe('Unknown error');
  });

  it('should provide user-friendly message', () => {
    const error = new PluginInitError(pluginId);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain(pluginId);
    expect(userMessage).toContain('failed to start');
  });
});

describe('PluginNotFoundError', () => {
  const pluginId = 'unknown-plugin';

  it('should extend DomainError', () => {
    const error = new PluginNotFoundError(pluginId);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new PluginNotFoundError(pluginId);
    expect(error.code).toBe('PLUGIN_NOT_FOUND');
  });

  it('should be operational', () => {
    const error = new PluginNotFoundError(pluginId);
    expect(error.isOperational).toBe(true);
  });

  it('should include pluginId in message', () => {
    const error = new PluginNotFoundError(pluginId);
    expect(error.message).toContain(pluginId);
  });

  it('should include pluginId in context', () => {
    const error = new PluginNotFoundError(pluginId);
    expect(error.context['pluginId']).toBe(pluginId);
  });

  it('should provide user-friendly message', () => {
    const error = new PluginNotFoundError(pluginId);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain(pluginId);
    expect(userMessage).toContain('not installed');
  });
});

describe('PluginAlreadyRegisteredError', () => {
  const pluginId = 'mermaid';

  it('should extend DomainError', () => {
    const error = new PluginAlreadyRegisteredError(pluginId);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new PluginAlreadyRegisteredError(pluginId);
    expect(error.code).toBe('PLUGIN_ALREADY_REGISTERED');
  });

  it('should be operational', () => {
    const error = new PluginAlreadyRegisteredError(pluginId);
    expect(error.isOperational).toBe(true);
  });

  it('should include pluginId in message', () => {
    const error = new PluginAlreadyRegisteredError(pluginId);
    expect(error.message).toContain(pluginId);
  });

  it('should include pluginId in context', () => {
    const error = new PluginAlreadyRegisteredError(pluginId);
    expect(error.context['pluginId']).toBe(pluginId);
  });

  it('should provide user-friendly message', () => {
    const error = new PluginAlreadyRegisteredError(pluginId);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain(pluginId);
    expect(userMessage).toContain('already active');
  });
});

describe('PluginRenderError', () => {
  const pluginId = 'mermaid';
  const reason = 'Invalid diagram syntax';

  it('should extend DomainError', () => {
    const error = new PluginRenderError(pluginId, reason);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new PluginRenderError(pluginId, reason);
    expect(error.code).toBe('PLUGIN_RENDER_ERROR');
  });

  it('should be operational', () => {
    const error = new PluginRenderError(pluginId, reason);
    expect(error.isOperational).toBe(true);
  });

  it('should include pluginId and reason in message', () => {
    const error = new PluginRenderError(pluginId, reason);
    expect(error.message).toContain(pluginId);
    expect(error.message).toContain(reason);
  });

  it('should include pluginId and reason in context', () => {
    const error = new PluginRenderError(pluginId, reason);
    expect(error.context['pluginId']).toBe(pluginId);
    expect(error.context['reason']).toBe(reason);
  });

  it('should provide user-friendly message', () => {
    const error = new PluginRenderError(pluginId, reason);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain(pluginId);
    expect(userMessage).toContain('error while rendering');
  });
});

describe('PluginConfigError', () => {
  const pluginId = 'syntax-highlight';
  const configKey = 'theme';
  const reason = 'Invalid theme name';

  it('should extend DomainError', () => {
    const error = new PluginConfigError(pluginId, configKey, reason);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new PluginConfigError(pluginId, configKey, reason);
    expect(error.code).toBe('PLUGIN_CONFIG_ERROR');
  });

  it('should be operational', () => {
    const error = new PluginConfigError(pluginId, configKey, reason);
    expect(error.isOperational).toBe(true);
  });

  it('should include pluginId and reason in message', () => {
    const error = new PluginConfigError(pluginId, configKey, reason);
    expect(error.message).toContain(pluginId);
    expect(error.message).toContain(reason);
  });

  it('should include pluginId, configKey, and reason in context', () => {
    const error = new PluginConfigError(pluginId, configKey, reason);
    expect(error.context['pluginId']).toBe(pluginId);
    expect(error.context['configKey']).toBe(configKey);
    expect(error.context['reason']).toBe(reason);
  });

  it('should provide user-friendly message', () => {
    const error = new PluginConfigError(pluginId, configKey, reason);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain(pluginId);
    expect(userMessage).toContain('invalid configuration');
  });
});
