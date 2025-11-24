const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

/**
 * Apply DB security script (roles, grants, procedures) if enabled.
 * Controlled by env APPLY_DB_SECURITY=true to avoid unexpected DDL in dev.
 */
const applyDbSecurity = async () => {
  const filePath = path.resolve(__dirname, '..', 'db_security.sql');
  if (!fs.existsSync(filePath)) {
    console.warn('⚠️  db_security.sql not found; skipping DB security bootstrap.');
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  let delimiter = ';';
  let buffer = '';
  const statements = [];

  // Minimal parser to respect custom DELIMITER blocks (//) used for procedures
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.toUpperCase().startsWith('DELIMITER ')) {
      delimiter = line.substring('DELIMITER '.length);
      continue;
    }

    buffer += `${line}\n`;
    const trimmed = buffer.trimEnd();
    if (trimmed.endsWith(delimiter)) {
      const stmt = trimmed.slice(0, -delimiter.length).trim();
      if (stmt) statements.push(stmt);
      buffer = '';
    }
  }

  if (statements.length === 0) {
    console.warn('⚠️  No statements parsed from db_security.sql; skipping.');
    return;
  }

  const connection = await pool.getConnection();
  try {
    for (const stmt of statements) {
      await connection.query(stmt);
    }
    console.log('✅ DB security script applied (roles/grants/procedures).');
  } catch (err) {
    console.error('❌ Failed to apply DB security script:', err.message);
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = { applyDbSecurity };
