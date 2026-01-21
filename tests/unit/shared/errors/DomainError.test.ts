import { describe, it, expect } from 'vitest';

import {
  DomainError,
  isDomainError,
  isSerializedError,
} from '../../../../src/shared/errors/DomainError';

// Concrete implementation for testing abstract class
class TestError extends DomainError {
  readonly code = 'TEST_ERROR';
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

class NonOperationalError extends DomainError {
  readonly code = 'NON_OPERATIONAL';
  readonly isOperational = false;

  constructor(message: string) {
    super(message);
  }
}

describe('DomainError', () => {
  describe('constructor', () => {
    it('should set message correctly', () => {
      const error = new TestError('Test message');
      expect(error.message).toBe('Test message');
    });

    it('should set name to constructor name', () => {
      const error = new TestError('Test message');
      expect(error.name).toBe('TestError');
    });

    it('should set empty context when not provided', () => {
      const error = new TestError('Test message');
      expect(error.context).toEqual({});
    });

    it('should set context when provided', () => {
      const context = { key: 'value', number: 42 };
      const error = new TestError('Test message', context);
      expect(error.context).toEqual(context);
    });

    it('should set timestamp', () => {
      const before = new Date();
      const error = new TestError('Test message');
      const after = new Date();

      expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should have a stack trace', () => {
      const error = new TestError('Test message');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TestError');
    });
  });

  describe('code and isOperational', () => {
    it('should expose code property', () => {
      const error = new TestError('Test message');
      expect(error.code).toBe('TEST_ERROR');
    });

    it('should expose isOperational property for operational errors', () => {
      const error = new TestError('Test message');
      expect(error.isOperational).toBe(true);
    });

    it('should expose isOperational property for non-operational errors', () => {
      const error = new NonOperationalError('Test message');
      expect(error.isOperational).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with all properties', () => {
      const context = { filePath: '/test/path' };
      const error = new TestError('Test message', context);
      const json = error.toJSON();

      expect(json['name']).toBe('TestError');
      expect(json['code']).toBe('TEST_ERROR');
      expect(json['message']).toBe('Test message');
      expect(json['context']).toEqual(context);
      expect(json['isOperational']).toBe(true);
      expect(json['timestamp']).toBeDefined();
      expect(json['stack']).toBeDefined();
    });

    it('should serialize timestamp as ISO string', () => {
      const error = new TestError('Test message');
      const json = error.toJSON();

      expect(typeof json['timestamp']).toBe('string');
      expect(new Date(json['timestamp'] as string).toISOString()).toBe(
        json['timestamp']
      );
    });
  });

  describe('toIpcError', () => {
    it('should create serializable representation', () => {
      const context = { key: 'value' };
      const error = new TestError('Test message', context);
      const ipcError = error.toIpcError();

      expect(ipcError).toEqual({
        name: 'TestError',
        code: 'TEST_ERROR',
        message: 'Test message',
        context: { key: 'value' },
        isOperational: true,
      });
    });

    it('should not include stack or timestamp in IPC error', () => {
      const error = new TestError('Test message');
      const ipcError = error.toIpcError();

      expect('stack' in ipcError).toBe(false);
      expect('timestamp' in ipcError).toBe(false);
    });
  });

  describe('toUserMessage', () => {
    it('should return message by default', () => {
      const error = new TestError('Test message');
      expect(error.toUserMessage()).toBe('Test message');
    });
  });

  describe('inheritance', () => {
    it('should be an instance of Error', () => {
      const error = new TestError('Test message');
      expect(error instanceof Error).toBe(true);
    });

    it('should be an instance of DomainError', () => {
      const error = new TestError('Test message');
      expect(error instanceof DomainError).toBe(true);
    });
  });
});

describe('isDomainError', () => {
  it('should return true for DomainError instances', () => {
    const error = new TestError('Test message');
    expect(isDomainError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Test message');
    expect(isDomainError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isDomainError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isDomainError(undefined)).toBe(false);
  });

  it('should return false for plain objects', () => {
    expect(isDomainError({ code: 'TEST', message: 'test' })).toBe(false);
  });
});

describe('isSerializedError', () => {
  it('should return true for valid serialized error', () => {
    const serialized = {
      name: 'TestError',
      code: 'TEST_ERROR',
      message: 'Test message',
      context: {},
      isOperational: true,
    };
    expect(isSerializedError(serialized)).toBe(true);
  });

  it('should return true for serialized error from toIpcError', () => {
    const error = new TestError('Test message');
    const serialized = error.toIpcError();
    expect(isSerializedError(serialized)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isSerializedError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isSerializedError(undefined)).toBe(false);
  });

  it('should return false for missing required properties', () => {
    expect(isSerializedError({ name: 'Test' })).toBe(false);
    expect(isSerializedError({ name: 'Test', code: 'TEST' })).toBe(false);
    expect(
      isSerializedError({ name: 'Test', code: 'TEST', message: 'test' })
    ).toBe(false);
  });

  it('should return false for wrong property types', () => {
    expect(
      isSerializedError({
        name: 123,
        code: 'TEST',
        message: 'test',
        isOperational: true,
      })
    ).toBe(false);
  });
});
