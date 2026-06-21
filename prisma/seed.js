const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Inspecting User table columns...');
  const tableName = 'User';
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema='public' AND lower(table_name) = lower(${tableName})
  `;

  if (!cols || cols.length === 0) {
    console.log('No columns found for table', tableName);
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    const tableList = tables.map(t => t.table_name);
    console.log('Public tables in database:', tableList);

    // Try to find a matching table (plural / lowercased)
    const lowerName = tableName.toLowerCase();
    const fallback = tableList.find(t => t.toLowerCase() === `${lowerName}s`) || tableList.find(t => t.toLowerCase().includes(lowerName));
    if (!fallback) {
      console.log('No matching fallback table found. Aborting seed.');
      return;
    }

    console.log('Falling back to table:', fallback);
    // re-query columns for the fallback table
    const cols2 = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema='public' AND lower(table_name) = lower(${fallback})
    `;
    if (!cols2 || cols2.length === 0) {
      console.log('Still no columns for fallback table. Aborting.');
      return;
    }

    // use fallback table name going forward
    cols.length = 0; // clear
    cols.push(...cols2);
    // also override the tableName variable used later
    // (we'll use 'users' -> prisma.user at runtime)
  }

  const required = cols.filter(c => c.column_name !== 'id' && c.is_nullable === 'NO');
  const sample = {};

  // helper: snake_case -> camelCase
  const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

  for (const c of required) {
    const name = c.column_name;
    const camel = toCamel(name);
    const type = c.data_type || '';
    let value;
    if (/timestamp|date/.test(type)) value = new Date();
    else if (/int|numeric|double|real/.test(type)) value = 1;
    else if (/bool/.test(type)) value = true;
    else if (name === 'email') value = 'seed+alice@example.com';
    else value = `${name}_seed`;
    sample[camel] = value;
  }

  // Decide unique field to upsert on
  const hasEmail = cols.some(c => c.column_name === 'email');
  const where = hasEmail ? { email: sample.email } : { id: 1 };

  console.log('Upserting sample user with:', sample);

  try {
    await prisma.user.upsert({ where, update: {}, create: sample });
    console.log('Seed successful');
  } catch (e) {
    console.error('Seed failed:', e.message || e);
    throw e;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
