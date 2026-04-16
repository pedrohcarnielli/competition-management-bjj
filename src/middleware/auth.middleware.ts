import { Request, Response } from "firebase-functions";
import { GCP_TENANT_ID } from "../config";
import { getApiKeySecret } from "../services/api-key.service";
import { firebaseAuth } from "../providers/firebase";

function parseBearerToken(req: Request): string | null {
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

export async function validateApiKey(req: Request, res: Response): Promise<void> {
  const apiKey = (req.headers["x-api-key"] as string) || req.query.apiKey || req.body.apiKey;
  if (!apiKey) {
    res.status(401).json({ message: "API key obrigatória" });
    throw new Error("API key obrigatória");
  }

  const tenantId = (req.headers["x-tenant-id"] as string) || req.query.tenantId || req.body.tenantId;
  if (!tenantId) {
    res.status(401).json({ message: "Tenant ID obrigatório" });
    throw new Error("Tenant ID obrigatório");
  }

  if (GCP_TENANT_ID && tenantId !== GCP_TENANT_ID) {
    res.status(401).json({ message: "Tenant inválido" });
    throw new Error("Tenant inválido");
  }

  const secret = await getApiKeySecret();
  if (apiKey.trim() !== secret.trim()) {
    res.status(401).json({ message: "API key inválida" });
    throw new Error("API key inválida");
  }
}

export async function validateFirebaseToken(req: Request, res: Response): Promise<void> {
  const token = parseBearerToken(req) || (req.headers["x-firebase-token"] as string) || req.query.firebaseToken || req.body.firebaseToken;
  if (!token) {
    res.status(401).json({ message: "Token Firebase obrigatório" });
    throw new Error("Token Firebase obrigatório");
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    if (GCP_TENANT_ID && decoded.tenant_id && decoded.tenant_id !== GCP_TENANT_ID) {
      res.status(401).json({ message: "Token não corresponde ao tenant configurado" });
      throw new Error("Token não corresponde ao tenant configurado");
    }

    (req as any).auth = decoded;
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token Firebase inválido ou expirado" });
    throw new Error("Token Firebase inválido ou expirado");
  }
}
