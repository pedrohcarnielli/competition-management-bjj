export const API_KEY_FILE = process.env.API_KEY_FILE || "";
export const GCP_TENANT_ID = process.env.GCP_TENANT_ID || "";
export const FIREBASE_WEB_API_KEY = process.env.FB_WEB_API_KEY || "";

if (!API_KEY_FILE) {
    console.warn("Aviso: API_KEY_FILE não está definido. A validação da API key não funcionará.");
}

if (!GCP_TENANT_ID) {
    console.warn("Aviso: GCP_TENANT_ID não está definido. O tenant não será validado nas requisições.");
}

if (!FIREBASE_WEB_API_KEY) {
    console.warn("Aviso: FIREBASE_WEB_API_KEY não está definido. O login via Firebase pode não funcionar.");
}
