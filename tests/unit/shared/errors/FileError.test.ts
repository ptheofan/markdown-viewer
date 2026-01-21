import { describe, it, expect } from 'vitest';

import { DomainError } from '../../../../src/shared/errors/DomainError';
import {
  FileNotFoundError,
  FileReadError,
  FileWatchError,
  FileOperationCancelledError,
  InvalidFileTypeError,
  FileEncodingError,
} from '../../../../src/shared/errors/FileError';

describe('FileNotFoundError', () => {
  const filePath = '/path/to/missing/file.md';

  it('should extend DomainError', () => {
    const error = new FileNotFoundError(filePath);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new FileNotFoundError(filePath);
    expect(error.code).toBe('FILE_NOT_FOUND');
  });

  it('should be operational', () => {
    const error = new FileNotFoundError(filePath);
    expect(error.isOperational).toBe(true);
  });

  it('should include filePath in message', () => {
    const error = new FileNotFoundError(filePath);
    expect(error.message).toContain(filePath);
  });

  it('should include filePath in context', () => {
    const error = new FileNotFoundError(filePath);
    expect(error.context['filePath']).toBe(filePath);
  });

  it('should provide user-friendly message', () => {
    const error = new FileNotFoundError(filePath);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain(filePath);
    expect(userMessage).toContain('could not be found');
  });
});

describe('FileReadError', () => {
  const filePath = '/path/to/file.md';
  const reason = 'Permission denied';

  it('should extend DomainError', () => {
    const error = new FileReadError(filePath);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new FileReadError(filePath);
    expect(error.code).toBe('FILE_READ_ERROR');
  });

  it('should be operational', () => {
    const error = new FileReadError(filePath);
    expect(error.isOperational).toBe(true);
  });

  it('should include filePath in context', () => {
    const error = new FileReadError(filePath, reason);
    expect(error.context['filePath']).toBe(filePath);
  });

  it('should include reason in context when provided', () => {
    const error = new FileReadError(filePath, reason);
    expect(error.context['reason']).toBe(reason);
  });

  it('should use default reason when not provided', () => {
    const error = new FileReadError(filePath);
    expect(error.context['reason']).toBe('Unknown error');
  });

  it('should provide user-friendly message', () => {
    const error = new FileReadError(filePath);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain('Unable to read');
    expect(userMessage).toContain(filePath);
  });
});

describe('FileWatchError', () => {
  const filePath = '/path/to/file.md';
  const reason = 'Too many files open';

  it('should extend DomainError', () => {
    const error = new FileWatchError(filePath, reason);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new FileWatchError(filePath, reason);
    expect(error.code).toBe('FILE_WATCH_ERROR');
  });

  it('should be operational', () => {
    const error = new FileWatchError(filePath, reason);
    expect(error.isOperational).toBe(true);
  });

  it('should include filePath and reason in context', () => {
    const error = new FileWatchError(filePath, reason);
    expect(error.context['filePath']).toBe(filePath);
    expect(error.context['reason']).toBe(reason);
  });

  it('should provide user-friendly message', () => {
    const error = new FileWatchError(filePath, reason);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain('Unable to monitor');
  });
});

describe('FileOperationCancelledError', () => {
  const operation = 'open';

  it('should extend DomainError', () => {
    const error = new FileOperationCancelledError(operation);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new FileOperationCancelledError(operation);
    expect(error.code).toBe('FILE_OPERATION_CANCELLED');
  });

  it('should be operational', () => {
    const error = new FileOperationCancelledError(operation);
    expect(error.isOperational).toBe(true);
  });

  it('should include operation in context', () => {
    const error = new FileOperationCancelledError(operation);
    expect(error.context['operation']).toBe(operation);
  });

  it('should provide user-friendly message', () => {
    const error = new FileOperationCancelledError(operation);
    expect(error.toUserMessage()).toBe('Operation cancelled.');
  });
});

describe('InvalidFileTypeError', () => {
  const filePath = '/path/to/file.txt';
  const expectedTypes = ['.md', '.markdown'];

  it('should extend DomainError', () => {
    const error = new InvalidFileTypeError(filePath, expectedTypes);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new InvalidFileTypeError(filePath, expectedTypes);
    expect(error.code).toBe('INVALID_FILE_TYPE');
  });

  it('should be operational', () => {
    const error = new InvalidFileTypeError(filePath, expectedTypes);
    expect(error.isOperational).toBe(true);
  });

  it('should include filePath and expectedTypes in context', () => {
    const error = new InvalidFileTypeError(filePath, expectedTypes);
    expect(error.context['filePath']).toBe(filePath);
    expect(error.context['expectedTypes']).toEqual(expectedTypes);
  });

  it('should provide user-friendly message with expected types', () => {
    const error = new InvalidFileTypeError(filePath, expectedTypes);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain('not supported');
    expect(userMessage).toContain('.md');
    expect(userMessage).toContain('.markdown');
  });
});

describe('FileEncodingError', () => {
  const filePath = '/path/to/file.md';
  const detectedEncoding = 'ISO-8859-1';

  it('should extend DomainError', () => {
    const error = new FileEncodingError(filePath);
    expect(error instanceof DomainError).toBe(true);
  });

  it('should have correct code', () => {
    const error = new FileEncodingError(filePath);
    expect(error.code).toBe('FILE_ENCODING_ERROR');
  });

  it('should be operational', () => {
    const error = new FileEncodingError(filePath);
    expect(error.isOperational).toBe(true);
  });

  it('should include filePath in context', () => {
    const error = new FileEncodingError(filePath, detectedEncoding);
    expect(error.context['filePath']).toBe(filePath);
  });

  it('should include detectedEncoding in context when provided', () => {
    const error = new FileEncodingError(filePath, detectedEncoding);
    expect(error.context['detectedEncoding']).toBe(detectedEncoding);
  });

  it('should provide user-friendly message', () => {
    const error = new FileEncodingError(filePath);
    const userMessage = error.toUserMessage();
    expect(userMessage).toContain('unsupported text encoding');
  });
});
