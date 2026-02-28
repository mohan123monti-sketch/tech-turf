#!/usr/bin/env node

/**
 * Tech Turf Real-time Verification Script
 * Tests Supabase connection and real-time setup
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const { Pool } = pg;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║     Tech Turf Real-time Setup Verification Script           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(type, message) {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  const color = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.cyan
  };
  
  console.log(`${color[type]}${icons[type]} ${message}${colors.reset}`);
}

async function testPostgreSQL() {
  console.log(`\n${colors.blue}1. Testing PostgreSQL Connection...${colors.reset}`);
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    log('error', 'DATABASE_URL not set in .env');
    return false;
  }
  
  log('info', `Attempting to connect to Supabase PostgreSQL...`);
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const result = await pool.query('SELECT version();');
    const version = result.rows[0].version;
    log('success', `PostgreSQL connected: ${version.substring(0, 50)}...`);
    
    // Check tables
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const tables = tableResult.rows.map(r => r.table_name);
    log('info', `Found ${tables.length} tables: ${tables.slice(0, 5).join(', ')}${tables.length > 5 ? '...' : ''}`);
    
    await pool.end();
    return true;
  } catch (error) {
    log('error', `PostgreSQL connection failed: ${error.message}`);
    return false;
  }
}

async function testSupabase() {
  console.log(`\n${colors.blue}2. Testing Supabase Real-time Client...${colors.reset}`);
  
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    log('warning', 'Supabase credentials not fully configured');
    log('info', `SUPABASE_URL: ${url ? '✓' : '✗'}`);
    log('info', `SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✓' : '✗'}`);
    log('info', `SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✓' : '✗'}`);
    return false;
  }
  
  try {
    const supabase = createClient(url, key);
    log('success', 'Supabase client initialized');
    return true;
  } catch (error) {
    log('error', `Supabase client failed: ${error.message}`);
    return false;
  }
}

async function checkEnvironment() {
  console.log(`\n${colors.blue}3. Checking Environment Variables...${colors.reset}`);
  
  const required = [
    'PORT',
    'DATABASE_URL',
    'SUPABASE_URL',
    'JWT_SECRET'
  ];
  
  const optional = [
    'SUPABASE_SERVICE_KEY',
    'SUPABASE_ANON_KEY',
    'NODE_ENV',
    'CORS_ORIGIN'
  ];
  
  let allMissing = false;
  
  console.log(`\n  Required Variables:`);
  required.forEach(env => {
    if (process.env[env]) {
      const value = env === 'JWT_SECRET' || env.includes('KEY') 
        ? `${process.env[env].substring(0, 20)}...`
        : process.env[env];
      log('success', `${env}: ${value}`);
    } else {
      log('error', `${env}: NOT SET`);
      allMissing = true;
    }
  });
  
  console.log(`\n  Optional Variables:`);
  optional.forEach(env => {
    if (process.env[env]) {
      const value = env.includes('KEY') || env.includes('SECRET')
        ? `${process.env[env].substring(0, 20)}...`
        : process.env[env];
      log('success', `${env}: ${value}`);
    } else {
      log('warning', `${env}: Not set (will use defaults)`);
    }
  });
  
  return !allMissing;
}

function checkPackages() {
  console.log(`\n${colors.blue}4. Checking Installed Packages...${colors.reset}`);
  
  const required = [
    'express',
    'pg',
    '@supabase/supabase-js',
    'ws'
  ];
  
  let allFound = true;
  
  required.forEach(pkg => {
    try {
      require(pkg);
      log('success', `${pkg}: ✓`);
    } catch {
      log('error', `${pkg}: NOT INSTALLED`);
      allFound = false;
    }
  });
  
  return allFound;
}

async function runTests() {
  try {
    const results = {
      postgresql: await testPostgreSQL(),
      supabase: await testSupabase(),
      environment: await checkEnvironment(),
      packages: checkPackages()
    };
    
    console.log(`\n${colors.blue}5. Test Summary...${colors.reset}\n`);
    
    const summary = [
      { label: 'PostgreSQL Connection', passed: results.postgresql },
      { label: 'Supabase Client', passed: results.supabase },
      { label: 'Environment Variables', passed: results.environment },
      { label: 'Required Packages', passed: results.packages }
    ];
    
    let allPassed = true;
    summary.forEach(({ label, passed }) => {
      if (passed) {
        log('success', label);
      } else {
        log('error', label);
        allPassed = false;
      }
    });
    
    console.log('\n' + '═'.repeat(60));
    
    if (allPassed) {
      log('success', 'All checks passed! Ready to start the server.');
      console.log(`\n  Start command: ${colors.cyan}npm start${colors.reset}`);
      console.log(`  WebSocket URL: ${colors.cyan}ws://localhost:5000/ws${colors.reset}`);
      console.log(`  Health check: ${colors.cyan}http://localhost:5000/health${colors.reset}\n`);
    } else {
      log('error', 'Some checks failed. Please review the configuration above.');
      console.log(`\n  Configuration file: ${colors.cyan}backend/.env${colors.reset}`);
      console.log(`  Setup guide: ${colors.cyan}SUPABASE_REALTIME_SETUP.md${colors.reset}\n`);
    }
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    log('error', `Verification failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

runTests();
