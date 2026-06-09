const fs = require('fs');
const path = require('path');
const { safeQuery } = require('../configurations/sqlConfig/db');

// Ensure logs folder
const logDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Kenyan DateTime
function getKenyanDateTime() {
  const dt = new Date().toLocaleString('en-US', {
    timeZone: 'Africa/Nairobi',
    hour12: false,
  });
  return new Date(dt).toISOString().slice(0, 19).replace('T', ' ');
}

// Fractional days
function getFractionalDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const ms = 1000 * 60 * 60 * 24;
  const diff = (e - s) / ms;
  return diff > 0 ? diff : 0;
}

// Main updater - updates ONLY the `billing` field daily
async function updateDeceasedCharges() {
  const now = getKenyanDateTime();
  console.log(`[${now}] 🔄 Updating daily billing for deceased...`);

  try {
    const deceasedList = await safeQuery(`
      SELECT deceased_id, currency, rate_category, usd_charge_rate, date_admitted, status, created_at, billing
      FROM deceased
      WHERE status IS NULL OR status != 'Complete'
    `);

    for (const d of deceasedList) {
      const { deceased_id, currency, rate_category, usd_charge_rate, date_admitted, status, created_at, billing } = d;

      if (status === 'Deceased') continue;

      const admissionDate = date_admitted ? new Date(date_admitted) : new Date(created_at);
      const daysInMorgue = getFractionalDays(admissionDate, new Date());
      if (daysInMorgue <= 0) continue;

      const dailyRate = currency === 'USD' ? parseFloat(usd_charge_rate || 130) : (rate_category === 'premium' ? 5000 : 3000);

      // Update the billing field (add today's charge)
      const newBilling = parseFloat(billing || 0) + dailyRate;

      await safeQuery(
        `UPDATE deceased SET billing = ?, updated_at = ? WHERE deceased_id = ?`,
        [newBilling.toFixed(2), now, deceased_id]
      );

      console.log(`  ✅ ${deceased_id} billing updated: +${dailyRate} ${currency} (Total: ${newBilling.toFixed(2)} ${currency})`);
    }

    console.log(`\n[${now}] ✅ Daily billing update complete\n`);
  } catch (err) {
    const errorLog = `[${new Date().toISOString()}] ERROR: ${err.message}\n${err.stack}\n\n`;
    fs.appendFileSync(path.join(logDir, 'deceasedChargeErrors.log'), errorLog);
    console.error(err);
  }
}

module.exports = { updateDeceasedCharges };
