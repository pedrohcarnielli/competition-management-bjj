"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApprovalRequestEmail = sendApprovalRequestEmail;
exports.sendApprovalResponseEmail = sendApprovalResponseEmail;
const firebase_1 = require("../providers/firebase");
const MAIL_COLLECTION = process.env.MAIL_COLLECTION || "mail";
async function enqueueEmail(to, subject, text) {
    const now = new Date().toISOString();
    await firebase_1.firestore.collection(MAIL_COLLECTION).add({
        to: [to],
        message: {
            subject,
            text,
        },
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
        attempts: 0,
    });
}
async function sendApprovalRequestEmail(type, responsibleEmail, requester) {
    const subject = type === "legal"
        ? "Aprovação de dependente legal"
        : "Aprovação de responsável técnico";
    const body = type === "legal"
        ? `O usuário ${requester.fullName} (${requester.email}) solicitou ser seu dependente legal.`
        : `O usuário ${requester.fullName} (${requester.email}) solicitou que você seja seu responsável técnico.`;
    await enqueueEmail(responsibleEmail, subject, body);
}
async function sendApprovalResponseEmail(type, requesterEmail, approved) {
    const subject = approved
        ? "Solicitação aprovada"
        : "Solicitação rejeitada";
    const body = approved
        ? `Seu pedido foi aprovado pelo responsável.`
        : `Seu pedido foi rejeitado pelo responsável.`;
    await enqueueEmail(requesterEmail, subject, body);
}
