import React, { createContext, useContext, useState, useEffect } from 'react';

const PrinterContext = createContext();

export const PrinterProvider = ({ children }) => {
  const [printData, setPrintData] = useState(null); // { type: 'PREPARATION_SLIP' | 'CUSTOMER_RECEIPT', data: object, department: string | null }
  const [paperWidth, setPaperWidth] = useState(() => localStorage.getItem('icetalk_paper_width') || '78mm'); // '58mm' | '78mm' | '80mm'
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(() => localStorage.getItem('icetalk_autoprint') !== 'false');
  const [availablePrinters, setAvailablePrinters] = useState([]);

  // Station specific printer mappings
  const [selectedPrinter, setSelectedPrinter] = useState(() => localStorage.getItem('icetalk_selected_printer') || '');
  const [billPrinter, setBillPrinter] = useState(() => localStorage.getItem('icetalk_bill_printer') || '');
  const [kitchenPrinter, setKitchenPrinter] = useState(() => localStorage.getItem('icetalk_kitchen_printer') || '');
  const [juicePrinter, setJuicePrinter] = useState(() => localStorage.getItem('icetalk_juice_printer') || '');
  const [bunPrinter, setBunPrinter] = useState(() => localStorage.getItem('icetalk_bun_printer') || '');
  const [multiPrinterMode, setMultiPrinterMode] = useState(() => localStorage.getItem('icetalk_multiprinter_mode') === 'true');

  const [settingsOpen, setSettingsOpen] = useState(false);

  const isElectron = Boolean(window.electronAPI?.isElectron);

  // Load hardware printers if running in Electron desktop app
  const refreshPrinters = () => {
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
  };

  useEffect(() => {
    refreshPrinters();
  }, [isElectron]);

  const setWidth = (width) => {
    setPaperWidth(width);
    localStorage.setItem('icetalk_paper_width', width);
  };

  const setPrinter = (printerName) => {
    setSelectedPrinter(printerName);
    localStorage.setItem('icetalk_selected_printer', printerName);
  };

  const updateStationPrinter = (station, printerName) => {
    if (station === 'bill') {
      setBillPrinter(printerName);
      localStorage.setItem('icetalk_bill_printer', printerName);
    } else if (station === 'kitchen') {
      setKitchenPrinter(printerName);
      localStorage.setItem('icetalk_kitchen_printer', printerName);
    } else if (station === 'juice') {
      setJuicePrinter(printerName);
      localStorage.setItem('icetalk_juice_printer', printerName);
    } else if (station === 'bun') {
      setBunPrinter(printerName);
      localStorage.setItem('icetalk_bun_printer', printerName);
    }
  };

  const toggleMultiPrinterMode = () => {
    const next = !multiPrinterMode;
    setMultiPrinterMode(next);
    localStorage.setItem('icetalk_multiprinter_mode', String(next));
  };

  const toggleAutoPrint = () => {
    const next = !autoPrintEnabled;
    setAutoPrintEnabled(next);
    localStorage.setItem('icetalk_autoprint', String(next));
  };

  // Direct silent thermal print to a specified target printer
  const executeSilentPrintTo = async (targetPrinterName, targetWidth = null) => {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const receiptEl = document.getElementById('printable-receipt-area');
    const receiptHtml = receiptEl ? receiptEl.outerHTML : '';
    const printerToUse = targetPrinterName || selectedPrinter;
    const widthToUse = targetWidth || paperWidth;

    if (isElectron) {
      if (window.electronAPI?.printHtml && receiptHtml) {
        try {
          const res = await window.electronAPI.printHtml(receiptHtml, {
            printerName: printerToUse,
            paperWidth: widthToUse,
          });
          if (res?.success) return;
        } catch (err) {
          console.warn('[Printer] printHtml failed, trying fallback:', err);
        }
      }

      if (window.electronAPI?.printSilent) {
        try {
          await window.electronAPI.printSilent({ printerName: printerToUse });
          return;
        } catch (err) {
          console.error('[Printer] Electron printSilent error:', err);
        }
      }
    }

    try {
      window.print();
    } catch (e) {
      console.error('[Printer] Browser print error:', e);
    }
  };

  // Trigger preparation slip
  // Supports multi-printer split routing:
  // If multiPrinterMode is ON and department is not passed, it can print separate slips to station printers!
  const printPreparationSlip = async (order, isAutoTrigger = false, department = null) => {
    if (!isAutoTrigger || autoPrintEnabled) {
      if (multiPrinterMode && !department) {
        // Multi-printer routing: identify active departments in the order
        const items = order.items || [];
        const activeDepts = new Set();
        items.forEach((it) => {
          const d = (it.department || 'KITCHEN').toUpperCase();
          activeDepts.add(d);
        });

        // Print each active station sequentially to its target printer
        for (const dept of activeDepts) {
          let targetPrinter = selectedPrinter;
          if (dept === 'KITCHEN') targetPrinter = kitchenPrinter || selectedPrinter;
          else if (dept === 'JUICE') targetPrinter = juicePrinter || selectedPrinter;
          else if (dept === 'BUN') targetPrinter = bunPrinter || selectedPrinter;

          setPrintData({
            type: 'PREPARATION_SLIP',
            data: order,
            department: dept,
          });

          await new Promise((r) => setTimeout(r, 200));
          await executeSilentPrintTo(targetPrinter);
          await new Promise((r) => setTimeout(r, 300));
        }
      } else {
        // Single printer master KOT (or specific department manual print)
        let targetPrinter = selectedPrinter;
        if (department === 'KITCHEN') targetPrinter = kitchenPrinter || selectedPrinter;
        else if (department === 'JUICE') targetPrinter = juicePrinter || selectedPrinter;
        else if (department === 'BUN') targetPrinter = bunPrinter || selectedPrinter;

        setPrintData({
          type: 'PREPARATION_SLIP',
          data: order,
          department,
        });

        setTimeout(() => {
          executeSilentPrintTo(targetPrinter);
        }, 100);
      }
    } else {
      setPrintData({
        type: 'PREPARATION_SLIP',
        data: order,
        department,
      });
    }
  };

  // Print customer tax receipt
  const printCustomerReceipt = (sale, isAutoTrigger = false) => {
    const targetPrinter = billPrinter || selectedPrinter;
    setPrintData({
      type: 'CUSTOMER_RECEIPT',
      data: sale,
    });

    if (!isAutoTrigger || autoPrintEnabled) {
      setTimeout(() => {
        executeSilentPrintTo(targetPrinter);
      }, 100);
    }
  };

  // Station Test Print
  const testPrintStation = async (stationName, printerName) => {
    const dummyOrder = {
      orderNumber: 'TEST-01',
      tableNameSnapshot: 'TEST TABLE',
      waiterNameSnapshot: 'ADMIN',
      createdAt: new Date(),
      items: [
        {
          name: `${stationName} PRINTER TEST`,
          quantity: 1,
          department: stationName === 'RICE & KITCHEN' ? 'KITCHEN' : stationName === 'JUICE & DESSERTS' ? 'JUICE' : 'BUN',
          specialInstructions: 'Printer connected & communicating successfully',
        },
      ],
    };

    setPrintData({
      type: 'PREPARATION_SLIP',
      data: dummyOrder,
      department: stationName === 'RICE & KITCHEN' ? 'KITCHEN' : stationName === 'JUICE & DESSERTS' ? 'JUICE' : 'BUN',
    });

    setTimeout(() => {
      executeSilentPrintTo(printerName);
    }, 150);
  };

  const closePrintModal = () => {
    setPrintData(null);
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
        refreshPrinters,
        selectedPrinter,
        setPrinter,
        billPrinter,
        kitchenPrinter,
        juicePrinter,
        bunPrinter,
        multiPrinterMode,
        updateStationPrinter,
        toggleMultiPrinterMode,
        settingsOpen,
        openSettings: () => setSettingsOpen(true),
        closeSettings: () => setSettingsOpen(false),
        isElectron,
        printPreparationSlip,
        printCustomerReceipt,
        testPrintStation,
        closePrintModal,
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
};

export const usePrinter = () => useContext(PrinterContext);
