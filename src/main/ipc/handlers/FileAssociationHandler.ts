/**
 * FileAssociationHandler - IPC handlers for file association operations
 */
import { ipcMain } from 'electron';

import {
  getFileAssociationService,
  FileAssociationService,
} from '@main/services/FileAssociationService';
import { IPC_CHANNELS } from '@shared/types/api';

import type {
  FileAssociationResult,
  FileAssociationStatus,
} from '@shared/types';

/**
 * Register file association IPC handlers
 */
export function registerFileAssociationHandlers(
  service?: FileAssociationService
): void {
  const fileAssociationService = service ?? getFileAssociationService();

  // Get current file association status
  ipcMain.handle(
    IPC_CHANNELS.FILE_ASSOCIATION.GET_STATUS,
    (): FileAssociationStatus => {
      return fileAssociationService.getStatus();
    }
  );

  // Set app as default handler for markdown files
  ipcMain.handle(
    IPC_CHANNELS.FILE_ASSOCIATION.SET_AS_DEFAULT,
    (): FileAssociationResult => {
      return fileAssociationService.setAsDefault();
    }
  );
}

/**
 * Unregister file association IPC handlers
 */
export function unregisterFileAssociationHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.FILE_ASSOCIATION.GET_STATUS);
  ipcMain.removeHandler(IPC_CHANNELS.FILE_ASSOCIATION.SET_AS_DEFAULT);
}
