import 'server-only'
import { env } from '@/lib/env'

export interface EmailDigestData {
  userName: string
  month: string              // e.g. "June 2026"
  totalIncome: number
  totalExpenses: number
  balance: number
  topCategories: Array<{ name: string; total: number }>
  transactionCount: number
  currency: string
}

function formatAmount(n: number, currency: string) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency
}

function buildDigestHtml(data: EmailDigestData): string {
  const balanceColor = data.balance >= 0 ? '#059669' : '#dc2626'
  const categoryRows = data.topCategories
    .slice(0, 5)
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 0;color:#475569;font-size:14px">${c.name}</td>
        <td style="padding:8px 0;text-align:right;font-size:14px;font-weight:600;color:#0f172a">
          ${formatAmount(c.total, data.currency)}
        </td>
      </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">

        <!-- Header -->
        <tr><td style="background:#0f172a;padding:32px;text-align:center">
          <p style="margin:0;color:#93c5fd;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">Monthly Digest</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700">${data.month}</h1>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:14px">Hi ${data.userName}</p>
        </td></tr>

        <!-- KPI strip -->
        <tr><td style="padding:32px 32px 0">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="text-align:center;padding:16px;background:#f8fafc;border-radius:12px">
                <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:600;letter-spacing:0.06em">Income</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#059669">${formatAmount(data.totalIncome, data.currency)}</p>
              </td>
              <td width="4%"></td>
              <td width="33%" style="text-align:center;padding:16px;background:#f8fafc;border-radius:12px">
                <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:600;letter-spacing:0.06em">Spent</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#dc2626">${formatAmount(data.totalExpenses, data.currency)}</p>
              </td>
              <td width="4%"></td>
              <td width="33%" style="text-align:center;padding:16px;background:#f8fafc;border-radius:12px">
                <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:600;letter-spacing:0.06em">Balance</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:${balanceColor}">${formatAmount(Math.abs(data.balance), data.currency)}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Top categories -->
        ${
          data.topCategories.length > 0
            ? `<tr><td style="padding:28px 32px 0">
          <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a">Top spending categories</h2>
          <table width="100%" cellpadding="0" cellspacing="0">${categoryRows}</table>
        </td></tr>`
            : ''
        }

        <!-- CTA -->
        <tr><td style="padding:32px;text-align:center">
          <p style="margin:0 0 20px;font-size:14px;color:#64748b">
            You had <strong>${data.transactionCount}</strong> transactions this month.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://reckon.app'}"
             style="display:inline-block;background:#1e40af;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">
            View full analytics →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center">
          <p style="margin:0;font-size:12px;color:#94a3b8">
            You received this because you have a Reckon account.
            Manage your email preferences in <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://reckon.app'}/settings" style="color:#1e40af">settings</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendMonthlyDigest(
  to: string,
  data: EmailDigestData,
): Promise<{ ok: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping digest email')
    return { ok: false, error: 'Email service not configured' }
  }

  const html = buildDigestHtml(data)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject: `Your ${data.month} financial summary — Reckon`,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return { ok: false, error: `Resend API error ${res.status}: ${body}` }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
