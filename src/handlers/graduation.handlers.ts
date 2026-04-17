import * as functions from "firebase-functions";
import { calculateAge } from "../utils/age";
import { getAllowedGraduations } from "../models/graduation";
import { sendJson } from "./common";

export async function getGraduationsHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    const birthDate = req.query.birthDate as string | undefined;
    if (!birthDate) {
        return sendJson(res, { message: "birthDate é obrigatório para listar graduações" }, 400);
    }

    const age = calculateAge(birthDate);
    sendJson(res, { age, allowedGraduations: getAllowedGraduations(age) });
}
