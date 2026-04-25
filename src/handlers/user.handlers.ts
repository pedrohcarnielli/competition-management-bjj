import * as functions from "firebase-functions";
import { createUser, deleteUser, getActiveUsers, getUser, sanitizeUser, updateUser } from "../services/user.service";
import { UserPayload } from "../models";
import { getRequestId, sendJson } from "./common";
import { validateApiKey, validateFirebaseToken } from "../middleware/auth.middleware";

export async function getUsersHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const users = await getActiveUsers();
    const usersWithoutHistory = users.map((user) => {
        const { history, ...publicUser } = sanitizeUser(user);
        return publicUser;
    });
    sendJson(res, usersWithoutHistory);
}

export async function getUserByIdHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const userId = getRequestId(req);
    if (!userId) {
        return sendJson(res, { message: "ID do usuário é obrigatório" }, 400);
    }

    const user = await getUser(userId);
    if (!user || user.deletedAt) {
        return sendJson(res, { message: "Usuário não encontrado" }, 404);
    }
    const { history, ...publicUser } = sanitizeUser(user);
    sendJson(res, publicUser);
}

export async function getUserHistoryHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const userId = getRequestId(req);
    if (!userId) {
        return sendJson(res, { message: "ID do usuário é obrigatório" }, 400);
    }

    const user = await getUser(userId);
    if (!user) {
        return sendJson(res, { message: "Usuário não encontrado" }, 404);
    }
    sendJson(res, user.history || []);
}

export async function createUserHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "POST") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    // await validateApiKey(req, res);
    // await validateFirebaseToken(req, res);
    const payload = req.body as UserPayload;
    const result = await createUser(payload);
    sendJson(res, sanitizeUser(result.user), 201);
}

export async function updateUserHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "PUT") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const userId = getRequestId(req);
    if (!userId) {
        return sendJson(res, { message: "ID do usuário é obrigatório" }, 400);
    }

    const payload = req.body as UserPayload;
    const auth = (req as any).auth as { uid: string; email?: string };
    const actor = {
        uid: auth.uid,
        email: auth.email || "",
    };

    const result = await updateUser(userId, payload, actor);
    sendJson(res, sanitizeUser(result.user));
}

export async function deleteUserHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "DELETE") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const userId = getRequestId(req);
    if (!userId) {
        return sendJson(res, { message: "ID do usuário é obrigatório" }, 400);
    }

    await deleteUser(userId);
    res.status(204).send();
}
