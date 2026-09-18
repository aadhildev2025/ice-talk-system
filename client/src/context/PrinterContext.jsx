import React, { createContext, useContext, useState, useEffect } from 'react';

const PrinterContext = createContext();

export const PrinterProvider = ({ children }) => {
  const [printData, setPrintData] = useState(null); // { type: 'PREPARATION_SLIP' | 'CUSTOMER_RECEIPT', data: object }
  const [paperWidth, setPaperWidth] = useState(() => localStorage.getItem('icetalk_paper_width') || '80mm'); // '58mm' | '80mm'
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(() => localStorage.getItem('icetalk_autoprint') !== 'false');
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(() => localStorage.getItem('icetalk_selected_printer') || '');

  const isElectron = Boolean(window.electronAPI?.isElectron);

  // Load hardware printers if running in Electron desktop app
  useEffect(() => {
    if (isElectron && window.electronAPI?.getPrinters) {
      window.electronAPI
        .getPrinters()
        .then((printers) => {
          setAvailablePrinters(printers || []);
        })
        .catch((err) => {
          console.error('Failed to query native printers:', err);
        });
    }
  }, [isElectron]);

  const setWidth = (width) => {
    setPaperWidth(width);
    localStorage.setItem('icetalk_paper_width', width);
  };

  const setPrinter = (printerName) => {
    setSelectedPrinter(printerName);
    localStorage.setItem('icetalk_selected_printer', printerName);
  };

  const toggleAutoPrint = () => {
    const next = !autoPrintEnabled;
    setAutoPrintEnabled(next);
    localStorage.setItem('icetalk_autoprint', String(next));
  };

  // Trigger direct silent thermal print job
  const executeSilentPrint = async () => {
    // Short pause for React to render printable HTML into DOM
    await new Promise((resolve) => setTimeout(resolve, 150));

    const receiptEl = document.getElementById('printable-receipt-area');
    const receiptHtml = receiptEl ? receiptEl.outerHTML : '';

    if (isElectron) {
      // Preferred: Dedicated offscreen thermal print engine (exact width, no page breaks, no dialog)
      if (window.electronAPI?.printHtml && receiptHtml) {
        try {
          const res = await window.electronAPI.printHtml(receiptHtml, {
            printerName: selectedPrinter,
            paperWidth,
          });
          if (res?.success) return;
        } catch (err) {
          console.warn('[Printer] printHtml failed, attempting printSilent fallback:', err);
        }
      }

      // Fallback 1: Silent print via main window webContents
      if (window.electronAPI?.printSilent) {
        try {
          await window.electronAPI.printSilent({ printerName: selectedPrinter });
          return;
        } catch (err) {
          console.error('[Printer] Electron printSilent error:', err);
        }
      }
    }

    // Fallback 2: Browser standard print (for web browser clients)
    try {
      window.print();
    } catch (e) {
      console.error('[Printer] Browser print error:', e);
    }
  };

  // Open preparation slip & trigger direct silent print
  // isAutoTrigger = true: automated background trigger (checks autoPrintEnabled)
  // isAutoTrigger = false: manual button click (always prints immediately)
  const printPreparationSlip = (order, isAutoTrigger = false) => {
    setPrintData({
      type: 'PREPARATION_SLIP',
      data: order,
    });

    if (!isAutoTrigger || autoPrintEnabled) {
      setTimeout(() => {
        executeSilentPrint();
      }, 100);
    }
  };

  // Open customer receipt & trigger direct silent print
  const printCustomerReceipt = (sale, isAutoTrigger = false) => {
    setPrintData({
      type: 'CUSTOMER_RECEIPT',
      data: sale,
    });

    if (!isAutoTrigger || autoPrintEnabled) {
      setTimeout(() => {
        executeSilentPrint();
      }, 100);
    }
  };

  const closePrintModal = () => {
    setPrintData(null);
  };

  const triggerBrowserPrint = () => {
    executeSilentPrint();
  };

  return (
    <PrinterContext.Provider
      value={{
        printData,
        paperWidth,
        setWidth,
        autoPrintEnabled,
        toggleAutoPrint,
        availablePrinters,
        selectedPrinter,
        setPrinter,
        isElectron,
        printPreparationSlip,
        printCustomerReceipt,
        closePrintModal,
        triggerBrowserPrint,
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
};

export const usePrinter = () => useContext(PrinterContext);
