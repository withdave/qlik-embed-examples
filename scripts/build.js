#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Build script for qlik-embed-examples
 * 
 * This script:
 * 1. Loads environment variables from .env file (if exists)
 * 2. Creates a build directory
 * 3. Copies all files from embed/ to build/
 * 4. Replaces Qlik placeholders in HTML files with environment variables
 * 5. Provides fallback values for local development if .env is not configured
 */

const EMBED_DIR = path.join(__dirname, '..', 'embed');
const BUILD_DIR = path.join(__dirname, '..', 'build');

// Qlik configuration with fallback values for local development
const QLIK_CONFIG = {
  host: process.env.QLIK_HOST || 'your-tenant.qlikcloud.com',
  clientId: process.env.QLIK_CLIENT_ID || 'your-client-id',
  accessCode: process.env.QLIK_ACCESS_CODE || 'your-access-code',
  appId: process.env.QLIK_APP_ID || 'your-app-id'
};

/**
 * Escape special characters for sed replacement
 */
function escapeForSed(str) {
  return str.replace(/[&/\\]/g, '\\$&');
}

/**
 * Replace placeholders in a file
 */
function replacePlaceholders(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace placeholders with actual values
    content = content.replace(/\{\{qlikHost\}\}/g, QLIK_CONFIG.host);
    content = content.replace(/\{\{qlikClientId\}\}/g, QLIK_CONFIG.clientId);
    content = content.replace(/\{\{qlikAccessCode\}\}/g, QLIK_CONFIG.accessCode);
    content = content.replace(/\{\{qlikAppId\}\}/g, QLIK_CONFIG.appId);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed: ${path.relative(process.cwd(), filePath)}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Main build function
 */
function build() {
  console.log('Starting build process...');
  
  // Check if embed directory exists
  if (!fs.existsSync(EMBED_DIR)) {
    console.error(`Embed directory not found: ${EMBED_DIR}`);
    process.exit(1);
  }
  
  // Create build directory
  if (fs.existsSync(BUILD_DIR)) {
    console.log('Cleaning existing build directory...');
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  }
  
  console.log('Creating build directory...');
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  
  // Copy all files from embed to build
  console.log('Copying files from embed/ to build/...');
  copyDirectory(EMBED_DIR, BUILD_DIR);
  
  // Process HTML files to replace placeholders
  console.log('Replacing Qlik placeholders in HTML files...');
  const htmlFiles = fs.readdirSync(BUILD_DIR)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(BUILD_DIR, file));
  
  for (const htmlFile of htmlFiles) {
    replacePlaceholders(htmlFile);
  }
  
  // Display configuration being used
  console.log('\nBuild configuration:');
  console.log(`  QLIK_HOST: ${QLIK_CONFIG.host}`);
  console.log(`  QLIK_CLIENT_ID: ${QLIK_CONFIG.clientId}`);
  console.log(`  QLIK_ACCESS_CODE: ${QLIK_CONFIG.accessCode}`);
  console.log(`  QLIK_APP_ID: ${QLIK_CONFIG.appId}`);
  
  if (QLIK_CONFIG.host.includes('your-tenant') || 
      QLIK_CONFIG.clientId.includes('your-client') ||
      QLIK_CONFIG.accessCode.includes('your-access') ||
      QLIK_CONFIG.appId.includes('your-app')) {
    console.log('\nUsing fallback values for local development.');
    console.log('Set environment variables for production values:');
    console.log('  export QLIK_HOST="your-actual-host"');
    console.log('  export QLIK_CLIENT_ID="your-actual-client-id"');
    console.log('  export QLIK_ACCESS_CODE="your-actual-access-code"');
    console.log('  export QLIK_APP_ID="your-actual-app-id"');
  }
  
  console.log('\nBuild completed successfully!');
  console.log(`Build output: ${BUILD_DIR}`);
}

// Run build if this script is executed directly
if (require.main === module) {
  build();
}

module.exports = { build, QLIK_CONFIG };
