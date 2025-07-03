const express = require('express');
const path = require('path');

const embedDir = path.join(__dirname, 'embed');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the embed directory
app.use(express.static(embedDir));

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
app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'embed')}`);
});