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
        style={{
          width: receiptWidthPx,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          fontSize: '13px',
          lineHeight: '1.25',
          padding: '4px 6px',
          boxSizing: 'border-box',
        }}
        className="bg-white text-black font-sans select-text"
      >
        {isPrepSlip ? (
          /* ========================================================= */
          /*                       KOT RECEIPT                         */
          /* ========================================================= */
          <div
            className="text-left font-sans text-black"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
          >
            {/* Top KOT Header */}
            <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.5px', marginBottom: '4px' }}>
              KOT{department && department !== 'ALL' ? ` - ${getDeptDisplayName(department)}` : ''}
            </div>

            {/* Meta details */}
            <div style={{ fontSize: '13.5px', fontWeight: '500', lineHeight: '1.35', marginBottom: '6px' }}>
              <div>User: {kotUserName}</div>
              <div>Table: {tableName}</div>
              <div>Round: {roundNum}</div>
              <div>Time: {formatKotDateTime(data.createdAt || Date.now())}</div>
            </div>

            {/* Dashed line */}
            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

            {/* Items */}
            <div style={{ margin: '6px 0' }}>
              {kotItems.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '700', textTransform: 'uppercase', lineHeight: '1.25' }}>
                    {item.quantity} x {item.name?.toUpperCase()}
                  </div>
                  {item.specialInstructions && (
                    <div style={{ fontSize: '12px', fontStyle: 'italic', paddingLeft: '10px', color: '#111' }}>
                      * {item.specialInstructions}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Dashed line */}
            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

            {/* Bottom KOT Tag */}
            <div style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '0.5px', marginTop: '4px' }}>
              KOT
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /*                 CUSTOMER FINAL BILL / RECEIPT             */
          /* ========================================================= */
          <div
            className="text-black font-sans"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
          >
            {/* Top Billing Logo */}
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <img
                src={billingLogo}
                alt="Ice Talk Logo"
                style={{
                  width: '76px',
                  height: '76px',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block',
                }}
              />
            </div>

            {/* Restaurant Title & Address */}
            <div
              style={{
                textAlign: 'center',
                fontWeight: '800',
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                lineHeight: '1.2',
              }}
            >
              <div>ICE TALK FAMILY</div>
              <div>RESTAURANT</div>
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '500',
                lineHeight: '1.3',
                marginTop: '4px',
                marginBottom: '8px',
              }}
            >
              <div>No. 08, KACHCHERI ROAD, PUTTALAM</div>
              <div>61300 PUTTALAM</div>
              <div style={{ fontWeight: '700' }}>0777313285</div>
            </div>

            {/* Receipt Meta */}
            <div
              style={{
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: '500',
                lineHeight: '1.35',
                margin: '6px 0',
              }}
            >
              <div>Receipt No.: {data.saleNumber || data.receiptNumber || '26-200-049324'}</div>
              <div>{formatReceiptDateTime(data.createdAt || Date.now())}</div>
              <div>User: {billUserName}</div>
              <div>Order No.: {orderRefText}</div>
            </div>

            {/* Dashed Separator */}
            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

            {/* Item List */}
            <div style={{ margin: '6px 0' }}>
              {data.items?.map((it, idx) => {
                const itemTotal = it.total || Number(it.price) * Number(it.quantity);
                return (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', textTransform: 'uppercase', lineHeight: '1.2' }}>
                      {it.name}
                    </div>
                    {it.specialInstructions && (
                      <div style={{ fontSize: '11px', fontStyle: 'italic', paddingLeft: '8px', color: '#111' }}>
                        * {it.specialInstructions}
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                        lineHeight: '1.2',
                        marginTop: '2px',
                      }}
                    >
                      <span>
                        {it.quantity} x Rs.{Number(it.price).toFixed(2)}
                      </span>
                      <span style={{ fontWeight: '600', textAlign: 'right' }}>
                        Rs.{formatCurrency(itemTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Items count */}
            <div style={{ fontSize: '13px', fontWeight: '500', margin: '5px 0' }}>
              Items count: {totalItemsCount}
            </div>

            {/* Dashed Separator */}
            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

            {/* Totals Section */}
            {(() => {
              const itemsSubtotal = (data.items || []).reduce(
                (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1),
                0
              );
              const subtotalAmt =
                Number(data.subtotal || 0) > 0
                  ? Number(data.subtotal)
                  : itemsSubtotal > 0
                  ? itemsSubtotal
                  : Number(data.total || data.grandTotal || 0) + Number(data.discount || 0);

              let discountAmt = Number(data.discount || data.discountAmount || 0);
              let pctVal = Number(data.discountPercentage || 0);

              if (pctVal > 0 && discountAmt === 0 && subtotalAmt > 0) {
                discountAmt = Math.round(((subtotalAmt * pctVal) / 100) * 100) / 100;
              } else if (discountAmt > 0 && pctVal === 0 && subtotalAmt > 0) {
                pctVal = Math.round(((discountAmt / subtotalAmt) * 100) * 10) / 10;
              } else if (discountAmt === 0 && subtotalAmt > Number(data.total || data.grandTotal || 0)) {
                discountAmt = Math.max(0, subtotalAmt - Number(data.total || data.grandTotal || 0));
                if (subtotalAmt > 0) {
                  pctVal = Math.round(((discountAmt / subtotalAmt) * 100) * 10) / 10;
                }
              }

              const hasDiscount = discountAmt > 0;
              let pctLabel = '';
              if (pctVal > 0) {
                pctLabel = pctVal % 1 === 0 ? pctVal.toFixed(0) : pctVal.toFixed(1);
              }

              return (
                <div style={{ fontSize: '13px', margin: '6px 0' }}>
                  {hasDiscount && (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px',
                          marginBottom: '3px',
                        }}
                      >
                        <span>Subtotal:</span>
                        <span>Rs.{formatCurrency(subtotalAmt)}</span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px',
                          fontWeight: '600',
                          marginBottom: '3px',
                        }}
                      >
                        <span>Discount{pctLabel ? ` (${pctLabel}%)` : ''}:</span>
                        <span>- Rs.{formatCurrency(discountAmt)}</span>
                      </div>

                      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>
                    </>
                  )}

                  {/* TOTAL */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '16px',
                      fontWeight: '900',
                      margin: '4px 0',
                    }}
                  >
                    <span>{hasDiscount ? 'NET TOTAL:' : 'TOTAL:'}</span>
                    <span>Rs.{formatCurrency(data.total || data.grandTotal)}</span>
                  </div>

                  {/* Payment Method / Cash */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px',
                      marginTop: '3px',
                    }}
                  >
                    <span>
                      {data.paymentMethod === 'CARD'
                        ? 'Card:'
                        : data.paymentMethod === 'ONLINE'
                        ? 'Online:'
                        : 'Cash:'}
                    </span>
                    <span>
                      Rs.{formatCurrency(data.amountTendered || data.total || data.grandTotal)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px',
                      marginTop: '3px',
                    }}
                  >
                    <span>Paid amount:</span>
                    <span>Rs.{formatCurrency(data.total || data.grandTotal)}</span>
                  </div>

                  {Number(data.changeAmount || data.change || 0) > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginTop: '3px',
                      }}
                    >
                      <span>Change:</span>
                      <span>Rs.{formatCurrency(data.changeAmount || data.change)}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Dashed Separator before Footer */}
            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

            {/* Footer */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '500',
                lineHeight: '1.35',
                marginTop: '6px',
                color: '#000',
              }}
            >
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
