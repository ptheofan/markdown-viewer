/**
 * FileAssociationService - Handles file type association on macOS
 */
import { app } from 'electron';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { APP_CONFIG, MARKDOWN_EXTENSIONS } from '@shared/constants';

import type {
  FileAssociationResult,
  FileAssociationStatus,
} from '@shared/types';

/**
 * Markdown Uniform Type Identifiers for macOS
 */
const MARKDOWN_UTIS = [
  'net.daringfireball.markdown',
  'public.plain-text',
] as const;

/**
 * Service for handling file type associations on macOS
 */
export class FileAssociationService {
  private dutiPath: string | null = null;

  /**
   * Get path to bundled duti binary
   */
  private getDutiPath(): string {
    if (this.dutiPath) {
      return this.dutiPath;
    }

    if (app.isPackaged) {
      // In packaged app, resources are in process.resourcesPath
      this.dutiPath = path.join(process.resourcesPath, 'bin', 'duti');
    } else {
      // In development, use local resources directory
      this.dutiPath = path.join(app.getAppPath(), 'resources', 'bin', 'duti');
    }

    return this.dutiPath;
  }

  /**
   * Check if duti binary exists and is executable
   */
  private isDutiAvailable(): boolean {
    const dutiPath = this.getDutiPath();
    return existsSync(dutiPath);
  }

  /**
   * Check if we can set file associations
   * Only supported on macOS in packaged apps with duti available
   */
  canSetDefault(): boolean {
    if (process.platform !== 'darwin') {
      return false;
    }

    if (!app.isPackaged) {
      return false;
    }

    return this.isDutiAvailable();
  }

  /**
   * Check if app is currently the default handler for markdown files
   */
  isDefault(): boolean {
    if (!this.canSetDefault()) {
      return false;
    }

    try {
      const dutiPath = this.getDutiPath();
      // Check the primary markdown UTI
      const result = execSync(`"${dutiPath}" -x net.daringfireball.markdown`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      // Result format is like "com.aralu.markdown-viewer" or app name
      return (
        result.includes(APP_CONFIG.BUNDLE_ID) ||
        result.toLowerCase().includes('markdown viewer')
      );
    } catch {
      return false;
    }
  }

  /**
   * Get combined status
   */
  getStatus(): FileAssociationStatus {
    return {
      canSetDefault: this.canSetDefault(),
      isDefault: this.isDefault(),
    };
  }

  /**
   * Set app as default handler for markdown files
   */
  setAsDefault(): FileAssociationResult {
    if (process.platform !== 'darwin') {
      return { success: false, error: 'NOT_SUPPORTED' };
    }

    if (!app.isPackaged) {
      return { success: false, error: 'NOT_PACKAGED' };
    }

    const dutiPath = this.getDutiPath();

    if (!existsSync(dutiPath)) {
      return { success: false, error: 'DUTI_NOT_FOUND' };
    }

    try {
      // Set for each markdown UTI
      for (const uti of MARKDOWN_UTIS) {
        try {
          execSync(`"${dutiPath}" -s ${APP_CONFIG.BUNDLE_ID} ${uti} viewer`, {
            stdio: 'pipe',
          });
        } catch {
          // Some UTIs might not work on all systems, continue
        }
      }

      // Also set by extension for better coverage
      for (const ext of MARKDOWN_EXTENSIONS) {
        const extWithoutDot = ext.slice(1);
        try {
          execSync(
            `"${dutiPath}" -s ${APP_CONFIG.BUNDLE_ID} .${extWithoutDot} viewer`,
            { stdio: 'pipe' }
          );
        } catch {
          // Some extensions might not work, continue
        }
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message.toLowerCase().includes('permission')) {
        return { success: false, error: 'PERMISSION_DENIED' };
      }

      if (
        message.toLowerCase().includes('not found') ||
        message.includes('ENOENT')
      ) {
        return { success: false, error: 'DUTI_NOT_FOUND' };
      }

      return { success: false, error: 'UNKNOWN' };
    }
  }
}

/**
 * Singleton instance
 */
let serviceInstance: FileAssociationService | null = null;

/**
 * Get the FileAssociationService singleton instance
 */
export function getFileAssociationService(): FileAssociationService {
  if (!serviceInstance) {
    serviceInstance = new FileAssociationService();
  }
  return serviceInstance;
}
