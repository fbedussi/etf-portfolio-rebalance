import http from 'http';

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    // Set CORS headers to allow calls from the Vite app
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Match /api/prices/:isin
    const match = req.url.match(/^\/api\/prices\/([a-zA-Z0-9]+)/);

    if (match && req.method === 'GET') {
        const isin = match[1];

        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const dateFrom = oneYearAgo.toISOString().split('T')[0];
        const dateTo = today.toISOString().split('T')[0];

        const targetUrl = `https://www.justetf.com/api/etfs/${isin}/performance-chart?locale=it&currency=EUR&valuesType=MARKET_VALUE&reduceData=false&includeDividends=true&features=DIVIDENDS&dateFrom=${dateFrom}&dateTo=${dateTo}`;

        console.log(`Proxying request for ISIN: ${isin} to ${targetUrl}`);

        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'accept-encoding': `gzip, deflate, br, zstd`,
                    'accept': `application/json, text/plain, */*`,
                },
                // Note: signal handling is omitted for simplicity in vanilla node
            });

            if (!response.ok) {
                console.error(`Upstream error: ${response.status}`);
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Upstream error: ${response.status}` }));
                return;
            }

            const data = await response.json();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.error('Fetch error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
