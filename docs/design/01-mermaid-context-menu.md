# Mermaid Diagram Context Menu - Technical Design Document

**Author:** Claude / Paris Theofanidis
**Date:** 2025-01-21
**Status:** Approved

---

## 1. Problem Statement

Users cannot easily export or share Mermaid diagrams rendered in the markdown viewer. Currently, the only way to share a diagram is to copy the raw markdown source manually, which doesn't help when sharing with non-technical users or when a visual representation is needed.

**Why now?** This is a core usability feature for a markdown viewer with diagram support. Users expect right-click functionality on visual elements.

---

## 2. Goals & Non-Goals

### Goals

- Enable right-click context menu on rendered Mermaid diagrams
- Support copying diagram as: raw code, PNG image, mermaid.live link, image+link combo
- Support saving diagram as PNG file
- Provide visual feedback (highlight on target, toast on action)
- Design for extensibility (other plugins can add their own context menus)
- Ensure clipboard content works when pasted into Google Docs

### Non-Goals

- Context menu for other elements (code blocks, images) — future feature
- Copy as SVG format — not requested
- Custom keyboard shortcuts for copy actions — not in scope
- Drag-and-drop export — not in scope
- Multiple diagram selection — single diagram at a time only

---

## 3. Proposed Solution

Extend the plugin system to support context menus. Each plugin can optionally provide menu items for elements it renders. A centralized ClipboardService in the main process handles all clipboard and file operations.

### 3.1 Architecture

This feature follows Clean Architecture principles:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            RENDERER PROCESS                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Presentation Layer                          │   │
│  │  MarkdownViewer: contextmenu listener, highlight, toast          │   │
│  └───────────────────────────────┬─────────────────────────────────┘   │
│                                  │                                      │
│  ┌───────────────────────────────▼─────────────────────────────────┐   │
│  │                      Application Layer                           │   │
│  │  PluginManager: getPlugin(), getPlugins()                        │   │
│  └───────────────────────────────┬─────────────────────────────────┘   │
│                                  │                                      │
│  ┌───────────────────────────────▼─────────────────────────────────┐   │
│  │                        Plugin Layer                              │   │
│  │  MermaidPlugin: getContextMenuItems(), getContextMenuData()      │   │
│  │  (Future: SyntaxHighlightPlugin, etc.)                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │ IPC (via preload)                    │
├──────────────────────────────────┼─────────────────────────────────────┤
│                            MAIN PROCESS                                 │
│  ┌───────────────────────────────▼─────────────────────────────────┐   │
│  │                     Infrastructure Layer                         │   │
│  │  ContextMenuService: show native menu, return selection          │   │
│  │  ClipboardService: write text/html/image, save file              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Layer Responsibilities:**
- **Presentation**: UI events, visual feedback, user notifications
- **Application**: Coordination, plugin discovery, routing
- **Plugin**: Domain logic for specific content types (Mermaid, Syntax, etc.)
- **Infrastructure**: System operations (clipboard, dialogs, file I/O)

**Why Plugin-Based?**
- **Extensible**: SyntaxHighlightPlugin can add "Copy as Image" for code blocks in the future
- **Encapsulated**: Each plugin knows how to export its own content
- **Consistent**: All plugins use same pattern and ClipboardService
- **Maintainable**: Adding new export formats is isolated to the plugin

### 3.2 Module Boundaries

| Module | Exposes | Consumes |
|--------|---------|----------|
| `shared/types/plugin` | `ContextMenuItem`, `ContextMenuData`, extended `MarkdownPlugin` | — |
| `shared/types/api` | `IPC_CHANNELS.CONTEXT_MENU`, `IPC_CHANNELS.CLIPBOARD`, `ClipboardAPI`, `ContextMenuAPI` | — |
| `plugins/MermaidPlugin` | `getContextMenuItems()`, `getContextMenuData()` | DOM APIs, pako |
| `plugins/PluginManager` | `getPlugin(id)`, `getPlugins()` | `MarkdownPlugin` interface |
| `renderer/MarkdownViewer` | — | `PluginManager`, `electronAPI.contextMenu`, `electronAPI.clipboard` |
| `main/ContextMenuService` | `show(items, position)` | Electron `Menu` |
| `main/ClipboardService` | `writeText()`, `writeHtml()`, `writeImage()`, `saveFile()` | Electron `clipboard`, `dialog`, `fs` |
| `preload` | `electronAPI.contextMenu`, `electronAPI.clipboard` | IPC channels |

### 3.3 Context Menu Behavior

- **Trigger**: Right-click on any rendered Mermaid diagram
- **Menu Type**: Native Electron context menu (not custom HTML dropdown)
- **Behavior**: Replaces default browser context menu entirely
- **Visual Feedback**: Show subtle border/highlight on the targeted diagram when right-clicked
- **Scope**: Applies to ALL rendered Mermaid diagrams regardless of type (flowchart, sequence, gantt, etc.)

### 3.4 Menu Options Specification

| ID | Label | Description |
|----|-------|-------------|
| `copy-code` | Copy Mermaid Code | Copy raw diagram code to clipboard (without fence markers) |
| `copy-image` | Copy as Image | Copy rendered diagram as PNG to clipboard |
| `copy-mermaid-live` | Copy as Mermaid Live | Copy clickable link to mermaid.live editor |
| `copy-image-with-link` | Copy as Image with Link | Copy image + link below as single paste |
| `save-png` | Save as PNG... | Open save dialog to export diagram as PNG file |

#### Copy Mermaid Code
- Copy **only** the raw Mermaid diagram code
- Exclude ` ```mermaid ` fence markers
- Output type: `text`

#### Copy as Image (PNG)
- Resolution: **1x** (standard, not retina)
- Background: **Transparent**
- Padding: **16px** around diagram
- Format: PNG
- Output type: `image`

#### Copy as Mermaid Live
- Generate link to `https://mermaid.live/edit#pako:...`
- Encode diagram code using pako compression + base64 (mermaid.live format)
- Copy as **HTML**: `<a href="https://mermaid.live/edit#...">Mermaid Diagram</a>`
- This allows direct paste into Google Docs as clickable link
- Output type: `html`

#### Copy as Image with Link
- Combine image and link in single clipboard write
- Format: **HTML with embedded base64 image**
  ```html
  <img src="data:image/png;base64,..."/><br/><a href="https://mermaid.live/...">Mermaid Diagram</a>
  ```
- Link appears **directly below** image (single `<br/>`, no extra spacing)
- Target: Pasteable into Google Docs
- Output type: `html`
- **Note**: If base64 HTML doesn't work reliably in Google Docs, revisit approach

#### Save as PNG
- Open native save dialog
- Default filename: `mermaid-diagram.png`
- Same image specs as "Copy as Image" (1x, transparent, 16px padding)
- Output type: `file-save`

### 3.5 Data Model

#### ContextMenuItem

```typescript
interface ContextMenuItem {
  id: string;        // Unique within plugin (e.g., 'copy-code')
  label: string;     // Display text (e.g., 'Copy Mermaid Code')
  enabled: boolean;  // Clickable state (default: true)
}
```

#### ContextMenuData

```typescript
interface ContextMenuData {
  type: 'text' | 'html' | 'image' | 'file-save';
  content: string;      // Text/HTML content, or base64 for images
  mimeType?: string;    // e.g., 'image/png'
  filename?: string;    // Suggested name for file-save
}
```

#### ContextMenuShowRequest (IPC Payload)

```typescript
interface ContextMenuShowRequest {
  items: ContextMenuItem[];
  x: number;  // Screen coordinates
  y: number;
}
```

#### SaveFileResult (IPC Response)

```typescript
interface SaveFileResult {
  success: boolean;
  filePath?: string;    // Actual path if saved
  cancelled?: boolean;  // True if user cancelled dialog
}
```

### 3.6 API Design

#### Plugin Interface Extension

```typescript
// Additions to MarkdownPlugin in src/shared/types/plugin.ts
interface MarkdownPlugin {
  // ... existing methods ...

  /**
   * Get context menu items for a right-clicked element
   * @returns Menu items if plugin owns element, null otherwise
   */
  getContextMenuItems?: (element: HTMLElement) => ContextMenuItem[] | null;

  /**
   * Generate data for a selected menu item
   * @returns Data to write to clipboard or save to file
   */
  getContextMenuData?: (
    element: HTMLElement,
    menuItemId: string
  ) => Promise<ContextMenuData>;
}
```

#### PluginManager Additions

```typescript
// Additions to PluginManager in src/plugins/core/PluginManager.ts
interface PluginManager {
  // ... existing methods ...

  getPlugin(pluginId: string): MarkdownPlugin | undefined;
  getPlugins(): IterableIterator<MarkdownPlugin>;
}
```

#### ClipboardAPI (Preload)

```typescript
interface ClipboardAPI {
  writeText(text: string): Promise<void>;
  writeHtml(html: string): Promise<void>;
  writeImage(base64: string): Promise<void>;
  saveFile(base64: string, filename: string, mimeType: string): Promise<SaveFileResult>;
}
```

#### ContextMenuAPI (Preload)

```typescript
interface ContextMenuAPI {
  show(request: ContextMenuShowRequest): Promise<string | null>;
}
```

#### IPC Channels

```typescript
// Additions to IPC_CHANNELS in src/shared/types/api.ts
CONTEXT_MENU: {
  SHOW: 'context-menu:show',
},
CLIPBOARD: {
  WRITE_TEXT: 'clipboard:write-text',
  WRITE_HTML: 'clipboard:write-html',
  WRITE_IMAGE: 'clipboard:write-image',
  SAVE_FILE: 'clipboard:save-file',
}
```

### 3.7 Data Flows

#### Flow 1: Right-Click → Show Menu

```
1. User right-clicks on Mermaid diagram
   │
2. MarkdownViewer.contextmenu handler fires
   │
3. Find plugin element: element.closest('[data-plugin-id]')
   │  └─ If not found → allow default browser menu, EXIT
   │
4. Highlight the element (add CSS class)
   │
5. Get menu items from plugin:
   │  pluginManager.getPlugin(pluginId).getContextMenuItems(element)
   │  └─ If null or empty → remove highlight, EXIT
   │
6. Send to main process:
   │  window.electronAPI.contextMenu.show(items)
   │
7. Main process builds native Menu and shows it
   │
8. User selects item (or dismisses)
   │
9. Main returns selected item ID (or null)
   │
10. Remove highlight from element
```

#### Flow 2: Menu Item Selected → Execute Action

```
1. Receive selected menuItemId from main process
   │  └─ If null (dismissed) → EXIT
   │
2. Get data from plugin:
   │  plugin.getContextMenuData(element, menuItemId)
   │  └─ Async operation (may need to render PNG)
   │
3. Route based on data.type:
   │
   ├─ 'text'      → electronAPI.clipboard.writeText(content)
   ├─ 'html'      → electronAPI.clipboard.writeHtml(content)
   ├─ 'image'     → electronAPI.clipboard.writeImage(content)
   └─ 'file-save' → electronAPI.clipboard.saveFile(content, filename)
   │
4. Handle response:
   │
   ├─ Success → Show success toast
   ├─ Error   → Show error toast with message
   └─ Cancelled (file-save only) → No toast
```

#### Flow 3: MermaidPlugin Data Generation

```
getContextMenuData(element, menuItemId)
│
├─ 'copy-code'
│   └─ Return { type: 'text', content: decodedMermaidSource }
│
├─ 'copy-image'
│   ├─ Get SVG from element
│   ├─ Convert SVG to PNG (canvas)
│   ├─ Add 16px padding, transparent background
│   └─ Return { type: 'image', content: base64PNG }
│
├─ 'copy-mermaid-live'
│   ├─ Encode source with pako compression
│   ├─ Build URL: https://mermaid.live/edit#pako:{encoded}
│   ├─ Wrap in HTML anchor tag
│   └─ Return { type: 'html', content: '<a href="...">Mermaid Diagram</a>' }
│
├─ 'copy-image-with-link'
│   ├─ Generate PNG (same as copy-image)
│   ├─ Generate Mermaid Live URL
│   ├─ Combine: <img src="data:..."/><br/><a href="...">Mermaid Diagram</a>
│   └─ Return { type: 'html', content: combinedHtml }
│
└─ 'save-png'
    ├─ Generate PNG (same as copy-image)
    └─ Return { type: 'file-save', content: base64PNG, filename: 'mermaid-diagram.png' }
```

### 3.8 Component Specifications

#### MarkdownViewer (Renderer)

**Responsibilities:**
- Listen for `contextmenu` events on viewer container
- Find plugin-rendered element from click target
- Coordinate with plugins to get menu items
- Show/hide highlight on target element
- Execute clipboard actions based on plugin data
- Show toast notifications

**State:**
- `highlightedElement: HTMLElement | null`

#### MermaidPlugin (Renderer)

**Data Attributes on Rendered Elements:**
- `data-plugin-id="mermaid"` — Identifies plugin ownership
- `data-mermaid-source="{base64}"` — Preserved source code (persists after render)

**New Methods:**
- `getContextMenuItems(element)` — Return 5 menu items
- `getContextMenuData(element, menuItemId)` — Generate requested data
- `renderToPng(element)` — Convert SVG to PNG with padding
- `generateMermaidLiveUrl(code)` — Encode for mermaid.live

#### ContextMenuService (Main)

**Input:** `{ items: ContextMenuItem[], x: number, y: number }`
**Output:** `Promise<string | null>` (selected item ID or null if dismissed)

**Responsibilities:**
- Build native Electron `Menu` from items array
- Show menu at specified position
- Return selected item ID via promise resolution

#### ClipboardService (Main)

| Method | Input | Output | Electron API Used |
|--------|-------|--------|-------------------|
| `writeText` | `string` | `void` | `clipboard.writeText()` |
| `writeHtml` | `string` | `void` | `clipboard.writeHTML()` |
| `writeImage` | `base64: string` | `void` | `clipboard.writeImage(nativeImage.createFromDataURL())` |
| `saveFile` | `base64, filename` | `SaveFileResult` | `dialog.showSaveDialog()` + `fs.writeFile()` |

### 3.9 DOM Structure

#### Mermaid Container (After Render)

```html
<div class="mermaid-container mermaid-rendered"
     data-plugin-id="mermaid"
     data-mermaid-source="{base64-encoded-source}">
  <svg>
    <!-- Rendered Mermaid diagram -->
  </svg>
</div>
```

#### Highlight State

```html
<div class="mermaid-container mermaid-rendered context-menu-target" ...>
```

### 3.10 CSS Classes

| Class | Purpose |
|-------|---------|
| `.mermaid-container` | Base container for all Mermaid diagrams |
| `.mermaid-rendered` | Successfully rendered diagram |
| `.mermaid-error-container` | Diagram with render error |
| `.context-menu-target` | Currently highlighted element (on right-click) |
| `.toast` | Toast notification base |
| `.toast-success` | Success toast styling (green, 2s auto-dismiss) |
| `.toast-error` | Error toast styling (red, 4s auto-dismiss) |

### 3.11 Error Handling

#### Domain Errors

| Error Class | When Thrown | Data Included |
|-------------|-------------|---------------|
| `PluginNotFoundError` | `getPlugin()` called with unknown ID | `pluginId: string` |
| `ContextMenuDataError` | Plugin fails to generate data | `pluginId: string`, `menuItemId: string`, `cause: Error` |
| `ClipboardWriteError` | Clipboard operation fails | `operation: string`, `cause: Error` |
| `FileSaveError` | File save operation fails | `filename: string`, `cause: Error` |
| `ImageRenderError` | SVG-to-PNG conversion fails | `diagramId: string`, `cause: Error` |

#### Error Scenarios & User Feedback

| Scenario | Detection | User Feedback |
|----------|-----------|---------------|
| Plugin not found | `getPlugin()` returns undefined | Error toast: "Plugin not found" |
| Element not owned by plugin | `getContextMenuItems()` returns null | Default browser menu (no error) |
| Diagram failed to render | `.mermaid-error-container` class present | Error toast when menu item clicked |
| PNG generation fails | Exception in `renderToPng()` | Error toast: "Failed to generate image" |
| Clipboard write fails | Exception in ClipboardService | Error toast: "Failed to copy to clipboard" |
| Save dialog cancelled | `cancelled: true` in response | No toast (silent) |
| File write fails | Exception in `fs.writeFile()` | Error toast: "Failed to save file" |

#### Error Flow

```
Plugin/Service throws domain error
        ↓
Caught at MarkdownViewer level
        ↓
Error logged to console (for debugging)
        ↓
User-friendly toast displayed
        ↓
Operation gracefully aborted
```

### 3.12 Toast Notifications

| Action | Success Message | Error Message |
|--------|-----------------|---------------|
| Copy Mermaid Code | "Copied to clipboard" | "Failed to copy: {reason}" |
| Copy as Image | "Image copied to clipboard" | "Failed to copy image: {reason}" |
| Copy as Mermaid Live | "Link copied to clipboard" | "Failed to copy: {reason}" |
| Copy as Image with Link | "Copied to clipboard" | "Failed to copy: {reason}" |
| Save as PNG | "Saved to {filename}" | "Failed to save: {reason}" |

---

## 4. Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Plugin-based context menu** | Extensible, encapsulated, follows existing patterns | More complex initial implementation | **Selected** |
| Hardcoded menu in MarkdownViewer | Simpler, faster to implement | Not extensible, violates single responsibility | Rejected |
| Custom HTML dropdown menu | Full styling control | Non-native feel, accessibility concerns, more code | Rejected |
| Clipboard operations in renderer | Simpler IPC | Security concerns, Electron best practices discourage | Rejected |
| Store source in JS Map instead of DOM | Cleaner DOM | Lost on re-render, memory management complexity | Rejected |

---

## 5. Testing Strategy

### Unit Tests

**ClipboardService** (`tests/unit/main/services/ClipboardService.test.ts`)
- `writeText()` calls `clipboard.writeText()` with correct value
- `writeHtml()` calls `clipboard.writeHTML()` with correct value
- `writeImage()` creates NativeImage from base64, writes to clipboard
- `saveFile()` shows dialog, writes file on confirm, returns result
- `saveFile()` returns cancelled:true when dialog dismissed

**ContextMenuService** (`tests/unit/main/services/ContextMenuService.test.ts`)
- `show()` builds Menu with correct items
- `show()` returns selected item ID
- `show()` returns null when dismissed
- Disabled items are not clickable

**MermaidPlugin context menu** (`tests/unit/plugins/builtin/MermaidPlugin.test.ts`)
- `getContextMenuItems()` returns null for non-mermaid elements
- `getContextMenuItems()` returns 5 items for valid mermaid container
- `getContextMenuItems()` returns enabled:false for image options on error containers
- `getContextMenuData()` returns correct type/content for each menu item
- `generateMermaidLiveUrl()` produces valid mermaid.live URL
- `renderToPng()` produces valid base64 PNG with correct dimensions

**PluginManager** (`tests/unit/plugins/core/PluginManager.test.ts`)
- `getPlugin()` returns plugin by ID
- `getPlugin()` returns undefined for unknown ID
- `getPlugins()` iterates all registered plugins

### Integration Tests

**Context menu flow** (`tests/integration/context-menu.test.ts`)
- Right-click on Mermaid diagram triggers context menu via IPC
- Menu item selection triggers data generation and clipboard write
- Error in plugin surfaces as toast, not crash

### E2E Tests

**Critical path** (`tests/e2e/mermaid-context-menu.spec.ts`)
- Right-click on diagram shows native context menu
- "Copy Mermaid Code" copies raw code to clipboard
- "Copy as Image" copies PNG to clipboard (verify via paste)
- "Save as PNG" opens dialog, saves file, file is valid PNG

---

## 6. Migration / Rollout Plan

- [ ] **Feature flag**: No — this is additive, doesn't change existing behavior
- [ ] **Database migrations**: N/A — no persistence changes
- [ ] **Backward compatibility**: Fully backward compatible
  - Existing MermaidPlugin continues to work
  - New methods are optional in plugin interface
  - No changes to markdown rendering

**Rollout Steps:**
1. Implement in feature branch
2. Test locally with sample markdown files
3. Verify Google Docs paste behavior
4. Merge to main
5. Include in next release

---

## 7. Resolved Questions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Does mermaid.js bundle pako? | **No** — add `pako` as dependency | Verified: not in node_modules |
| Toast dismissible by click? | **Auto-dismiss only** | Simpler UX, standard pattern |
| Default filename format? | **`mermaid-diagram.png`** | Simpler; diagram type requires parsing |
| Track analytics? | **No** | Desktop app, no telemetry needed |

---

## 8. Dependencies

**New Dependencies Required:**

| Package | Purpose | Type |
|---------|---------|------|
| `pako` | Compression for mermaid.live URL encoding | Production |

**Install:**
```bash
pnpm add pako
pnpm add -D @types/pako
```

---

## 9. File Structure

### New Files

```
src/main/services/ClipboardService.ts
src/main/services/ContextMenuService.ts
src/main/ipc/handlers/ClipboardHandler.ts
src/main/ipc/handlers/ContextMenuHandler.ts
src/renderer/components/Toast.ts
```

### Modified Files

```
src/shared/types/plugin.ts      — Add context menu types
src/shared/types/api.ts         — Add IPC channels
src/shared/types/index.ts       — Export new types
src/preload/preload.ts          — Expose clipboard/contextMenu APIs
src/plugins/builtin/MermaidPlugin.ts — Implement context menu methods
src/plugins/core/PluginManager.ts    — Add getPlugin() method
src/renderer/components/MarkdownViewer.ts — Add context menu handling
src/index.css                   — Add highlight + toast styles
```

---

## 10. References

- [Electron Clipboard API](https://www.electronjs.org/docs/latest/api/clipboard)
- [Electron Menu API](https://www.electronjs.org/docs/latest/api/menu)
- [Electron Dialog API](https://www.electronjs.org/docs/latest/api/dialog)
- [Mermaid Live Editor](https://mermaid.live)
- [Web Clipboard Deep Dive](https://alexharri.com/blog/clipboard)
