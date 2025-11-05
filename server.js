const express = require('express');
const path = require('path');
const { build } = require('./scripts/build');

const buildDir = path.join(__dirname, 'build');
const app = express();
const PORT = process.env.PORT || 3000;

// Run build process on startup
async function startServer() {
  console.log('Running build process...');
  try {
    await build();
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }

  // Start the server after build completes
  app.listen(PORT, () => {
    console.log(`Serving files from: ${buildDir}`);
    console.log(`Main app: http://localhost:${PORT}`);
  });
}

// Serve static files from the build directory
app.use(express.static(buildDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Qlik Sense Charts development server is running' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// Start the server
startServer();