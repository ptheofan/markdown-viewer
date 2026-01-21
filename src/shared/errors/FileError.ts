import { DomainError } from './DomainError';

/**
 * Error thrown when a file is not found
 */
export class FileNotFoundError extends DomainError {
  readonly code = 'FILE_NOT_FOUND';
  readonly isOperational = true;

  constructor(filePath: string) {
    super(`File not found: ${filePath}`, { filePath });
  }

  override toUserMessage(): string {
    const filePath = this.context['filePath'] as string;
    return `The file "${filePath}" could not be found. It may have been moved or deleted.`;
  }
}

/**
 * Error thrown when a file cannot be read
 */
export class FileReadError extends DomainError {
  readonly code = 'FILE_READ_ERROR';
  readonly isOperational = true;

  constructor(filePath: string, reason?: string) {
    super(`Failed to read file: ${filePath}`, {
      filePath,
      reason: reason ?? 'Unknown error',
    });
  }

  override toUserMessage(): string {
    const filePath = this.context['filePath'] as string;
    return `Unable to read the file "${filePath}". Please check that you have permission to access this file.`;
  }
}

/**
 * Error thrown when a file cannot be watched
 */
export class FileWatchError extends DomainError {
  readonly code = 'FILE_WATCH_ERROR';
  readonly isOperational = true;

  constructor(filePath: string, reason: string) {
    super(`Failed to watch file: ${reason}`, { filePath, reason });
  }

  override toUserMessage(): string {
    return 'Unable to monitor file for changes. Auto-refresh may not work.';
  }
}

/**
 * Error thrown when a file operation is cancelled by the user
 */
export class FileOperationCancelledError extends DomainError {
  readonly code = 'FILE_OPERATION_CANCELLED';
  readonly isOperational = true;

  constructor(operation: string) {
    super(`File operation cancelled: ${operation}`, { operation });
  }

  override toUserMessage(): string {
    return 'Operation cancelled.';
  }
}

/**
 * Error thrown when a file has an invalid type
 */
export class InvalidFileTypeError extends DomainError {
  readonly code = 'INVALID_FILE_TYPE';
  readonly isOperational = true;

  constructor(filePath: string, expectedTypes: string[]) {
    super(`Invalid file type for: ${filePath}`, {
      filePath,
      expectedTypes,
    });
  }

  override toUserMessage(): string {
    const expectedTypes = this.context['expectedTypes'] as string[];
    return `This file type is not supported. Please select a ${expectedTypes.join(' or ')} file.`;
  }
}

/**
 * Error thrown when file encoding cannot be determined or is unsupported
 */
export class FileEncodingError extends DomainError {
  readonly code = 'FILE_ENCODING_ERROR';
  readonly isOperational = true;

  constructor(filePath: string, detectedEncoding?: string) {
    super(`Unable to read file encoding: ${filePath}`, {
      filePath,
      detectedEncoding,
    });
  }

  override toUserMessage(): string {
    return 'This file appears to use an unsupported text encoding.';
  }
}
