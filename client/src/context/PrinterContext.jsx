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
      window.electronAPI.getPrinters().then((printers) => {
        setAvailablePrinters(printers || []);
        if (!selectedPrinter && printers && printers.length > 0) {
          const defaultPrinter = printers.find((p) => p.isDefault) || printers[0];
          setSelectedPrinter(defaultPrinter.name);
        }
      }).catch((err) => {
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

  // Trigger silent print job
  const executeSilentPrint = async () => {
    if (isElectron && window.electronAPI?.printSilent) {
      try {
        await window.electronAPI.printSilent({ printerName: selectedPrinter });
      } catch (err) {
        console.error('Electron silent print error:', err);
      }
    } else {
      try {
        window.print();
      } catch (e) {
        console.error('Browser print error:', e);
      }
    }
  };

  // Open preparation slip & trigger direct silent print
  const printPreparationSlip = (order, autoTrigger = true) => {
    setPrintData({
      type: 'PREPARATION_SLIP',
      data: order,
    });

    if (autoTrigger && autoPrintEnabled) {
      setTimeout(() => {
        executeSilentPrint();
      }, 200);
    }
  };

  // Open customer receipt & trigger direct silent print
  const printCustomerReceipt = (sale, autoTrigger = true) => {
    setPrintData({
      type: 'CUSTOMER_RECEIPT',
      data: sale,
    });

    if (autoTrigger && autoPrintEnabled) {
      setTimeout(() => {
        executeSilentPrint();
      }, 200);
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
