/**
 * MarkdownViewer - Component for rendering and displaying markdown content
 */
import {
  PluginManager,
  createPluginManager,
  createGithubFlavoredPlugin,
  createSyntaxHighlightPlugin,
  createMermaidPlugin,
  MermaidPlugin,
} from '@plugins/index';
import { BUILTIN_PLUGINS } from '@shared/constants';

/**
 * State for the markdown viewer
 */
export interface MarkdownViewerState {
  content: string;
  filePath: string | null;
  isRendering: boolean;
}

/**
 * MarkdownViewer component
 */
export class MarkdownViewer {
  private container: HTMLElement;
  private pluginManager: PluginManager;
  private state: MarkdownViewerState = {
    content: '',
    filePath: null,
    isRendering: false,
  };
  private initialized = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.pluginManager = createPluginManager({
      html: true,
      linkify: true,
      typographer: true,
    });
  }

  /**
   * Initialize the viewer and plugins
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Register plugin factories
    this.pluginManager.registerPluginFactory(
      BUILTIN_PLUGINS.GITHUB_FLAVORED,
      createGithubFlavoredPlugin
    );
    this.pluginManager.registerPluginFactory(
      BUILTIN_PLUGINS.SYNTAX_HIGHLIGHT,
      createSyntaxHighlightPlugin
    );
    this.pluginManager.registerPluginFactory(
      BUILTIN_PLUGINS.MERMAID,
      createMermaidPlugin
    );

    // Enable all built-in plugins
    await this.pluginManager.enablePlugins([
      BUILTIN_PLUGINS.GITHUB_FLAVORED,
      BUILTIN_PLUGINS.SYNTAX_HIGHLIGHT,
      BUILTIN_PLUGINS.MERMAID,
    ]);

    // Apply plugin styles
    this.applyPluginStyles();

    this.initialized = true;
  }

  /**
   * Apply plugin CSS styles to the document
   */
  private applyPluginStyles(): void {
    const styleContainer = document.getElementById('plugin-styles');
    if (styleContainer) {
      const styles = this.pluginManager.getPluginStyles();
      styleContainer.textContent = styles.join('\n');
    }
  }

  /**
   * Render markdown content
   */
  async render(markdown: string, filePath?: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.state.isRendering = true;
    this.state.content = markdown;
    if (filePath) {
      this.state.filePath = filePath;
    }

    try {
      // Render markdown to HTML
      const html = this.pluginManager.render(markdown);
      this.container.innerHTML = html;

      // Run post-render hooks (for Mermaid diagrams, etc.)
      await this.pluginManager.postRender(this.container);
    } catch (error) {
      console.error('Render error:', error);
      this.container.innerHTML = `
        <div class="render-error">
          <h3>Render Error</h3>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      `;
    } finally {
      this.state.isRendering = false;
    }
  }

  /**
   * Clear the viewer content
   */
  clear(): void {
    this.container.innerHTML = '';
    this.state.content = '';
    this.state.filePath = null;
  }

  /**
   * Get current state
   */
  getState(): Readonly<MarkdownViewerState> {
    return { ...this.state };
  }

  /**
   * Get the container element
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * Check if viewer is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Scroll to a specific heading by ID
   */
  scrollToHeading(headingId: string): void {
    const heading = this.container.querySelector(`#${CSS.escape(headingId)}`);
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Scroll to top
   */
  scrollToTop(): void {
    this.container.scrollTop = 0;
  }

  /**
   * Set theme for theme-aware plugins (like Mermaid)
   * Re-renders content if there's any loaded
   */
  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    // Update Mermaid plugin theme
    const mermaidPlugin = this.pluginManager.getPlugin<MermaidPlugin>(BUILTIN_PLUGINS.MERMAID);
    if (mermaidPlugin && 'setTheme' in mermaidPlugin) {
      mermaidPlugin.setTheme(theme);
    }

    // Re-render if we have content
    if (this.state.content) {
      await this.render(this.state.content, this.state.filePath ?? undefined);
    }
  }
}

/**
 * Factory function to create a MarkdownViewer
 */
export function createMarkdownViewer(container: HTMLElement): MarkdownViewer {
  return new MarkdownViewer(container);
}
