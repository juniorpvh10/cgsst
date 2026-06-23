const { Client } = require('pg');
require('dotenv').config();

async function getForeignKeys() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    await client.connect();

    const query = `
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `;

    const res = await client.query(query);
    console.log("=== FOREIGN KEYS IN THE DATABASE ===");
    res.rows.forEach(row => {
      console.log(`Table: ${row.table_name} | Column: ${row.column_name} -> References: ${row.foreign_table_name}(${row.foreign_column_name})`);
    });

  } catch (err) {
    console.error('Error fetching foreign keys', err);
  } finally {
    await client.end();
  }
}

getForeignKeys();
