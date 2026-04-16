import * as functions from "firebase-functions";
import { createUser, deleteUser, getActiveUsers, getUser, sanitizeUser, updateUser } from "./services/user.service";
import { getApprovals, respondApproval } from "./services/approval.service";
import { loginUser } from "./services/auth.service";
import { calculateAge } from "./utils/age";
import { getAllowedGraduations } from "./models/graduation";
import { UserPayload } from "./models";
import { validateApiKey, validateFirebaseToken } from "./middleware/auth.middleware";

// Helper to send JSON response
function sendJson(res: functions.Response, data: any, status = 200) {
  res.status(status).json(data);
}

// Helper to handle errors
function handleError(res: functions.Response, error: any) {
  if (error?.status) {
    sendJson(res, { error: error.errors ?? error.message }, error.status);
  } else {
    console.error(error);
    sendJson(res, { error: "Erro interno" }, 500);
  }
}

// Users collection
export const getUsers = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  try {
    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const users = await getActiveUsers();
    sendJson(res, users.map(sanitizeUser));
  } catch (error) {
    handleError(res, error);
  }
});

export const getUserById = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  try {
    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const user = await getUser(req.params.id);
    if (!user || user.deletedAt) {
      return sendJson(res, { message: "Usuário não encontrado" }, 404);
    }
    sendJson(res, sanitizeUser(user));
  } catch (error) {
    handleError(res, error);
  }
});

export const getUserHistory = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  try {
    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const user = await getUser(req.params.id);
    if (!user) {
      return sendJson(res, { message: "Usuário não encontrado" }, 404);
    }
    sendJson(res, user.history || []);
  } catch (error) {
    handleError(res, error);
  }
});

export const createUserFunction = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  try {
    await validateApiKey(req, res, () => { });
    await validateFirebaseToken(req, res, () => { });
    const payload = req.body as UserPayload;
    const result = await createUser(payload);
    sendJson(res, sanitizeUser(result.user), 201);
  } catch (error) {
    handleError(res, error);
  }
});

export const updateUserFunction = functions.https.onRequest(async (req, res) => {
  if (req.method !== "PUT") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  try {
    await validateApiKey(req, res, () => { });
    await validateFirebaseToken(req, res, () => { });
    const payload = req.body as UserPayload;
    const result = await updateUser(req.params.id, payload);
    sendJson(res, sanitizeUser(result.user));
  } catch (error) {
    handleError(res, error);
  }
});

export const deleteUserFunction = functions.https.onRequest(async (req, res) => {
  if (req.method !== "DELETE") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  try {
    await validateApiKey(req, res, () => { });
    await validateFirebaseToken(req, res, () => { });
    await deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

// Auth
export const login = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  try {
    await validateApiKey(req, res, () => { });
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return sendJson(res, { message: "email e password são obrigatórios" }, 400);
    }
    const result = await loginUser(email, password);
    sendJson(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

// Approvals
export const getApprovalsFunction = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  try {
    await validateApiKey(req, res, () => { });
    await validateFirebaseToken(req, res, () => { });
    const approvals = await getApprovals();
    sendJson(res, approvals);
  } catch (error) {
    handleError(res, error);
  }
});

export const respondApprovalFunction = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  try {
    await validateApiKey(req, res, () => { });
    await validateFirebaseToken(req, res, () => { });
    const { approverEmail, approve } = req.body as { approverEmail?: string; approve?: boolean };
    if (!approverEmail || approve === undefined) {
      return sendJson(res, { message: "approverEmail e approve são obrigatórios" }, 400);
    }
    const updated = await respondApproval(req.params.id, approverEmail, approve);
    sendJson(res, updated);
  } catch (error) {
    handleError(res, error);
  }
});

// Graduations
export const getGraduations = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return sendJson(res, { error: "Método não permitido" }, 405);
  }

  const birthDate = req.query.birthDate as string | undefined;
  if (!birthDate) {
    return sendJson(res, { message: "birthDate é obrigatório para listar graduações" }, 400);
  }

  const age = calculateAge(birthDate);
  sendJson(res, { age, allowedGraduations: getAllowedGraduations(age) });
});
