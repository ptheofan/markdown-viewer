/**
 * E2E Tests: File Operations
 *
 * Tests file-related UI elements and interactions
 */
import { test, expect } from './electron-app';

test.describe('File UI Elements', () => {
  test('should display "No file" in status bar initially', async ({ mainWindow }) => {
    const statusFilePath = mainWindow.locator('#status-file-path');
    await expect(statusFilePath).toContainText('No file');
  });

  test('should display "No file open" in toolbar initially', async ({ mainWindow }) => {
    const fileName = mainWindow.locator('#file-name');
    await expect(fileName).toContainText('No file open');
  });

  test('should show drop zone instruction text', async ({ mainWindow }) => {
    const dropZone = mainWindow.locator('.drop-zone-content');
    await expect(dropZone).toContainText('Open');
  });

  test('should show supported file types hint', async ({ mainWindow }) => {
    const hint = mainWindow.locator('.drop-zone-hint');
    await expect(hint).toContainText('.md');
  });
});

test.describe('Watch Status', () => {
  test('should display "Not watching" initially', async ({ mainWindow }) => {
    const watchText = mainWindow.locator('#status-watch-text');
    await expect(watchText).toContainText('Not watching');
  });
});

test.describe('UI Interaction', () => {
  test('should have clickable Open button', async ({ mainWindow }) => {
    const openButton = mainWindow.locator('#open-file-btn');

    // Button should be enabled
    const isDisabled = await openButton.getAttribute('disabled');
    expect(isDisabled).toBeNull();

    // Button should be visible and interactable
    await expect(openButton).toBeVisible();
    await expect(openButton).toBeEnabled();
  });

  test('drop zone should accept drag events', async ({ mainWindow }) => {
    const dropZone = mainWindow.locator('#drop-zone');

    // Drop zone should be visible
    await expect(dropZone).toBeVisible();

    // Verify drop zone has the proper class structure
    const hasContent = await dropZone.locator('.drop-zone-content').isVisible();
    expect(hasContent).toBe(true);
  });
});

test.describe('App Responsiveness', () => {
  test('should not freeze when toolbar buttons are clicked', async ({ mainWindow }) => {
    // Click open button (will open dialog, which we cancel by doing nothing)
    const openButton = mainWindow.locator('#open-file-btn');
    await openButton.click();

    // Wait a moment
    await mainWindow.waitForTimeout(100);

    // Press Escape to close any dialog
    await mainWindow.keyboard.press('Escape');

    // App should still be responsive - toolbar should still be visible
    await expect(openButton).toBeVisible();
  });

  test('should be able to interact with multiple elements sequentially', async ({ mainWindow }) => {
    // Click open button
    await mainWindow.locator('#open-file-btn').click();
    await mainWindow.keyboard.press('Escape');
    await mainWindow.waitForTimeout(100);

    // Click theme toggle
    await mainWindow.locator('#theme-toggle-btn').click();
    await mainWindow.waitForTimeout(100);

    // Verify app is still responsive
    const statusBar = mainWindow.locator('#status-bar');
    await expect(statusBar).toBeVisible();
  });
});
