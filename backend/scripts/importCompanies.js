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

async function companyExists(companyName) {
  const result = await pool.query(
    `
    SELECT id
    FROM companies
    WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
    LIMIT 1
    `,
    [companyName]
  );

  return result.rows.length > 0;
}

async function createCompany(companyName) {
  const result = await pool.query(
    `
    INSERT INTO companies (name)
    VALUES ($1)
    RETURNING *
    `,
    [companyName]
  );

  return result.rows[0];
}

async function runImport() {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const companyNames = new Set();

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(
        csv({
          mapHeaders: ({ header }) =>
            header.replace(/^\uFEFF/, '').trim(),
        })
      )
      .on('data', (row) => {
        const companyName = row.company_name?.trim();

        if (companyName) {
          companyNames.add(companyName);
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  let createdCount = 0;
  let existingCount = 0;

  try {
    const sortedCompanies = [...companyNames].sort((a, b) =>
      a.localeCompare(b)
    );

    for (const companyName of sortedCompanies) {
      const exists = await companyExists(companyName);

      if (exists) {
        console.log(`Already exists: ${companyName}`);
        existingCount += 1;
        continue;
      }

      const company = await createCompany(companyName);

      console.log(
        `Created: ${company.name} (ID: ${company.id})`
      );

      createdCount += 1;
    }

    console.log('');
    console.log('Company import complete.');
    console.log(`Created: ${createdCount}`);
    console.log(`Already existed: ${existingCount}`);
  } finally {
    await pool.end();
  }
}

runImport().catch(async (error) => {
  console.error('Company import failed:', error);

  try {
    await pool.end();
  } catch {
    // Ignore shutdown errors.
  }

  process.exit(1);
});