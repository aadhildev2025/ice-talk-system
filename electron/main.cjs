const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const http = require('http');

process.env.IS_DESKTOP = 'true';

// Auto-detect portable execution environment
if (!process.env.PORTABLE_EXECUTABLE_DIR && process.resourcesPath && !process.resourcesPath.includes('node_modules')) {
  const exeDir = path.dirname(process.execPath);
  if (fs.existsSync(path.join(exeDir, 'is-portable.txt')) || fs.existsSync(path.join(exeDir, 'ice-talk-data'))) {
    process.env.PORTABLE_EXECUTABLE_DIR = exeDir;
  }
}

// In portable mode: Redirect userData, localStorage, cookies and logs directly into ice-talk-data next to the executable.
// This ensures all login sessions, thermal printer settings, and local database remain 100% portable on any PC or USB drive.
if (process.env.PORTABLE_EXECUTABLE_DIR) {
  const portableDataDir = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'ice-talk-data');
  const portableUserData = path.join(portableDataDir, 'user-data');
  try {
    if (!fs.existsSync(portableUserData)) {
      fs.mkdirSync(portableUserData, { recursive: true });
    }
    app.setPath('userData', portableUserData);
  } catch (err) {
    console.error('Failed to configure portable userData:', err);
  }
}

const logDir = app.getPath('userData');
const logFile = path.join(logDir, 'app_boot.log');
function bootLog(...args) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${args.join(' ')}\n`);
  } catch (_) {}
}
bootLog('=== Ice Talk POS Boot ===', 'PID:', process.pid, 'PortableDir:', process.env.PORTABLE_EXECUTABLE_DIR || 'N/A', 'Argv:', process.argv.join(' '));

// Prevent unhandled EADDRINUSE from throwing a fatal crash dialog
process.on('uncaughtException', (err) => {
  bootLog('[Uncaught Exception]:', err && err.stack ? err.stack : err);
  if (err && (err.code === 'EADDRINUSE' || (err.message && err.message.includes('EADDRINUSE')))) {
    console.warn('[Process] Caught and handled EADDRINUSE gracefully:', err.message);
    return;
  }
  console.error('[Process] Uncaught Exception:', err);
});

// Ensure single instance of Ice Talk POS
const gotTheLock = app.requestSingleInstanceLock();
bootLog('gotTheLock:', gotTheLock);
if (!gotTheLock) {
  bootLog('[App] Another instance is already running. Quitting duplicate.');
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let activeServerPort = 5000;

function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => {
      resolve(false);
    });
    tester.once('listening', () => {
      tester.close(() => {
        resolve(true);
      });
    });
    tester.listen(port);
  });
}

function isIceTalkHealthy(port) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/api/health', timeout: 1500 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // STRICT CHECK: Must be Ice Talk Family Restaurant.
          // Other apps returning {"status":"ok"} (e.g. DevLoop POS on port 5000) must NOT be reused.
          const isIceTalk = Boolean(
            json &&
            json.restaurant &&
            typeof json.restaurant === 'string' &&
            json.restaurant.toUpperCase().includes('ICE TALK')
          );
          resolve(isIceTalk);
        } catch (_) {
          resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function findNextFreePort(startPort = 5001, maxPort = 5050) {
  for (let p = startPort; p <= maxPort; p++) {
    const free = await isPortFree(p);
    if (free) return p;
  }
  return startPort;
}

async function resolveServerPort() {
  if (process.env.ELECTRON_START_URL) {
    return 5000;
  }

  // 1. Check if an active Ice Talk server is already responding on port 5000
  const healthy5000 = await isIceTalkHealthy(5000);
  if (healthy5000) {
    console.log('[Backend] Found healthy active Ice Talk server on port 5000. Reusing running server.');
    process.env.IS_EXTERNAL_SERVER = 'true';
    return 5000;
  }

  // 2. Check if port 5000 is free to bind
  const free5000 = await isPortFree(5000);
  if (free5000) {
    console.log('[Backend] Port 5000 is available. Starting internal server on port 5000.');
    return 5000;
  }

  // 3. Port 5000 is occupied by another application (e.g. DevLoop POS). Find next free port (5001-5050)
  const freeFallback = await findNextFreePort(5001, 5050);
  console.log(`[Backend] Port 5000 is occupied by another application. Starting internal server on fallback port ${freeFallback}.`);
  return freeFallback;
}

function startBackendServerIfNeeded(port = 5000) {
  if (process.env.IS_EXTERNAL_SERVER === 'true') {
    console.log('[Backend] Reusing running backend on port:', port);
    return;
  }

  process.env.PORT = String(port);

  try {
    const serverPaths = [
      path.join(__dirname, '../server/src/server.js'),
      path.join(app.getAppPath(), 'server/src/server.js'),
    ];

    for (const p of serverPaths) {
      if (fs.existsSync(p)) {
        console.log('[Backend] Initializing server script from:', p, 'on port:', port);
        require(p);
        console.log('[Backend] Initialized internal server successfully.');
        return;
      }
    }
  } catch (err) {
    console.log('[Backend] Server initialization notice:', err.message);
  }
}

function createWindow(serverPort = activeServerPort) {
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
      spellcheck: false,
    },
  });

  // Remove default menu to prevent Alt key or hidden menu bar from capturing keyboard focus
  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);
  if (typeof mainWindow.removeMenu === 'function') {
    mainWindow.removeMenu();
  }

  // Prevent Windows Alt key from capturing keyboard focus to hidden system menu
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Alt') {
      event.preventDefault();
    }
  });

  // Automatically refocus webContents when window is focused
  mainWindow.on('focus', () => {
    if (mainWindow && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
      mainWindow.webContents.focus();
    }
  });

  const distHtml = [
    path.join(app.getAppPath(), 'client/dist/index.html'),
    path.join(__dirname, '../client/dist/index.html'),
  ].find((p) => fs.existsSync(p));
  const targetUrl = process.env.ELECTRON_START_URL || `http://localhost:${serverPort}`;

  let attempts = 0;
  const maxAttempts = 30;

  const loadWithRetry = () => {
    if (!mainWindow) return;

    attempts++;
    mainWindow.loadURL(targetUrl).catch((err) => {
      if (attempts < maxAttempts) {
        console.log(`[App] Connecting to ${targetUrl}, retrying (${attempts}/${maxAttempts})...`);
        setTimeout(loadWithRetry, 1000);
      } else if (distHtml) {
        console.log('[App] Loading local production build fallback:', distHtml);
        mainWindow.loadFile(distHtml);
      } else {
        console.error('[App] Failed to connect to server after multiple attempts:', err.message);
      }
    });
  };

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      if (mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.focus();
      }
    }
  });

  loadWithRetry();

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

function restoreMainWindowFocus() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      if (!mainWindow.isFocused()) {
        mainWindow.focus();
      }
      if (mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.focus();
      }
    } catch (_) {}
  }
}

// IPC: Allow renderer to explicitly request window and webContents refocusing
ipcMain.handle('window:focus-main', () => {
  restoreMainWindowFocus();
  return true;
});

// Focus existing window if a second instance is launched
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  } else if (gotTheLock) {
    createWindow(activeServerPort);
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
        focusable: false,
        skipTaskbar: true,
        width: 380,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // Determine target printer: use specified printer or auto-detect system default printer
      let targetPrinterName = (options.printerName || '').trim();
      try {
        const printers = await printWin.webContents.getPrintersAsync();
        if (printers && printers.length > 0) {
          if (targetPrinterName) {
            const matched = printers.find(p => p.name.toLowerCase() === targetPrinterName.toLowerCase())
              || printers.find(p => p.name.toLowerCase().includes(targetPrinterName.toLowerCase()));
            if (matched) targetPrinterName = matched.name;
          }
          if (!targetPrinterName) {
            const defaultPrinter = printers.find((p) => p.isDefault) || printers[0];
            if (defaultPrinter) targetPrinterName = defaultPrinter.name;
          }
        }
      } catch (pErr) {
        console.warn('Could not query system printers:', pErr);
      }

      const paperWidth = options.paperWidth || '78mm';
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
                size: auto;
              }
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: ${cssWidth};
                max-width: ${cssWidth};
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                font-size: 13px;
                line-height: 1.25;
                color: #000;
                background: #fff;
                -webkit-font-smoothing: antialiased;
              }
              #printable-receipt-area {
                width: 100% !important;
                max-width: ${cssWidth} !important;
                box-sizing: border-box !important;
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
            if (!success && targetPrinterName) {
              console.warn(`[Printer] Direct print to "${targetPrinterName}" failed (${failureReason}). Retrying with default system printer silently...`);
              printWin.webContents.print({ silent: true, printBackground: true, margins: { marginType: 'none' } }, (defSuccess, defReason) => {
                try { printWin.destroy(); } catch (e) {}
                restoreMainWindowFocus();
                if (!defSuccess) {
                  console.error('Silent print with default printer also failed:', defReason);
                  resolve({ success: false, error: defReason });
                } else {
                  console.log('Silent receipt printed successfully via default printer fallback');
                  resolve({ success: true, printer: 'Default Printer (Fallback)' });
                }
              });
              return;
            }

            try {
              printWin.destroy();
            } catch (e) {}
            restoreMainWindowFocus();

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
      restoreMainWindowFocus();
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
        restoreMainWindowFocus();
        if (!success) {
          console.error('Silent print failed:', failureReason);
          resolve({ success: false, error: failureReason });
        } else {
          console.log('Silent print completed successfully.');
          resolve({ success: true });
        }
      });
    } catch (err) {
      restoreMainWindowFocus();
      console.error('Silent print error:', err);
      resolve({ success: false, error: err.message });
    }
  });
});

app.whenReady().then(async () => {
  bootLog('app.whenReady triggered. gotTheLock:', gotTheLock);
  if (gotTheLock) {
    try {
      activeServerPort = await resolveServerPort();
      bootLog('resolved activeServerPort:', activeServerPort);
      startBackendServerIfNeeded(activeServerPort);
      bootLog('startBackendServerIfNeeded finished');
    } catch (e) {
      bootLog('Error during startup sequence:', e && e.stack ? e.stack : e);
    }
    createWindow(activeServerPort);
    bootLog('createWindow finished');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && gotTheLock) {
    createWindow(activeServerPort);
  }
});
