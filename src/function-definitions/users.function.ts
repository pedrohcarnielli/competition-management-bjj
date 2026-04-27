import { onRequest } from "firebase-functions/v2/https";
import { buildLocalApp } from "../routes";

const apiApp = buildLocalApp();

// Contexto API completo (usuarios, aprovacoes, auth, graduacoes, roles e Swagger)
export const users = onRequest(apiApp);
