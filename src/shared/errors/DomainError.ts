/**
 * Base class for all domain-specific errors in the application.
 * Provides consistent error structure with codes, context, and serialization.
 */
export abstract class DomainError extends Error {
  /**
   * Unique error code for identification and handling
   */
  abstract readonly code: string;

  /**
   * Whether this error is operational (expected) vs programming error
   * Operational errors can be recovered from; programming errors should crash
   */
  abstract readonly isOperational: boolean;

  /**
   * Additional context data for debugging and logging
   */
  readonly context: Record<string, unknown>;

  /**
   * Timestamp when the error occurred
   */
  readonly timestamp: Date;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context ?? {};
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error for IPC transfer or logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      isOperational: this.isOperational,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Create a serializable representation for IPC
   */
  toIpcError(): SerializedError {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      isOperational: this.isOperational,
    };
  }

  /**
   * Create a user-friendly error message
   */
  toUserMessage(): string {
    return this.message;
  }
}

/**
 * Serialized error format for IPC transfer
 */
export interface SerializedError {
  name: string;
  code: string;
  message: string;
  context: Record<string, unknown>;
  isOperational: boolean;
}

/**
 * Type guard to check if an error is a DomainError
 */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/**
 * Type guard to check if an object is a SerializedError
 */
export function isSerializedError(obj: unknown): obj is SerializedError {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate['name'] === 'string' &&
    typeof candidate['code'] === 'string' &&
    typeof candidate['message'] === 'string' &&
    typeof candidate['isOperational'] === 'boolean'
  );
}
