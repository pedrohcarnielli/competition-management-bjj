"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIREBASE_WEB_API_KEY = exports.GCP_TENANT_ID = exports.API_KEY_FILE = void 0;
exports.API_KEY_FILE = process.env.API_KEY_FILE || "";
exports.GCP_TENANT_ID = process.env.GCP_TENANT_ID || "";
exports.FIREBASE_WEB_API_KEY = process.env.FB_WEB_API_KEY || "";
if (!exports.API_KEY_FILE) {
    console.warn("Aviso: API_KEY_FILE não está definido. A validação da API key não funcionará.");
}
if (!exports.GCP_TENANT_ID) {
    console.warn("Aviso: GCP_TENANT_ID não está definido. O tenant não será validado nas requisições.");
}
if (!exports.FIREBASE_WEB_API_KEY) {
    console.warn("Aviso: FIREBASE_WEB_API_KEY não está definido. O login via Firebase pode não funcionar.");
}
