const request = require('supertest');
const app = require('../server');

describe('Basic API Tests', () => {
    test('Health check endpoint', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);
ECHO is off.
        expect(response.body.status).toBe('healthy');
    });

    test('Ready check endpoint', async () => {
        const response = await request(app)
            .get('/ready')
            .expect(200);
ECHO is off.
        expect(response.body.status).toBe('ready');
    });
});
