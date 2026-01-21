/**
 * Preload script - Runs in an isolated context with access to Node.js
 * Exposes a secure API to the renderer process via contextBridge
 */
import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '@shared/types/api';

import type {
  ElectronAPI,
  FileChangeEvent,
  FileDeleteEvent,
  FileOpenResult,
  FileReadResult,
  ResolvedTheme,
  ThemeChangeEvent,
  ThemeMode,
} from '@shared/types';

/**
 * Create the API object to expose to renderer
 */
const electronAPI: ElectronAPI = {
  file: {
    openDialog: (): Promise<FileOpenResult> => {
      return ipcRenderer.invoke(IPC_CHANNELS.FILE.OPEN_DIALOG);
    },

    read: (filePath: string): Promise<FileReadResult> => {
      return ipcRenderer.invoke(IPC_CHANNELS.FILE.READ, filePath);
    },

    watch: (filePath: string): Promise<void> => {
      return ipcRenderer.invoke(IPC_CHANNELS.FILE.WATCH, filePath);
    },

    unwatch: (filePath: string): Promise<void> => {
      return ipcRenderer.invoke(IPC_CHANNELS.FILE.UNWATCH, filePath);
    },

    onFileChange: (callback: (event: FileChangeEvent) => void): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: FileChangeEvent
      ): void => {
        callback(data);
      };

      ipcRenderer.on(IPC_CHANNELS.FILE.ON_CHANGE, handler);

      // Return cleanup function
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.FILE.ON_CHANGE, handler);
      };
    },

    onFileDelete: (callback: (event: FileDeleteEvent) => void): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: FileDeleteEvent
      ): void => {
        callback(data);
      };

      ipcRenderer.on(IPC_CHANNELS.FILE.ON_DELETE, handler);

      // Return cleanup function
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.FILE.ON_DELETE, handler);
      };
    },
  },

  theme: {
    getCurrent: (): Promise<ThemeMode> => {
      return ipcRenderer.invoke(IPC_CHANNELS.THEME.GET_CURRENT);
    },

    set: (theme: ThemeMode): Promise<void> => {
      return ipcRenderer.invoke(IPC_CHANNELS.THEME.SET, theme);
    },

    getSystem: (): Promise<ResolvedTheme> => {
      return ipcRenderer.invoke(IPC_CHANNELS.THEME.GET_SYSTEM);
    },

    onSystemChange: (
      callback: (event: ThemeChangeEvent) => void
    ): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: ThemeChangeEvent
      ): void => {
        callback(data);
      };

      ipcRenderer.on(IPC_CHANNELS.THEME.ON_SYSTEM_CHANGE, handler);

      // Return cleanup function
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.THEME.ON_SYSTEM_CHANGE, handler);
      };
    },
  },

  app: {
    getVersion: (): string => {
      return process.env['npm_package_version'] ?? '1.0.0';
    },

    getPlatform: (): NodeJS.Platform => {
      return process.platform;
    },
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
