const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the embed directory
app.use(express.static(path.join(__dirname, 'embed')));

// Serve the main index.html file at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'embed', 'index.html'));
});

// Serve other HTML files in the embed directory
app.get('/dual-chart-config', (req, res) => {
  res.sendFile(path.join(__dirname, 'embed', 'dual-chart-config.html'));
});

app.get('/solo-classic-app', (req, res) => {
  res.sendFile(path.join(__dirname, 'embed', 'solo-classic-app.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Qlik Sense Charts development server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'embed')}`);
  console.log(`📄 Available pages:`);
  console.log(`   - http://localhost:${PORT}/ (index.html)`);
  console.log(`   - http://localhost:${PORT}/dual-chart-config (dual-chart-config.html)`);
  console.log(`   - http://localhost:${PORT}/solo-classic-app (solo-classic-app.html)`);
  console.log(`\n💡 Remember to replace Qlik placeholders in the HTML files with your actual values for testing`);
  console.log(`   - {{qlikHost}} → your-tenant.qlikcloud.com`);
  console.log(`   - {{qlikClientId}} → your-client-id`);
  console.log(`   - {{qlikAccessCode}} → your-access-code`);
  console.log(`   - {{qlikAppId}} → your-app-id`);
}); 