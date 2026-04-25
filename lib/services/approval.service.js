"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovals = getApprovals;
exports.respondApproval = respondApproval;
const approval_repository_1 = require("../repositories/approval.repository");
const user_repository_1 = require("../repositories/user.repository");
const email_1 = require("../utils/email");
async function getApprovals() {
    return (0, approval_repository_1.listApprovals)();
}
async function respondApproval(id, approverEmail, approve) {
    const approval = await (0, approval_repository_1.getApprovalById)(id);
    if (!approval) {
        throw { status: 404, message: "Solicitação de aprovação não encontrada" };
    }
    if (approval.status !== "pending") {
        throw { status: 400, message: "Esta solicitação já foi processada" };
    }
    if (approval.responsibleEmail.toLowerCase() !== approverEmail.toLowerCase()) {
        throw { status: 400, message: "O aprovador deve ser o responsável indicado" };
    }
    approval.status = approve ? "approved" : "rejected";
    approval.updatedAt = new Date().toISOString();
    await (0, approval_repository_1.saveApproval)(approval);
    const requester = await (0, user_repository_1.getUserById)(approval.requesterId);
    if (requester) {
        if (!approve) {
            if (approval.type === "legal") {
                requester.responsibleLegalEmail = undefined;
            }
            else {
                requester.technicalResponsibleEmail = undefined;
            }
            requester.updatedAt = new Date().toISOString();
            await (0, user_repository_1.saveUser)(requester);
        }
        await (0, email_1.sendApprovalResponseEmail)(approval.type, requester.email, approve);
    }
    return approval;
}
