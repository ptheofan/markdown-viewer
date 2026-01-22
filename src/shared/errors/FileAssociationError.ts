import { DomainError } from './DomainError';
import type { FileAssociationErrorCode } from '@shared/types';

/**
 * Error thrown when file association operations fail
 */
export class FileAssociationError extends DomainError {
  readonly code = 'FILE_ASSOCIATION_ERROR';
  readonly isOperational = true;

  constructor(
    public readonly errorCode: FileAssociationErrorCode,
    message: string,
    originalError?: Error
  ) {
    super(message, {
      errorCode,
      originalError: originalError?.message,
    });
  }

  override toUserMessage(): string {
    switch (this.errorCode) {
      case 'NOT_SUPPORTED':
        return 'File associations are not supported on this platform.';
      case 'NOT_PACKAGED':
        return 'File associations can only be set from the packaged application.';
      case 'PERMISSION_DENIED':
        return 'Permission denied. Please try again or set the default app manually in System Preferences.';
      case 'DUTI_NOT_FOUND':
        return 'The file association tool was not found. Please reinstall the application.';
      default:
        return 'Failed to set file association. Please try again.';
    }
  }
}
