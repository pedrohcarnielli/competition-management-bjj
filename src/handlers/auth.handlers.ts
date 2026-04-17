import * as functions from "firebase-functions";
import { loginUser } from "../services/auth.service";
import { sendJson } from "./common";
import { validateApiKey } from "../middleware/auth.middleware";

export async function loginHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "POST") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    await validateApiKey(req, res);
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
        return sendJson(res, { message: "email e password são obrigatórios" }, 400);
    }

    const result = await loginUser(email, password);
    sendJson(res, result);
}
