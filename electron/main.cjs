const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Ensure single instance of Ice Talk POS
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[App] Another instance is already running. Quitting duplicate.');
  app.quit();
}

let mainWindow = null;

function startBackendServerIfNeeded() {
  try {
    const possiblePaths = [
      path.join(__dirname, '../server/src/server.js'),
      path.join(app.getAppPath(), 'server/src/server.js'),
      path.join(process.resourcesPath, 'app/server/src/server.js'),
      path.join(process.resourcesPath, 'app.asar.unpacked/server/src/server.js'),
      path.join(process.resourcesPath, 'server/src/server.js'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        console.log('[Backend] Initializing server script from:', p);
        require(p);
        console.log('[Backend] Initialized internal server successfully.');
        return;
      }
    }
    console.warn('[Backend] Server script not found at standard paths; assuming external service or dev server.');
  } catch (err) {
    console.log('[Backend] Server notice / initialization info:', err.message);
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0F0F12',
    title: 'Ice Talk POS — Family Restaurant',
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const distHtml = path.join(__dirname, '../client/dist/index.html');
  const targetUrl = process.env.ELECTRON_START_URL || 'http://localhost:5000';

  let attempts = 0;
  const maxAttempts = 30;

  const loadWithRetry = () => {
    if (!mainWindow) return;

    attempts++;
    mainWindow.loadURL(targetUrl).catch((err) => {
      if (attempts < maxAttempts) {
        console.log(`[App] Connecting to ${targetUrl}, retrying (${attempts}/${maxAttempts})...`);
        setTimeout(loadWithRetry, 1000);
      } else if (fs.existsSync(distHtml)) {
        console.log('[App] Loading local production build fallback:', distHtml);
        mainWindow.loadFile(distHtml);
      } else {
        console.error('[App] Failed to connect to server after multiple attempts:', err.message);
      }
    });
  };

  loadWithRetry();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Focus existing window if a second instance is launched
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// IPC: Get all available printers connected to the machine
ipcMain.handle('printer:get-list', async () => {
  try {
    if (!mainWindow) return [];
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers;
  } catch (error) {
    console.error('Failed to get printers:', error);
    return [];
  }
});

// IPC: Direct Silent HTML Thermal Print via hidden off-screen window (Recommended for receipts)
ipcMain.handle('printer:print-html', async (event, { html, options = {} }) => {
  return new Promise(async (resolve) => {
    let printWin = null;
    try {
      printWin = new BrowserWindow({
        show: false,
        width: 380,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // Determine target printer: use specified printer or auto-detect system default printer
      let targetPrinterName = (options.printerName || '').trim();
      try {
        const printers = await printWin.webContents.getPrintersAsync();
        if (!targetPrinterName && printers && printers.length > 0) {
          const defaultPrinter = printers.find((p) => p.isDefault) || printers[0];
          if (defaultPrinter) targetPrinterName = defaultPrinter.name;
        }
      } catch (pErr) {
        console.warn('Could not query system printers:', pErr);
      }

      const paperWidth = options.paperWidth || '80mm';
      const cssWidth = paperWidth === '58mm' ? '54mm' : '72mm';

      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Ice Talk Thermal Print</title>
            <style>
              @page {
                margin: 0;
                size: ${paperWidth === '58mm' ? '58mm auto' : '80mm auto'};
              }
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              body {
                margin: 0;
                padding: 4px;
                font-family: 'Courier New', Courier, monospace;
                font-size: 11px;
                line-height: 1.25;
                color: #000;
                background: #fff;
                width: ${cssWidth};
                max-width: ${cssWidth};
              }
              table { width: 100%; border-collapse: collapse; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .items-center { align-items: center; }
              .items-start { align-items: flex-start; }
              .flex-1 { flex: 1 1 0%; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .font-black, .font-extrabold { font-weight: 900; }
              .uppercase { text-transform: uppercase; }
              .border-b { border-bottom: 1px dashed #000; }
              .border-t { border-top: 1px dashed #000; }
              .border-dashed { border-style: dashed; }
              .border-dotted { border-style: dotted; }
              .divider { border-top: 1px dashed #000; margin: 6px 0; }
              .space-y-0\\.5 > * + * { margin-top: 2px; }
              .space-y-1 > * + * { margin-top: 4px; }
              .space-y-2 > * + * { margin-top: 8px; }
              .p-1 { padding: 4px; }
              .p-1\\.5 { padding: 6px; }
              .p-2 { padding: 8px; }
              .p-3 { padding: 12px; }
              .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
              .py-1 { padding-top: 4px; padding-bottom: 4px; }
              .py-1\\.5 { padding-top: 6px; padding-bottom: 6px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .pb-1 { padding-bottom: 4px; }
              .pb-2 { padding-bottom: 8px; }
              .pt-1 { padding-top: 4px; }
              .pt-1\\.5 { padding-top: 6px; }
              .pt-3 { padding-top: 12px; }
              .pr-1 { padding-right: 4px; }
              .mt-1 { margin-top: 4px; }
              .mt-2 { margin-top: 8px; }
              .mb-1 { margin-bottom: 4px; }
              .text-\\[8px\\] { font-size: 8px; }
              .text-\\[9px\\] { font-size: 9px; }
              .text-\\[10px\\] { font-size: 10px; }
              .text-\\[11px\\] { font-size: 11px; }
              .text-\\[12px\\] { font-size: 12px; }
              .text-\\[13px\\] { font-size: 13px; }
              .text-sm { font-size: 14px; }
              .text-xs { font-size: 12px; }
              .text-neutral-500, .text-neutral-600, .text-neutral-700, .text-neutral-800 { color: #222; }
              .text-emerald-800 { color: #000; font-weight: bold; }
              .text-red-600 { color: #000; font-weight: bold; }
              .bg-black { background-color: #000; color: #fff; }
              .text-white { color: #fff; }
              .bg-neutral-100, .bg-neutral-200 { background-color: #eee; }
              .rounded { border-radius: 2px; }
              .w-1\\/2 { width: 50%; }
              .w-1\\/6 { width: 16.666%; }
              .w-1\\/3 { width: 33.333%; }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;

      printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`);

      printWin.webContents.on('did-finish-load', () => {
        setTimeout(() => {
          const printOptions = {
            silent: true,
            printBackground: true,
            margins: {
              marginType: 'none',
            },
          };

          if (targetPrinterName) {
            printOptions.deviceName = targetPrinterName;
          }

          printWin.webContents.print(printOptions, (success, failureReason) => {
            try {
              printWin.destroy();
            } catch (e) {}

            if (!success) {
              console.error('Silent HTML print failed:', failureReason);
              resolve({ success: false, error: failureReason });
            } else {
              console.log('Silent receipt printed successfully to:', targetPrinterName || 'Default Printer');
              resolve({ success: true, printer: targetPrinterName || 'Default Printer' });
            }
          });
        }, 120);
      });
    } catch (err) {
      if (printWin) {
        try { printWin.destroy(); } catch (e) {}
      }
      console.error('Print HTML error:', err);
      resolve({ success: false, error: err.message });
    }
  });
});

// IPC: Silent Print using main window webContents (Fallback)
ipcMain.handle('printer:print-silent', async (event, options = {}) => {
  return new Promise(async (resolve) => {
    if (!mainWindow) {
      return resolve({ success: false, error: 'Main window not available' });
    }

    try {
      let targetPrinterName = (options.printerName || '').trim();
      if (!targetPrinterName) {
        const printers = await mainWindow.webContents.getPrintersAsync();
        const defaultPrinter = printers.find((p) => p.isDefault) || printers[0];
        if (defaultPrinter) targetPrinterName = defaultPrinter.name;
      }

      const printOptions = {
        silent: true,
        printBackground: true,
        margins: {
          marginType: 'none',
        },
      };

      if (targetPrinterName) {
        printOptions.deviceName = targetPrinterName;
      }

      mainWindow.webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          console.error('Silent print failed:', failureReason);
          resolve({ success: false, error: failureReason });
        } else {
          console.log('Silent print completed successfully.');
          resolve({ success: true });
        }
      });
    } catch (err) {
      console.error('Silent print error:', err);
      resolve({ success: false, error: err.message });
    }
  });
});

app.whenReady().then(() => {
  if (gotTheLock) {
    startBackendServerIfNeeded();
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && gotTheLock) {
    createWindow();
  }
});
