import pg from 'pg';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let memDb = null;
let isUsingMemoryDb = false;

/**
 * Initialize PostgreSQL in-memory instance for testing / offline development
 */
const initMemoryDb = () => {
  if (memDb) return memDb;
  
  const db = newDb();
  
  // Register basic functions needed
  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'nexuschat_mem'
  });
  db.public.registerFunction({
    name: 'version',
    implementation: () => 'PostgreSQL 15.0 (pg-mem)'
  });

  // Load and execute schema.sql
  const schemaPath = path.resolve(__dirname, '../db/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.public.none(schemaSql);
  }

  const adapter = db.adapters.createPg();
  pool = new adapter.Pool();
  isUsingMemoryDb = true;
  logger.info('Database initialized with PostgreSQL in-memory engine (pg-mem)');
  return pool;
};

/**
 * Initialize PostgreSQL connection pool.
 * Attempts real PostgreSQL connection; falls back gracefully to in-memory PostgreSQL engine if unreachable.
 */
export const initDb = async () => {
  if (pool) return pool;

  // If forced memory or no connection string
  if (process.env.USE_MEMORY_DB === 'true') {
    return initMemoryDb();
  }

  try {
    const realPool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.dbSsl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 2000
    });

    // Test connectivity
    const client = await realPool.connect();
    await client.query('SELECT 1');
    client.release();

    pool = realPool;
    isUsingMemoryDb = false;
    logger.info('Connected to PostgreSQL database instance');
    return pool;
  } catch (err) {
    logger.warn(`Could not connect to external PostgreSQL (${err.message}). Falling back to in-memory PostgreSQL engine.`);
    return initMemoryDb();
  }
};

/**
 * Primary parameterized query method.
 * Enforces parameterized queries and returns standard { rows, rowCount }.
 */
export const query = async (text, params = []) => {
  if (!pool) {
    await initDb();
  }
  return pool.query(text, params);
};

export const getClient = async () => {
  if (!pool) {
    await initDb();
  }
  return pool.connect();
};

export const isMemoryDatabase = () => isUsingMemoryDb;

export default {
  query,
  getClient,
  initDb,
  isMemoryDatabase
};
