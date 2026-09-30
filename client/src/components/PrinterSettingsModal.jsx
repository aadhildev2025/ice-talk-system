import React from 'react';
import { usePrinter } from '../context/PrinterContext';
import {
  Printer,
  X,
  RefreshCw,
  Sliders,
  UtensilsCrossed,
  GlassWater,
  Cookie,
  Receipt,
  CheckCircle,
  Play,
  HelpCircle,
} from 'lucide-react';

const PrinterSettingsModal = () => {
  const {
    settingsOpen,
    closeSettings,
    availablePrinters,
    refreshPrinters,
    paperWidth,
    setWidth,
    autoPrintEnabled,
    toggleAutoPrint,
    selectedPrinter,
    setPrinter,
    billPrinter,
    kitchenPrinter,
    juicePrinter,
    bunPrinter,
    multiPrinterMode,
    updateStationPrinter,
    toggleMultiPrinterMode,
    testPrintStation,
    isElectron,
  } = usePrinter();

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141419] border border-[#24242E] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 bg-[#181820] border-b border-[#24242E] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-display">Thermal Printer & KOT Routing Setup</h3>
              <p className="text-[11px] text-neutral-400">
                Configure separate station printers for Kitchen, Juice Bar, Buns, and Cashier
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className="p-1.5 rounded-xl bg-[#141418] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Hardware Connection Status */}
          <div className="flex items-center justify-between bg-[#181820] p-3 rounded-xl border border-[#2B2B38]">
            <div>
              <p className="font-bold text-white text-xs">
                {isElectron ? `${availablePrinters.length} Printers Detected in Windows` : 'Web Browser Mode'}
              </p>
              <p className="text-[11px] text-neutral-400">
                {isElectron
                  ? 'Printers installed in Windows Settings are automatically available for routing'
                  : 'Open the Desktop POS app for direct background silent thermal printing'}
              </p>
            </div>
            {isElectron && (
              <button
                onClick={refreshPrinters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#252532] text-neutral-300 hover:text-white border border-[#2B2B38] font-bold text-[11px] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                <span>Re-scan</span>
              </button>
            )}
          </div>

          {/* Mode Switch: Multi-Station vs Single Master */}
          <div className="bg-[#181820] p-4 rounded-xl border border-[#2B2B38] space-y-2.5">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-white text-xs">Separate Station Printers Routing</p>
                <p className="text-[11px] text-neutral-400">
                  Automatically split and route KOT slips to separate physical printers
                </p>
              </div>
              <button
                onClick={toggleMultiPrinterMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  multiPrinterMode ? 'bg-[#FF6B00]' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    multiPrinterMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 italic">
              {multiPrinterMode
                ? 'Active: Kitchen, Juice Bar, and Buns will print independently to their assigned printers.'
                : 'Single Mode: All KOT sections will print together on the main counter printer.'}
            </p>
          </div>

          {/* Station Printer Assignments */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              <span>Station Printer Assignments</span>
            </h4>

            {/* 1. Cashier / Billing Printer */}
            <div className="bg-[#181820] p-3 rounded-xl border border-[#2B2B38] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Cashier / Billing Printer</p>
                  <p className="text-[10px] text-neutral-400">Prints final customer tax receipts with logo</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={billPrinter || selectedPrinter}
                  onChange={(e) => {
                    updateStationPrinter('bill', e.target.value);
                    if (!selectedPrinter) setPrinter(e.target.value);
                  }}
                  className="bg-[#141418] border border-[#2D2D3B] text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-[#FF6B00] flex-1 sm:w-44 truncate"
                >
                  <option value="">Default Windows Printer</option>
                  {availablePrinters.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} {p.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => testPrintStation('CASHIER BILLING', billPrinter || selectedPrinter)}
                  title="Test Cashier Printer"
                  className="px-2.5 py-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#FF6B00] text-neutral-300 hover:text-white border border-[#2B2B38] font-bold text-[10px] transition-all flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* 2. Kitchen / Rice Printer */}
            <div className="bg-[#181820] p-3 rounded-xl border border-[#2B2B38] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Rice & Kitchen Printer</p>
                  <p className="text-[10px] text-neutral-400">Fried Rice, Kottu, Burgers & hot dishes</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={kitchenPrinter}
                  onChange={(e) => updateStationPrinter('kitchen', e.target.value)}
                  className="bg-[#141418] border border-[#2D2D3B] text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-amber-500 flex-1 sm:w-44 truncate"
                >
                  <option value="">-- Same as Main Printer --</option>
                  {availablePrinters.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} {p.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => testPrintStation('RICE & KITCHEN', kitchenPrinter || selectedPrinter)}
                  title="Test Kitchen Printer"
                  className="px-2.5 py-1.5 rounded-lg bg-[#1C1C24] hover:bg-amber-600 text-neutral-300 hover:text-white border border-[#2B2B38] font-bold text-[10px] transition-all flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* 3. Juice Bar & Desserts Printer */}
            <div className="bg-[#181820] p-3 rounded-xl border border-[#2B2B38] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <GlassWater className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Juice Bar & Desserts Printer</p>
                  <p className="text-[10px] text-neutral-400">Juices, Milkshakes, Falooda, Ice cream & Desserts</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={juicePrinter}
                  onChange={(e) => updateStationPrinter('juice', e.target.value)}
                  className="bg-[#141418] border border-[#2D2D3B] text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-sky-500 flex-1 sm:w-44 truncate"
                >
                  <option value="">-- Same as Main Printer --</option>
                  {availablePrinters.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} {p.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => testPrintStation('JUICE & DESSERTS', juicePrinter || selectedPrinter)}
                  title="Test Juice Bar Printer"
                  className="px-2.5 py-1.5 rounded-lg bg-[#1C1C24] hover:bg-sky-600 text-neutral-300 hover:text-white border border-[#2B2B38] font-bold text-[10px] transition-all flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* 4. Buns & Short Eats Printer */}
            <div className="bg-[#181820] p-3 rounded-xl border border-[#2B2B38] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Buns & Short Eats Printer</p>
                  <p className="text-[10px] text-neutral-400">Bakery buns, rolls, samosas, pastries</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={bunPrinter}
                  onChange={(e) => updateStationPrinter('bun', e.target.value)}
                  className="bg-[#141418] border border-[#2D2D3B] text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-purple-500 flex-1 sm:w-44 truncate"
                >
                  <option value="">-- Same as Main Printer --</option>
                  {availablePrinters.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} {p.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => testPrintStation('BUNS & SHORT EATS', bunPrinter || selectedPrinter)}
                  title="Test Bun Printer"
                  className="px-2.5 py-1.5 rounded-lg bg-[#1C1C24] hover:bg-purple-600 text-neutral-300 hover:text-white border border-[#2B2B38] font-bold text-[10px] transition-all flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* Paper Size & Auto-print Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-[#181820] p-3 rounded-xl border border-[#2B2B38]">
              <label className="block font-bold text-neutral-300 mb-1 uppercase text-[10px]">
                Thermal Paper Width
              </label>
              <select
                value={paperWidth}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full bg-[#141418] border border-[#2D2D3B] text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-[#FF6B00]"
              >
                <option value="78mm">78mm / 80mm Standard Roll (Recommended)</option>
                <option value="58mm">58mm Small Roll</option>
              </select>
            </div>

            <div className="bg-[#181820] p-3 rounded-xl border border-[#2B2B38] flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-xs">Auto-Print on Order Approval</p>
                <p className="text-[10px] text-neutral-400">Silently print KOT as soon as approved</p>
              </div>
              <button
                onClick={toggleAutoPrint}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoPrintEnabled ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoPrintEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#181820] border-t border-[#24242E] flex justify-end">
          <button
            onClick={closeSettings}
            className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05A00] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterSettingsModal;
