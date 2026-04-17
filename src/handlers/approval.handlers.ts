import * as functions from "firebase-functions";
import { getApprovals, respondApproval } from "../services/approval.service";
import { getRequestId, sendJson } from "./common";
import { validateApiKey, validateFirebaseToken } from "../middleware/auth.middleware";

export async function getApprovalsHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const approvals = await getApprovals();
    sendJson(res, approvals);
}

export async function respondApprovalHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "POST") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    await validateApiKey(req, res);
    await validateFirebaseToken(req, res);
    const { approverEmail, approve } = req.body as { approverEmail?: string; approve?: boolean };
    if (!approverEmail || approve === undefined) {
        return sendJson(res, { message: "approverEmail e approve são obrigatórios" }, 400);
    }

    const approvalId = getRequestId(req);
    if (!approvalId) {
        return sendJson(res, { message: "ID da aprovação é obrigatório" }, 400);
    }

    const updated = await respondApproval(approvalId, approverEmail, approve);
    sendJson(res, updated);
}
