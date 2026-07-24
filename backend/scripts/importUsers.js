const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const pool = require('../src/db/pool');

const csvPath = path.join(
  __dirname,
  '..',
  'data',
  'jono_users_schema_ready.csv'
);

async function findCompanyId(companyName) {
  if (!companyName?.trim()) {
    return null;
  }

  const result = await pool.query(
    `
    SELECT id
    FROM companies
    WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
    LIMIT 1
    `,
    [companyName]
  );

  return result.rows[0]?.id ?? null;
}

async function importUser(row) {
  const name = row.name?.trim();
  const email = row.email?.trim().toLowerCase();
  const role = row.role?.trim() || 'member';
  const companyName = row.company_name?.trim();

  if (!name || !email) {
    console.log('Skipped row with missing name or email:', row);
    return {
      status: 'skipped',
      email,
    };
  }

  const allowedRoles = ['member', 'staff', 'admin'];

  const safeRole = allowedRoles.includes(role)
    ? role
    : 'member';

  const companyId = await findCompanyId(companyName);

  if (companyName && !companyId) {
    console.log(
      `Company not found for ${email}: "${companyName}". User will be imported without a company.`
    );
  }

  const result = await pool.query(
    `
    INSERT INTO users (
      name,
      email,
      role,
      company_id
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email)
    DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      company_id = COALESCE(
        EXCLUDED.company_id,
        users.company_id
      )
    RETURNING *
    `,
    [
      name,
      email,
      safeRole,
      companyId,
    ]
  );

  return {
    status: 'imported',
    user: result.rows[0],
  };
}

async function runImport() {
  const rows = [];

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

await new Promise((resolve, reject) => {
  fs.createReadStream(csvPath)
    .pipe(
      csv({
        mapHeaders: ({ header }) =>
          header.replace(/^\uFEFF/, '').trim(),
      })
    )
    .on('data', (row) => {
      rows.push(row);
    })
    .on('end', resolve)
    .on('error', reject);
});

  let importedCount = 0;
  let skippedCount = 0;

  try {
    for (const row of rows) {
      const result = await importUser(row);

      if (result.status === 'imported') {
        importedCount += 1;

        console.log(
          `Imported: ${result.user.name} <${result.user.email}>`
        );
      } else {
        skippedCount += 1;
      }
    }

    console.log('');
    console.log('Import complete.');
    console.log(`Imported or updated: ${importedCount}`);
    console.log(`Skipped: ${skippedCount}`);
  } finally {
    await pool.end();
  }
}

runImport().catch(async (error) => {
  console.error('User import failed:', error);

  try {
    await pool.end();
  } catch {
    // Ignore pool shutdown errors.
  }

  process.exit(1);
});