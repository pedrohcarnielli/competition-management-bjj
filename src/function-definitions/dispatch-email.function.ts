import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { sendEmailMessage } from "../services/email-sender.service";

const MAIL_COLLECTION = process.env.MAIL_COLLECTION || "mail";

// Monitoria e disparo efetivo de e-mail
export const dispatchEmail = onDocumentCreated(`${MAIL_COLLECTION}/{docId}`, async (event) => {
    const snap = event.data;
    if (!snap) {
        console.warn("[FIRESTORE TRIGGER] Evento sem snapshot de documento.");
        return;
    }

    const emailData = snap.data();
    const docId = event.params.docId;
    const now = new Date().toISOString();

    try {
        await snap.ref.update({
            status: "PROCESSING",
            attempts: (emailData.attempts || 0) + 1,
            updatedAt: now,
        });

        await sendEmailMessage({
            to: emailData.to || [],
            message: emailData.message || {},
            createdAt: emailData.createdAt || now,
        });

        await snap.ref.update({
            status: "SENT",
            sentAt: now,
            updatedAt: now,
        });

        console.log(`[FIRESTORE TRIGGER] Email enviado com sucesso. Doc ID: ${docId}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        console.error(`[FIRESTORE TRIGGER] Erro ao enviar email. Doc ID: ${docId}`, error);

        await snap.ref.update({
            status: "ERROR",
            errorMessage,
            errorAt: now,
            updatedAt: now,
        });

        throw error;
    }
});
