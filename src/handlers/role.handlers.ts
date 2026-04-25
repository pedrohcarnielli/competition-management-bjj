import * as functions from "firebase-functions";
import { getActiveUsers } from "../services/user.service";
import { roles } from "../models/role";
import { getRequestId, sendJson } from "./common";

export async function getRolesHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    sendJson(res, { availableRoles: roles });
}

export async function getUsersByRoleHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    const role = req.query.role as string;
    const users = await getActiveUsers();

    let filteredUsers = users;
    if (role) {
        if (!roles.includes(role as any)) {
            return sendJson(res, { error: "Role inválida" }, 400);
        }
        filteredUsers = users.filter(user => user.roles.includes(role as any));
    }

    const result = filteredUsers.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
    }));

    sendJson(res, result);
}