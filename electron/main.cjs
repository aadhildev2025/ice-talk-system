const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function startBackendServerIfNeeded() {
  try {
    const fs = require('fs');
    const possiblePaths = [
      path.join(__dirname, '../server/src/server.js'),
      path.join(app.getAppPath(), 'server/src/server.js'),
      path.join(process.resourcesPath, 'app/server/src/server.js'),
      path.join(process.resourcesPath, 'server/src/server.js'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        require(p);
        console.log('[Backend] Initialized server from:', p);
        return;
      }
    }
    console.warn('[Backend] Server script not found at standard paths, expecting external service.');
  } catch (err) {
    console.log('[Backend] Server notice / already running:', err.message);
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

  const fs = require('fs');
  const distHtml = path.join(__dirname, '../client/dist/index.html');

  const urlsToTry = [
    process.env.ELECTRON_START_URL,
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:5174',
  ].filter(Boolean);

  let currentUrlIndex = 0;
  let attempts = 0;

  const loadWithRetry = () => {
    if (!mainWindow) return;

    if (attempts > 5 && fs.existsSync(distHtml)) {
      console.log('Loading local production build:', distHtml);
      mainWindow.loadFile(distHtml);
      return;
    }

    const targetUrl = urlsToTry[currentUrlIndex % urlsToTry.length];
    attempts++;

    mainWindow.loadURL(targetUrl).catch((err) => {
      console.log(`Connecting to ${targetUrl}, retrying in 1s...`);
      currentUrlIndex++;
      setTimeout(loadWithRetry, 1000);
    });
  };

  loadWithRetry();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

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

// IPC: Silent Print using main window webContents
ipcMain.handle('printer:print-silent', async (event, options = {}) => {
  return new Promise((resolve) => {
    if (!mainWindow) {
      return resolve({ success: false, error: 'Main window not available' });
    }

    const printOptions = {
      silent: true,
      printBackground: true,
      deviceName: options.printerName || '',
      margins: {
        marginType: 'none',
      },
    };

    mainWindow.webContents.print(printOptions, (success, failureReason) => {
      if (!success) {
        console.error('Silent print failed:', failureReason);
        resolve({ success: false, error: failureReason });
      } else {
        resolve({ success: true });
      }
    });
  });
});

// IPC: Direct Silent HTML Thermal Print via hidden off-screen window
ipcMain.handle('printer:print-html', async (event, { html, options = {} }) => {
  return new Promise((resolve) => {
    try {
      const printWin = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              @page { margin: 0; size: auto; }
              body { margin: 0; padding: 4px; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; background: #fff; }
              table { width: 100%; border-collapse: collapse; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .divider { border-top: 1px dashed #000; margin: 6px 0; }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;

      printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`);

      printWin.webContents.on('did-finish-load', () => {
        const printOptions = {
          silent: true,
          printBackground: true,
          deviceName: options.printerName || '',
          margins: {
            marginType: 'none',
          },
        };

        printWin.webContents.print(printOptions, (success, failureReason) => {
          printWin.destroy();
          if (!success) {
            console.error('Silent HTML print failed:', failureReason);
            resolve({ success: false, error: failureReason });
          } else {
            resolve({ success: true });
          }
        });
      });
    } catch (err) {
      console.error('Print HTML error:', err);
      resolve({ success: false, error: err.message });
    }
  });
});

app.whenReady().then(() => {
  startBackendServerIfNeeded();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
