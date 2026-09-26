import React from 'react';
import { usePrinter } from '../context/PrinterContext';
import { billingLogo } from '../assets/billingLogo';
import { detectKOTSection, getDeptDisplayName } from '../utils/kotRouting';

const formatReceiptDateTime = (dateVal) => {
  const d = new Date(dateVal || Date.now());
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
};

const formatKotDateTime = (dateVal) => {
  const d = new Date(dateVal || Date.now());
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
};

const formatCurrency = (val) => {
  return Number(val || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PrintModal = () => {
  const { printData, paperWidth } = usePrinter();

  if (!printData) return null;

  const { type, data, department } = printData;
  const isPrepSlip = type === 'PREPARATION_SLIP';

  // Filter items if specific station department requested for KOT
  let kotItems = data.items || [];
  if (isPrepSlip && department && department !== 'ALL') {
    const filtered = kotItems.filter(
      (it) => detectKOTSection(it.category, it.department) === department.toUpperCase()
    );
    if (filtered.length > 0) {
      kotItems = filtered;
    }
  }

  // Calculate items count for final bill
  const totalItemsCount = (data.items || []).reduce(
    (acc, it) => acc + (Number(it.quantity) || 1),
    0
  );

  const receiptWidthPx = paperWidth === '58mm' ? '216px' : '285px';

  // User name extraction
  const kotUserName = (
    data.waiterNameSnapshot ||
    data.user?.name ||
    data.waiterName ||
    data.cashierNameSnapshot ||
    'SHAHL'
  ).toUpperCase();

  const billUserName = (
    data.cashierNameSnapshot ||
    data.waiterNameSnapshot ||
    data.user?.name ||
    'SHAHL'
  ).toUpperCase();

  // Table name or order label
  const tableName = (
    data.tableNameSnapshot ||
    (data.tableId?.name ? `TABLE ${data.tableId.name}` : '') ||
    (data.orderType === 'TAKEAWAY' ? 'TAKEAWAY' : 'TABLE')
  ).toUpperCase();

  // Order reference for receipt
  const orderRefText = (
    data.tableNameSnapshot
      ? `${data.tableNameSnapshot}`
      : data.tableId?.name
      ? `TABLE ${data.tableId.name}`
      : data.customerName
      ? `TAKEAWAY (${data.customerName})`
      : 'DINE-IN'
  ).toUpperCase();

  const roundNum = data.round || data.roundNumber || 1;

  // Group KOT items by detected section directly from category or explicit department
  const groupedSections = {
    KITCHEN: [],
    JUICE: [],
    BUN: [],
    OTHER: [],
  };

  kotItems.forEach((it) => {
    const sec = detectKOTSection(it.category, it.department);
    if (groupedSections[sec]) {
      groupedSections[sec].push(it);
    } else {
      groupedSections.OTHER.push(it);
    }
  });

  const activeSections = ['KITCHEN', 'JUICE', 'BUN', 'OTHER'].filter(
    (sec) => groupedSections[sec].length > 0
  );

  return (
    <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none print:opacity-100 print:pointer-events-auto print:static print:left-0 print:top-0 print:m-0 print:p-0">
      <div
        id="printable-receipt-area"
        style={{ width: receiptWidthPx }}
        className="bg-white text-black font-mono text-[11px] p-2 leading-tight select-text"
      >
        {isPrepSlip ? (
          /* ========================================================= */
          /*                       KOT RECEIPT                         */
          /* ========================================================= */
          <div className="text-left font-mono text-black leading-snug">
            {/* Top KOT Header */}
            <div className="font-extrabold text-[15px] tracking-wide mb-1">
              KOT{department && department !== 'ALL' ? ` - ${getDeptDisplayName(department)}` : ' - MASTER (ALL)'}
            </div>

            {/* Meta details */}
            <div className="text-[11px] space-y-0.5 mb-1.5 font-medium">
              <div>User: {kotUserName}</div>
              <div>Table: {tableName}</div>
              <div>Round: {roundNum}</div>
              <div>Time: {formatKotDateTime(data.createdAt || Date.now())}</div>
            </div>

            {/* Dashed line */}
            <div className="border-b border-dashed border-black my-1.5"></div>

            {/* Items with Section Headers */}
            {department && department !== 'ALL' ? (
              // Specific Department KOT
              <div className="space-y-2 my-1.5">
                {kotItems.map((item, idx) => {
                  const catTag = item.category || getDeptDisplayName(detectKOTSection(item.category, item.department));
                  return (
                    <div key={idx} className="text-[12px] font-bold">
                      <div className="flex items-start justify-between gap-1">
                        <span className="leading-tight">
                          {item.quantity} x {item.name?.toUpperCase()}
                        </span>
                        {catTag && (
                          <span className="text-[9px] font-mono font-extrabold uppercase px-1 py-0.5 border border-black rounded shrink-0 whitespace-nowrap">
                            [{catTag.toUpperCase()}]
                          </span>
                        )}
                      </div>
                      {item.specialInstructions && (
                        <div className="text-[10px] font-normal pl-3 italic text-neutral-800">
                          * {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Combined KOT with distinct sections (Rice/Kitchen, Juice & Desserts, Buns)
              <div className="space-y-2.5 my-1.5">
                {activeSections.map((sec) => (
                  <div key={sec} className="space-y-1">
                    {/* Section Header */}
                    <div className="text-[11px] font-black uppercase tracking-wider bg-black text-white px-1.5 py-0.5 rounded-sm inline-block">
                      {getDeptDisplayName(sec)}
                    </div>

                    {/* Section Items */}
                    <div className="space-y-1.5 pl-1">
                      {groupedSections[sec].map((item, idx) => {
                        const catTag = item.category || getDeptDisplayName(sec);
                        return (
                          <div key={idx} className="text-[12px] font-bold">
                            <div className="flex items-start justify-between gap-1">
                              <span className="leading-tight">
                                {item.quantity} x {item.name?.toUpperCase()}
                              </span>
                              {catTag && (
                                <span className="text-[9px] font-mono font-extrabold uppercase px-1 py-0.5 border border-black rounded shrink-0 whitespace-nowrap">
                                  [{catTag.toUpperCase()}]
                                </span>
                              )}
                            </div>
                            {item.specialInstructions && (
                              <div className="text-[10px] font-normal pl-3 italic text-neutral-800">
                                * {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dashed line */}
            <div className="border-b border-dashed border-black my-1.5"></div>

            {/* Bottom KOT Tag */}
            <div className="font-extrabold text-[13px] tracking-wide mt-1">
              KOT
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /*                 CUSTOMER FINAL BILL / RECEIPT             */
          /* ========================================================= */
          <div className="text-black font-mono leading-snug">
            {/* Top Billing Logo */}
            <div className="text-center mb-1">
              <img
                src={billingLogo}
                alt="Ice Talk Logo"
                className="mx-auto h-20 w-auto object-contain block"
              />
            </div>

            {/* Restaurant Title & Address */}
            <div className="text-center font-extrabold text-[13px] uppercase tracking-wide leading-tight">
              <div>ICE TALK FAMILY</div>
              <div>RESTAURANT</div>
            </div>
            <div className="text-center text-[10px] text-black leading-tight mt-1 mb-2">
              <div>No. 08, KACHCHERI ROAD, PUTTALAM</div>
              <div>61300 PUTTALAM</div>
              <div className="font-bold">0777313285</div>
            </div>

            {/* Receipt Meta */}
            <div className="text-left text-[11px] space-y-0.5 my-1.5">
              <div>Receipt No.: {data.saleNumber || data.receiptNumber || '26-200-049324'}</div>
              <div>{formatReceiptDateTime(data.createdAt || Date.now())}</div>
              <div>User: {billUserName}</div>
              <div>Order No.: {orderRefText}</div>
            </div>

            {/* Dashed Separator */}
            <div className="border-b border-dashed border-black my-1.5"></div>

            {/* Item List */}
            <div className="space-y-1.5 my-1.5">
              {data.items?.map((it, idx) => {
                const itemTotal = it.total || it.price * it.quantity;
                return (
                  <div key={idx} className="text-[11px]">
                    <div className="font-bold uppercase leading-tight">
                      {it.name}
                    </div>
                    {it.specialInstructions && (
                      <div className="text-[9px] italic pl-2 text-black">
                        * {it.specialInstructions}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px] mt-0.5">
                      <span>
                        {it.quantity} x Rs.{Number(it.price).toFixed(2)}
                      </span>
                      <span className="font-bold text-right">
                        Rs.{formatCurrency(itemTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Items count */}
            <div className="text-[11px] my-1">
              Items count: {totalItemsCount}
            </div>

            {/* Dashed Separator */}
            <div className="border-b border-dashed border-black my-1.5"></div>

            {/* Totals Section */}
            <div className="space-y-0.5 my-1.5 text-[11px]">
              <div className="flex justify-between items-center text-[13px] font-black">
                <span>TOTAL:</span>
                <span>Rs.{formatCurrency(data.total || data.grandTotal)}</span>
              </div>

              {data.discount > 0 && (
                <div className="flex justify-between items-center text-[11px]">
                  <span>Discount:</span>
                  <span>- Rs.{formatCurrency(data.discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-[11px]">
                <span>
                  {data.paymentMethod === 'CARD'
                    ? 'Card:'
                    : data.paymentMethod === 'ONLINE'
                    ? 'Online:'
                    : 'Cash:'}
                </span>
                <span>
                  Rs.
                  {formatCurrency(
                    data.amountTendered || data.total || data.grandTotal
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span>Paid amount:</span>
                <span>Rs.{formatCurrency(data.total || data.grandTotal)}</span>
              </div>

              {Number(data.changeAmount || data.change || 0) > 0 && (
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span>Change:</span>
                  <span>
                    Rs.{formatCurrency(data.changeAmount || data.change)}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] leading-tight mt-3 pt-1 text-black">
              <div>We'd love to hear your feedback.</div>
              <div>Thanks for dinning with us!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintModal;
