import { User } from "../models";
import { firestore } from "../providers/firebase";

const MAIL_COLLECTION = process.env.FIREBASE_MAIL_COLLECTION || "mail";

async function enqueueEmail(to: string, subject: string, text: string) {
  const now = new Date().toISOString();
  await firestore.collection(MAIL_COLLECTION).add({
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

export async function sendApprovalRequestEmail(type: "legal" | "technical", responsibleEmail: string, requester: User) {
  const subject = type === "legal"
    ? "Aprovação de dependente legal"
    : "Aprovação de responsável técnico";

  const body = type === "legal"
    ? `O usuário ${requester.fullName} (${requester.email}) solicitou ser seu dependente legal.`
    : `O usuário ${requester.fullName} (${requester.email}) solicitou que você seja seu responsável técnico.`;

  await enqueueEmail(responsibleEmail, subject, body);
}

export async function sendApprovalResponseEmail(type: "legal" | "technical", requesterEmail: string, approved: boolean) {
  const subject = approved
    ? "Solicitação aprovada"
    : "Solicitação rejeitada";

  const body = approved
    ? `Seu pedido foi aprovado pelo responsável.`
    : `Seu pedido foi rejeitado pelo responsável.`;

  await enqueueEmail(requesterEmail, subject, body);
}
