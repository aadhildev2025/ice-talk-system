import React from 'react';
import { usePrinter } from '../context/PrinterContext';

const PrintModal = () => {
  const { printData, paperWidth } = usePrinter();

  if (!printData) return null;

  const { type, data } = printData;
  const isPrepSlip = type === 'PREPARATION_SLIP';

  // Group items by department for preparation slip
  const groupedItems = {};
  if (data.items) {
    data.items.forEach((item) => {
      const dept = item.department || 'KITCHEN';
      if (!groupedItems[dept]) groupedItems[dept] = [];
      groupedItems[dept].push(item);
    });
  }

  const currentDate = new Date(data.createdAt || Date.now());
  const formattedDate = currentDate.toLocaleDateString('en-GB');
  const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Determine order type / channel label
  const orderType = data.orderType || (data.tableId ? 'DINE_IN' : 'TAKEAWAY');
  const channelLabel =
    orderType === 'UBEREATS'
      ? 'UBER EATS'
      : orderType === 'PICKME'
      ? 'PICKME'
      : orderType === 'TAKEAWAY'
      ? 'TAKE AWAY'
      : `TABLE: ${data.tableNameSnapshot || 'Dine-In'}`;

  return (
    <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none print:opacity-100 print:pointer-events-auto print:static print:left-0 print:top-0 print:m-0 print:p-0">
      <div
        id="printable-receipt-area"
        style={{ width: paperWidth === '58mm' ? '240px' : '320px' }}
        className="bg-white text-black font-mono text-[11px] p-3 leading-tight select-text"
      >
        {/* Header */}
        <div className="text-center pb-2 border-b border-dashed border-black">
          <p className="font-extrabold text-sm tracking-wider">ICE TALK</p>
          <p className="text-[10px] font-bold">FAMILY RESTAURANT</p>
          {!isPrepSlip && (
            <>
              <p className="text-[9px] text-neutral-600">Delicious Food & Fresh Drinks</p>
              <p className="text-[9px] text-neutral-600">Tel: +94 77 123 4567</p>
            </>
          )}
        </div>

        {/* Slip / Invoice Meta */}
        <div className="py-2 text-[10px] border-b border-dashed border-black space-y-0.5">
          {isPrepSlip ? (
            <>
              <p className="font-bold text-[13px] text-center uppercase tracking-wider">
                *** KITCHEN NOTE ***
              </p>
              <p className="font-black text-[12px]">ORDER #{data.orderNumber}</p>
              <p className="font-black text-[11px] bg-black text-white px-1 py-0.5 inline-block rounded">
                CHANNEL: {channelLabel}
              </p>
              {data.tableNameSnapshot && orderType === 'DINE_IN' && (
                <p className="font-bold">TABLE: {data.tableNameSnapshot}</p>
              )}
              {data.customerName && (
                <p className="font-bold">CUSTOMER: {data.customerName}</p>
              )}
              {data.channelOrderRef && (
                <p className="font-bold">REF / ORDER ID: {data.channelOrderRef}</p>
              )}
              <p>STAFF / CASHIER: {data.waiterNameSnapshot || 'Staff'}</p>
              <p>TIME: {formattedTime} ({formattedDate})</p>
              {data.priority && data.priority !== 'NORMAL' && (
                <p className="font-extrabold text-red-600">PRIORITY: {data.priority}</p>
              )}
            </>
          ) : (
            <>
              <p className="font-bold text-[12px] text-center uppercase tracking-wider">
                TAX INVOICE / RECEIPT
              </p>
              <p className="font-bold">RECEIPT #: {data.saleNumber}</p>
              <p>
                ORDER(S): #{Array.isArray(data.orderNumbers) ? data.orderNumbers.join(', #') : data.orderNumber || data.orderNumbers}
              </p>
              <p className="font-bold">CHANNEL: {channelLabel}</p>
              {data.customerName && <p>CUSTOMER: {data.customerName}</p>}
              <p>DATE: {formattedDate} {formattedTime}</p>
              <p>CASHIER: {data.cashierNameSnapshot || 'Admin'}</p>
            </>
          )}
        </div>

        {/* Preparation Slip: Grouped by Department */}
        {isPrepSlip ? (
          <div className="py-2 space-y-2">
            {Object.keys(groupedItems).map((dept) => (
              <div key={dept} className="border-b border-dotted border-neutral-400 pb-2">
                <div className="font-extrabold text-[11px] bg-neutral-200 px-1 py-0.5 uppercase tracking-wider mb-1">
                  {dept}
                </div>
                {groupedItems[dept].map((item, idx) => (
                  <div key={idx} className="py-0.5 flex justify-between items-start">
                    <div className="pr-1 flex-1">
                      <span className="font-bold text-[12px]">{item.name}</span>
                      {item.specialInstructions && (
                        <p className="text-[10px] italic font-bold text-neutral-800">
                          * {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <span className="font-black text-right text-sm">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            ))}

            {data.specialInstructions && (
              <div className="p-1.5 bg-neutral-100 rounded text-[10px] mt-1 border border-neutral-400 font-bold">
                <span>ORDER NOTE:</span> {data.specialInstructions}
              </div>
            )}
          </div>
        ) : (
          /* Final Customer Receipt: Full Line Items & Totals */
          <div className="py-2">
            <div className="flex justify-between font-bold border-b border-black pb-1 mb-1 text-[10px]">
              <span>ITEM</span>
              <span className="text-center">QTY</span>
              <span className="text-right">PRICE</span>
            </div>

            <div className="space-y-1">
              {data.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between items-start text-[10px]">
                  <span className="w-1/2 pr-1 font-medium">{it.name}</span>
                  <span className="w-1/6 text-center font-bold">{it.quantity}</span>
                  <span className="w-1/3 text-right">
                    Rs. {(it.total || it.price * it.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation breakdown */}
            <div className="border-t border-dashed border-black mt-2 pt-1.5 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span>Rs. {(data.subtotal || data.total).toLocaleString()}</span>
              </div>
              {data.discount > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>DISCOUNT</span>
                  <span>- Rs. {data.discount.toLocaleString()}</span>
                </div>
              )}
              {data.tax > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>TAX</span>
                  <span>Rs. {data.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-black">
                <span>TOTAL</span>
                <span>Rs. {data.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="border-t border-dashed border-black mt-2 pt-1.5 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>PAYMENT METHOD:</span>
                <span className="font-bold uppercase">{data.paymentMethod}</span>
              </div>
              {data.amountTendered > 0 && data.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between">
                    <span>AMOUNT TENDERED:</span>
                    <span>Rs. {data.amountTendered.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>CHANGE:</span>
                    <span>Rs. {(data.changeAmount || 0).toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-bold text-emerald-800">
                <span>STATUS:</span>
                <span>PAID</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-3 border-t border-dashed border-black space-y-0.5 text-[9px]">
          <p className="font-bold">THANK YOU! VISIT AGAIN</p>
          <p className="text-[8px] text-neutral-500">Powered by ICE TALK POS</p>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
