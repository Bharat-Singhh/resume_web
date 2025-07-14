// Add this to your server.js file

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

app.get('/ready', (req, res) => {
    // Add any readiness checks here (database connection, etc.)
    res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
    });
});
