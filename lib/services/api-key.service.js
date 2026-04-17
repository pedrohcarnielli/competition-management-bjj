"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiKeySecret = getApiKeySecret;
const storage_1 = require("firebase-admin/storage");
const config_1 = require("../config");
let cachedApiKey = null;
async function getApiKeySecret() {
    if (cachedApiKey) {
        return cachedApiKey;
    }
    if (!config_1.API_KEY_FILE) {
        throw new Error("API_KEY_FILE deve estar configurado para validação de API key");
    }
    const bucket = (0, storage_1.getStorage)().bucket();
    const file = bucket.file(config_1.API_KEY_FILE);
    const [exists] = await file.exists();
    if (!exists) {
        throw new Error(`Arquivo de chave privada não encontrado: ${config_1.API_KEY_FILE}`);
    }
    const [contents] = await file.download();
    cachedApiKey = contents.toString("utf-8").trim();
    return cachedApiKey;
}
