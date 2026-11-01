import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Order, LedgerEntry } from '../types';

export const generateOrderInvoicePdf = async (order: Order): Promise<string> => {
  const itemsRows = order.items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">
        <strong>${item.product.title}</strong><br/>
        <span style="font-size: 11px; color: #64748B;">Brand: ${item.product.brand} | Unit: ${item.product.unitType} | Warranty: ${item.product.warrantyDuration}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: right;">৳${item.unitPrice.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: bold;">৳${item.subtotal.toLocaleString()}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice ${order.invoiceNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0B1B3A; padding-bottom: 18px; margin-bottom: 24px; }
          .logo-text { font-size: 26px; font-weight: 800; color: #0B1B3A; letter-spacing: -0.5px; }
          .logo-text span { color: #FFB703; }
          .tagline { font-size: 11px; color: #64748B; font-weight: 500; text-transform: uppercase; }
          .invoice-tag { text-align: right; }
          .invoice-title { font-size: 24px; font-weight: 800; color: #2563EB; margin: 0; }
          .invoice-meta { font-size: 12px; color: #64748B; margin-top: 4px; }
          .billing-info { display: flex; justify-content: space-between; margin-bottom: 24px; background: #F8FAFC; padding: 16px; border-radius: 8px; }
          .info-box { width: 48%; }
          .info-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748B; margin-bottom: 6px; }
          .info-name { font-size: 15px; font-weight: bold; color: #0B1B3A; margin-bottom: 2px; }
          .info-detail { font-size: 12px; color: #334155; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #0B1B3A; color: #FFFFFF; font-size: 12px; font-weight: 600; padding: 10px; text-transform: uppercase; }
          .totals-table { width: 340px; margin-left: auto; margin-bottom: 24px; }
          .totals-table td { padding: 6px 10px; font-size: 13px; }
          .grand-total { font-size: 16px; font-weight: 800; color: #0B1B3A; border-top: 2px solid #0B1B3A; }
          .due-row { color: #DC2626; font-weight: bold; background: #FEF2F2; border-radius: 4px; }
          .paid-row { color: #059669; font-weight: bold; background: #ECFDF5; border-radius: 4px; }
          .footer { text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 11px; color: #94A3B8; margin-top: 30px; }
          .stamp { display: inline-block; border: 2px dashed #059669; color: #059669; padding: 6px 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-text">Volt<span>Mart</span></div>
            <div class="tagline">Wholesale Electrical B2B Marketplace</div>
          </div>
          <div class="invoice-tag">
            <h1 class="invoice-title">TAX INVOICE</h1>
            <div class="invoice-meta">Invoice #: <strong>${order.invoiceNumber}</strong></div>
            <div class="invoice-meta">Order Date: <strong>${order.createdAt}</strong></div>
            <div class="invoice-meta">Payment Mode: <strong>${order.paymentMethod.toUpperCase()} (${order.paymentChannel})</strong></div>
          </div>
        </div>

        <div class="billing-info">
          <div class="info-box">
            <div class="info-title">Manufacturer / Supplier:</div>
            <div class="info-name">${order.companyName}</div>
            <div class="info-detail">VoltMart Verified B2B Electrical Partner</div>
            <div class="info-detail">BSTI & ISO 9001 Certified Quality</div>
          </div>
          <div class="info-box" style="text-align: right;">
            <div class="info-title">Billed To (Retailer / Shopkeeper):</div>
            <div class="info-name">${order.buyerShopName}</div>
            <div class="info-detail">Proprietor: ${order.buyerName}</div>
            <div class="info-detail">Phone: ${order.buyerPhone}</div>
            <div class="info-detail">Address: ${order.buyerAddress}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th style="text-align: left;">Product Item & Specification</th>
              <th style="width: 70px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Unit Wholesale</th>
              <th style="width: 110px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Items Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">৳${order.subtotal.toLocaleString()}</td>
          </tr>
          ${
            order.bulkDiscount > 0
              ? `<tr>
                  <td>Bulk Quantity Discount:</td>
                  <td style="text-align: right; color: #059669; font-weight: 600;">-৳${order.bulkDiscount.toLocaleString()}</td>
                </tr>`
              : ''
          }
          <tr>
            <td>Transport / Delivery Charge:</td>
            <td style="text-align: right;">৳${order.deliveryCharge.toLocaleString()}</td>
          </tr>
          <tr>
            <td>VAT / Tax (5% Inclusive):</td>
            <td style="text-align: right;">৳${order.vatAmount.toLocaleString()}</td>
          </tr>
          <tr class="grand-total">
            <td>Total Invoice Amount:</td>
            <td style="text-align: right;">৳${order.totalAmount.toLocaleString()}</td>
          </tr>
          <tr class="paid-row">
            <td>Amount Paid (Now):</td>
            <td style="text-align: right;">৳${order.paidAmount.toLocaleString()}</td>
          </tr>
          <tr class="due-row">
            <td>Remaining Due (বাকি):</td>
            <td style="text-align: right;">৳${order.dueAmount.toLocaleString()}</td>
          </tr>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px;">
          <div>
            <div class="stamp">${order.paymentStatus === 'PAID' ? 'FULLY PAID' : order.paymentStatus === 'PARTIAL' ? 'PARTIALLY PAID' : 'CREDIT / DUE'}</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Recorded in VoltMart Digital B2B Ledger</div>
          </div>
          <div style="text-align: center; border-top: 1px solid #64748B; width: 180px; padding-top: 6px; font-size: 11px;">
            Authorized Signature
          </div>
        </div>

        <div class="footer">
          Thank you for trading wholesale on VoltMart • Powered by VoltMart B2B Engine • 24/7 Support: support@voltmart.com
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
    return uri;
  } catch (error) {
    console.error('Invoice PDF Generation failed', error);
    throw error;
  }
};

export const generateLedgerStatementPdf = async (
  buyerName: string,
  buyerShop: string,
  entries: LedgerEntry[],
  totalPurchased: number,
  totalPaid: number,
  totalDue: number
): Promise<string> => {
  const rows = entries
    .map(
      (entry, idx) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${idx + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${entry.date}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-weight: 600;">${entry.companyName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #475569;">
        ${entry.type === 'PURCHASE' ? 'Wholesale Purchase' : 'Due Installment Payment'}
        ${entry.productSummary ? `<br/><span style="color:#64748B;">${entry.productSummary}</span>` : ''}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">৳${(entry.totalAmount || 0).toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right; color: #059669; font-weight: 600;">৳${entry.paidAmount.toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right; color: ${entry.dueAmount > 0 ? '#DC2626' : '#64748B'}; font-weight: 600;">
        ৳${(entry.dueAmount || 0).toLocaleString()}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: bold;">৳${entry.newBalance.toLocaleString()}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Wholesale Ledger Statement</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 24px; }
          .header { border-bottom: 2px solid #0B1B3A; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; }
          .logo { font-size: 22px; font-weight: bold; color: #0B1B3A; }
          .logo span { color: #FFB703; }
          .summary-grid { display: flex; gap: 12px; margin-bottom: 20px; }
          .card { flex: 1; padding: 12px; border-radius: 8px; background: #F8FAFC; border: 1px solid #E2E8F0; text-align: center; }
          .card-title { font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: bold; }
          .card-value { font-size: 18px; font-weight: 800; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #0B1B3A; color: white; padding: 8px; font-weight: 600; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Volt<span>Mart</span></div>
            <div style="font-size: 12px; color: #64748B;">Official B2B Wholesale Ledger Statement (বাকি খাতা)</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: bold;">${buyerShop}</div>
            <div style="font-size: 11px; color: #64748B;">Proprietor: ${buyerName}</div>
            <div style="font-size: 11px; color: #64748B;">Generated: ${new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="card">
            <div class="card-title">Total Purchased</div>
            <div class="card-value" style="color: #0B1B3A;">৳${totalPurchased.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Paid</div>
            <div class="card-value" style="color: #059669;">৳${totalPaid.toLocaleString()}</div>
          </div>
          <div class="card" style="background: #FEF2F2; border-color: #FECACA;">
            <div class="card-title" style="color: #DC2626;">Outstanding Due (বাকি)</div>
            <div class="card-value" style="color: #DC2626;">৳${totalDue.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: center;">#</th>
              <th>Date</th>
              <th>Manufacturer</th>
              <th>Description / Products</th>
              <th style="text-align: right;">Order Total</th>
              <th style="text-align: right;">Paid</th>
              <th style="text-align: right;">Due</th>
              <th style="text-align: right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #94A3B8;">
          VoltMart B2B Ledger Engine • Transparent Accounting Between Retailers & Electrical Companies
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
    return uri;
  } catch (error) {
    console.error('Ledger Statement PDF Generation failed', error);
    throw error;
  }
};

