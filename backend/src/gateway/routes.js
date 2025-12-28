import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Logging middleware for gateway
router.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.path}`);
    next();
});

// Proxy to Tuition Payment System API
router.use('/tuition', createProxyMiddleware({
    target: process.env.TUITION_API_BASE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/gateway/tuition': '/api/v1'
    },
    onProxyReq: (proxyReq, req) => {
        console.log(`[Proxy] Forwarding to Tuition API: ${req.path}`);
    }
}));

// Proxy to Address Book API
router.use('/address', createProxyMiddleware({
    target: process.env.ADDRESS_API_BASE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/gateway/address': '/api'
    },
    onProxyReq: (proxyReq, req) => {
        console.log(`[Proxy] Forwarding to Address API: ${req.path}`);
    }
}));

export default router;
