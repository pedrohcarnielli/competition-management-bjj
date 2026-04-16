"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIREBASE_WEB_API_KEY = exports.GCP_TENANT_ID = exports.API_KEY_FILE = exports.API_KEY_BUCKET = exports.PHOTO_BUCKET = exports.GCP_PROJECT_ID = void 0;
exports.GCP_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || "";
exports.PHOTO_BUCKET = process.env.PHOTO_BUCKET || "";
exports.API_KEY_BUCKET = process.env.API_KEY_BUCKET || "";
exports.API_KEY_FILE = process.env.API_KEY_FILE || "";
exports.GCP_TENANT_ID = process.env.GCP_TENANT_ID || "";
exports.FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY || "";
if (!exports.GCP_PROJECT_ID) {
    console.warn("Aviso: GOOGLE_CLOUD_PROJECT não está definido. O Datastore pode falhar se não estiver configurado.");
}
if (!exports.PHOTO_BUCKET) {
    console.warn("Aviso: PHOTO_BUCKET não está definido. O upload de fotos do atleta não funcionará.");
}
if (!exports.API_KEY_BUCKET || !exports.API_KEY_FILE) {
    console.warn("Aviso: API_KEY_BUCKET e API_KEY_FILE não estão definidos. A validação da API key não funcionará.");
}
if (!exports.GCP_TENANT_ID) {
    console.warn("Aviso: GCP_TENANT_ID não está definido. O tenant não será validado nas requisições.");
}
if (!exports.FIREBASE_WEB_API_KEY) {
    console.warn("Aviso: FIREBASE_WEB_API_KEY não está definido. O login via Firebase pode não funcionar.");
}
