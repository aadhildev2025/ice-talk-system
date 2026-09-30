const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getPrinters: () => ipcRenderer.invoke('printer:get-list'),
  printSilent: (options) => ipcRenderer.invoke('printer:print-silent', options),
  printHtml: (html, options) => ipcRenderer.invoke('printer:print-html', { html, options }),
});
