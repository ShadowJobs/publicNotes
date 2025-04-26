const { createClient } = require('redis');

// 创建 Redis 客户端配置
const createRedisClient = () => {
    const client = createClient({
        url: 'redis://127.0.0.1:6379',
        password: 'difyai123456',
        // 重连策略配置
        retry_strategy: function(options) {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // 如果服务器拒绝连接，可能是其已关闭
                console.log('Redis server refused connection. Retrying...');
            }
            // 重试间隔时间，单位为 ms
            return Math.min(options.attempt * 1000, 3000);
        },
        // 重连配置
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 10) {
                    console.log('Redis max reconnection attempts reached');
                    return new Error('Max reconnection attempts reached');
                }
                // 重试延迟时间（毫秒）
                return Math.min(retries * 1000, 3000);
            }
        }
    });

    // 连接事件处理
    client.on('connect', () => {
        console.log('Redis client connecting...');
    });

    client.on('ready', () => {
        console.log('Redis client connected and ready to use');
    });

    client.on('error', (err) => {
        console.error('Redis client error:', err);
    });

    client.on('end', () => {
        console.log('Redis client disconnected');
    });

    client.on('reconnecting', () => {
        console.log('Redis client reconnecting...');
    });

    connectWithRetry(client);
    return client;
};

// 连接重试函数
async function connectWithRetry(client) {
    try {
        await client.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        setTimeout(() => connectWithRetry(client), 10000);
    }
}

let redisClient = null;

function getRedisClient() {
    if (!redisClient) {
        redisClient = createRedisClient();
    }
    return redisClient;
}

module.exports = getRedisClient();