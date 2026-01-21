/**
 * StatusBar - Component for displaying file and watch status
 */

/**
 * StatusBar state
 */
export interface StatusBarState {
  filePath: string | null;
  modifiedTime: Date | null;
  isWatching: boolean;
}

/**
 * StatusBar component
 */
export class StatusBar {
  private element: HTMLElement;
  private filePathElement: HTMLElement | null = null;
  private modifiedElement: HTMLElement | null = null;
  private watchElement: HTMLElement | null = null;
  private watchTextElement: HTMLElement | null = null;
  private state: StatusBarState = {
    filePath: null,
    modifiedTime: null,
    isWatching: false,
  };

  constructor(element: HTMLElement) {
    this.element = element;
    this.cacheElements();
  }

  /**
   * Cache DOM element references
   */
  private cacheElements(): void {
    this.filePathElement = this.element.querySelector('#status-file-path');
    this.modifiedElement = this.element.querySelector('#status-modified');
    this.watchElement = this.element.querySelector('#status-watch');
    this.watchTextElement = this.element.querySelector('#status-watch-text');
  }

  /**
   * Update the file path display
   */
  setFilePath(filePath: string | null): void {
    this.state.filePath = filePath;

    if (this.filePathElement) {
      if (filePath) {
        // Show abbreviated path (just file name and parent directory)
        const parts = filePath.split('/');
        const abbreviated = parts.length > 2
          ? `.../${parts.slice(-2).join('/')}`
          : filePath;
        this.filePathElement.textContent = abbreviated;
        this.filePathElement.title = filePath;
      } else {
        this.filePathElement.textContent = 'No file';
        this.filePathElement.title = '';
      }
    }
  }

  /**
   * Update the modified time display
   */
  setModifiedTime(modifiedTime: Date | null): void {
    this.state.modifiedTime = modifiedTime;

    if (this.modifiedElement) {
      if (modifiedTime) {
        this.modifiedElement.textContent = this.formatTime(modifiedTime);
        this.modifiedElement.title = modifiedTime.toLocaleString();
      } else {
        this.modifiedElement.textContent = '';
        this.modifiedElement.title = '';
      }
    }
  }

  /**
   * Update the watch status display
   */
  setWatching(isWatching: boolean): void {
    this.state.isWatching = isWatching;

    if (this.watchElement && this.watchTextElement) {
      if (isWatching) {
        this.watchElement.classList.add('watching');
        this.watchTextElement.textContent = 'Watching';
        this.watchElement.title = 'Auto-refresh is enabled';
      } else {
        this.watchElement.classList.remove('watching');
        this.watchTextElement.textContent = 'Not watching';
        this.watchElement.title = 'Auto-refresh is disabled';
      }
    }
  }

  /**
   * Format time as relative or absolute
   */
  private formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) {
      return 'Modified just now';
    } else if (diffMin < 60) {
      return `Modified ${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `Modified ${diffHour}h ago`;
    } else {
      return `Modified ${date.toLocaleDateString()}`;
    }
  }

  /**
   * Clear all status information
   */
  clear(): void {
    this.setFilePath(null);
    this.setModifiedTime(null);
    this.setWatching(false);
  }

  /**
   * Get current state
   */
  getState(): Readonly<StatusBarState> {
    return { ...this.state };
  }
}

/**
 * Factory function to create a StatusBar
 */
export function createStatusBar(element: HTMLElement): StatusBar {
  return new StatusBar(element);
}
