import { Resend } from 'resend';
import { env } from '../config/env.js';

let _resend = null;
function getResend() {
  if (!env.resendApiKey) return null;
  if (!_resend) _resend = new Resend(env.resendApiKey);
  return _resend;
}

const FROM = 'niyah <onboarding@resend.dev>';
const RED = '#cc0000';
const CREAM = '#f5f0ee';

function itemsTableHtml(items, currency) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe8;color:#333;">
          ${item.name}${item.size ? ` (${item.size})` : ''} &times; ${item.qty}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe8;text-align:right;font-weight:600;color:#1a1a1a;">
          ${currency} ${(item.unitPrice * item.qty).toLocaleString('en-PK')}
        </td>
      </tr>`
    )
    .join('');
}

export async function sendAdminNewOrderEmail(order) {
  const resend = getResend();
  if (!resend || !env.adminEmail) return;

  const orderId = String(order._id).slice(-8).toUpperCase();
  const proofSection = order.payment?.proofUrl
    ? `<div style="margin-top:20px;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#888;margin:0 0 8px;">Payment Screenshot</p>
        <img src="${order.payment.proofUrl}" style="max-width:100%;border-radius:12px;border:1px solid #f0ebe8;" />
      </div>`
    : `<p style="color:#999;font-size:13px;margin-top:16px;font-style:italic;">No screenshot uploaded — customer may send proof via Instagram DM.</p>`;

  await resend.emails.send({
    from: FROM,
    to: env.adminEmail,
    subject: `New Order #${orderId} — ${order.customer.firstName} ${order.customer.lastName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px;border-radius:16px;">
        <h1 style="font-size:24px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">New Order Received</h1>
        <p style="color:${RED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin:0 0 24px;">Order #${orderId}</p>

        <div style="background:${CREAM};border-radius:12px;padding:16px;margin-bottom:24px;">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#888;margin:0 0 10px;">Customer</p>
          <p style="margin:0 0 4px;font-weight:700;color:#1a1a1a;">${order.customer.firstName} ${order.customer.lastName}</p>
          <p style="margin:0 0 4px;color:#555;">${order.customer.email}</p>
          <p style="margin:0 0 4px;color:#555;">${order.customer.phone}</p>
          <p style="margin:0;color:#555;">${order.customer.address}, ${order.customer.city}</p>
          ${order.customer.notes ? `<p style="margin:8px 0 0;color:#888;font-style:italic;">"${order.customer.notes}"</p>` : ''}
        </div>

        <table style="width:100%;border-collapse:collapse;">
          ${itemsTableHtml(order.items, order.currency)}
        </table>

        <div style="margin-top:16px;padding-top:16px;border-top:2px solid #f0ebe8;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="color:#888;">Subtotal</span>
            <span style="color:#333;">${order.currency} ${order.subtotal.toLocaleString('en-PK')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
            <span style="color:#888;">Shipping</span>
            <span style="color:#333;">${order.currency} ${order.shipping.toLocaleString('en-PK')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-weight:800;font-size:17px;">
            <span style="color:#1a1a1a;">Total</span>
            <span style="color:${RED};">${order.currency} ${order.total.toLocaleString('en-PK')}</span>
          </div>
        </div>

        <div style="margin-top:20px;">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#888;margin:0 0 4px;">Payment Method</p>
          <p style="margin:0;color:#1a1a1a;">${order.payment.method === 'bank_transfer' ? 'Bank Transfer (Meezan Bank)' : 'Wallet Transfer (NayaPay)'}</p>
        </div>

        ${proofSection}

        <p style="margin-top:32px;font-size:11px;color:#ccc;">niyah · Made with care. Worn with intention.</p>
      </div>
    `,
  });
}

export async function sendCustomerStatusEmail(order) {
  const resend = getResend();
  if (!resend) return;

  const { status } = order;
  const orderId = String(order._id).slice(-8).toUpperCase();
  const firstName = order.customer.firstName;

  const content = {
    confirmed: {
      subject: `Your niyah order is confirmed`,
      heading: 'Your order is confirmed!',
      body: `We've verified your payment and your order is being carefully prepared. We'll send you another update when it ships.`,
    },
    shipped: {
      subject: `Your niyah order is on its way`,
      heading: `Your order is on its way!`,
      body: `Your niyah order has been shipped and is heading to you. Keep an eye out for delivery.`,
    },
    delivered: {
      subject: `Your niyah order has been delivered`,
      heading: `Your order has been delivered!`,
      body: `We hope you love your new piece. Thank you for choosing niyah — wear it with intention.`,
    },
  };

  if (!content[status]) return;

  const { subject, heading, body } = content[status];

  await resend.emails.send({
    from: FROM,
    to: order.customer.email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px;border-radius:16px;">
        <h1 style="font-size:24px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">${heading}</h1>
        <p style="color:${RED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin:0 0 24px;">Order #${orderId}</p>

        <p style="color:#555;line-height:1.7;margin:0 0 24px;">Hi ${firstName}, ${body}</p>

        <div style="background:${CREAM};border-radius:12px;padding:16px;margin-bottom:24px;">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#888;margin:0 0 10px;">Your Items</p>
          <table style="width:100%;border-collapse:collapse;">
            ${itemsTableHtml(order.items, order.currency)}
          </table>
          <div style="display:flex;justify-content:space-between;font-weight:800;font-size:15px;margin-top:12px;padding-top:12px;border-top:1px solid #e8e3e0;">
            <span style="color:#1a1a1a;">Total</span>
            <span style="color:${RED};">${order.currency} ${order.total.toLocaleString('en-PK')}</span>
          </div>
        </div>

        <p style="color:#888;font-size:13px;margin:0;">
          Questions? DM us on Instagram
          <a href="https://instagram.com/niyahbynayyab" style="color:${RED};font-weight:600;">@niyahbynayyab</a>
        </p>

        <p style="margin-top:24px;font-size:11px;color:#ccc;">niyah · Made with care. Worn with intention.</p>
      </div>
    `,
  });
}
