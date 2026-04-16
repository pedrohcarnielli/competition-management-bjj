import { User } from "./models";

export function sendApprovalRequestEmail(type: "legal" | "technical", responsibleEmail: string, requester: User) {
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

export function sendApprovalResponseEmail(type: "legal" | "technical", requesterEmail: string, approved: boolean) {
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
