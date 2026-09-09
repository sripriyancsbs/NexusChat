import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, initDb, isMemoryDatabase } from '../config/db.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  logger.info('Starting database migration...');
  await initDb();

  if (isMemoryDatabase()) {
    logger.info('Database schema migration verified (in-memory).');
    return true;
  }

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await query(schemaSql);
    logger.info('Database schema migration completed successfully.');
    return true;
  } catch (err) {
    logger.error('Database migration failed', { error: err.message });
    throw err;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => {
      logger.info('Migration runner finished.');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}
