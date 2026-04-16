"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiKey = validateApiKey;
exports.validateFirebaseToken = validateFirebaseToken;
const config_1 = require("../config");
const api_key_service_1 = require("../services/api-key.service");
const firebase_1 = require("../providers/firebase");
function parseBearerToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return null;
    }
    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
        return null;
    }
    return token;
}
async function validateApiKey(req, res, next) {
    try {
        const apiKey = req.headers["x-api-key"] || req.query.apiKey || req.body.apiKey;
        if (!apiKey) {
            return res.status(401).json({ message: "API key obrigatória" });
        }
        const tenantId = req.headers["x-tenant-id"] || req.query.tenantId || req.body.tenantId;
        if (!tenantId) {
            return res.status(401).json({ message: "Tenant ID obrigatório" });
        }
        if (config_1.GCP_TENANT_ID && tenantId !== config_1.GCP_TENANT_ID) {
            return res.status(401).json({ message: "Tenant inválido" });
        }
        const secret = await (0, api_key_service_1.getApiKeySecret)();
        if (apiKey.trim() !== secret.trim()) {
            return res.status(401).json({ message: "API key inválida" });
        }
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro na validação da API key" });
    }
}
async function validateFirebaseToken(req, res, next) {
    const token = parseBearerToken(req) || req.headers["x-firebase-token"] || req.query.firebaseToken || req.body.firebaseToken;
    if (!token) {
        return res.status(401).json({ message: "Token Firebase obrigatório" });
    }
    try {
        const decoded = await firebase_1.firebaseAuth.verifyIdToken(token);
        if (config_1.GCP_TENANT_ID && decoded.tenant_id && decoded.tenant_id !== config_1.GCP_TENANT_ID) {
            return res.status(401).json({ message: "Token não corresponde ao tenant configurado" });
        }
        req.auth = decoded;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Token Firebase inválido ou expirado" });
    }
}
