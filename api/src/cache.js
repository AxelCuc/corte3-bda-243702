const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redis.on('connect', () => {
  console.log('🚀 Conectado a Redis');
});

redis.on('error', (err) => {
  console.error(`❌ Error de conexión Redis: ${err.message}`);
});

module.exports = redis;