"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiKeySecret = getApiKeySecret;
const storage_1 = require("@google-cloud/storage");
const config_1 = require("../config");
let cachedApiKey = null;
const storage = new storage_1.Storage();
async function getApiKeySecret() {
    if (cachedApiKey) {
        return cachedApiKey;
    }
    if (!config_1.API_KEY_BUCKET || !config_1.API_KEY_FILE) {
        throw new Error("API_KEY_BUCKET e API_KEY_FILE devem estar configurados para validação de API key");
    }
    const file = storage.bucket(config_1.API_KEY_BUCKET).file(config_1.API_KEY_FILE);
    const [exists] = await file.exists();
    if (!exists) {
        throw new Error(`Arquivo de chave privada não encontrado no bucket ${config_1.API_KEY_BUCKET}/${config_1.API_KEY_FILE}`);
    }
    const [contents] = await file.download();
    cachedApiKey = contents.toString("utf-8").trim();
    return cachedApiKey;
}
