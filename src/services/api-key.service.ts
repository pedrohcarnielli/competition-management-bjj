import { getStorage } from "firebase-admin/storage";
import { API_KEY_FILE } from "../config";

let cachedApiKey: string | null = null;

export async function getApiKeySecret(): Promise<string> {
  if (cachedApiKey) {
    return cachedApiKey;
  }

  if (!API_KEY_FILE) {
    throw new Error("API_KEY_FILE deve estar configurado para validação de API key");
  }

  const bucket = getStorage().bucket();
  const file = bucket.file(API_KEY_FILE);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`Arquivo de chave privada não encontrado: ${API_KEY_FILE}`);
  }

  const [contents] = await file.download();
  cachedApiKey = contents.toString("utf-8").trim();
  return cachedApiKey;
}
