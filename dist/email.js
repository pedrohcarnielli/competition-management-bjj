"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApprovalRequestEmail = sendApprovalRequestEmail;
exports.sendApprovalResponseEmail = sendApprovalResponseEmail;
function sendApprovalRequestEmail(type, responsibleEmail, requester) {
    const subject = type === "legal"
        ? "Aprovação de dependente legal"
        : "Aprovação de responsável técnico";
    const body = type === "legal"
        ? `O usuário ${requester.fullName} (${requester.email}) solicitou ser seu dependente legal.`
        : `O usuário ${requester.fullName} (${requester.email}) solicitou que você seja seu responsável técnico.`;
    console.info("[EMAIL SIMULADO] Para:", responsibleEmail);
    console.info("[EMAIL SIMULADO] Assunto:", subject);
    console.info("[EMAIL SIMULADO] Mensagem:", body);
}
function sendApprovalResponseEmail(type, requesterEmail, approved) {
    const subject = approved
        ? "Solicitação aprovada"
        : "Solicitação rejeitada";
    const body = approved
        ? `Seu pedido foi aprovado pelo responsável.`
        : `Seu pedido foi rejeitado pelo responsável.`;
    console.info("[EMAIL SIMULADO] Para:", requesterEmail);
    console.info("[EMAIL SIMULADO] Assunto:", subject);
    console.info("[EMAIL SIMULADO] Mensagem:", body);
}
