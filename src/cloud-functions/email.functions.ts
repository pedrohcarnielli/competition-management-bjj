import * as functions from "firebase-functions";
import { handleError } from "../handlers/common";
import { getEmailHealthHandler } from "../handlers/health.handlers";
import { sendEmailMessage } from "../services/email-sender.service";

const makeFirebaseFunction = (
    handler: (req: functions.Request, res: functions.Response) => Promise<void>
) =>
    functions.https.onRequest(async (req, res) => {
        try {
            await handler(req, res);
        } catch (error) {
            handleError(res, error);
        }
    });

// Health check do serviço de email
export const healthEmail = makeFirebaseFunction(getEmailHealthHandler);

// Função que monitora a coleção 'mail' e dispara os emails
export const dispatchEmail = functions.firestore
    .document("mail/{docId}")
    .onCreate(async (snap, context) => {
        const emailData = snap.data();
        const docId = context.params.docId;
        const now = new Date().toISOString();

        try {
            // Incrementa tentativas e marca como sendo processado
            await snap.ref.update({
                status: "PROCESSING",
                attempts: (emailData.attempts || 0) + 1,
                updatedAt: now,
            });

            // Envia o email
            await sendEmailMessage({
                to: emailData.to || [],
                message: emailData.message || {},
                createdAt: emailData.createdAt || now,
            });

            // Marca como enviado com sucesso
            await snap.ref.update({
                status: "SENT",
                sentAt: now,
                updatedAt: now,
            });

            console.log(`[FIRESTORE TRIGGER] Email enviado com sucesso. Doc ID: ${docId}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            console.error(`[FIRESTORE TRIGGER] Erro ao enviar email. Doc ID: ${docId}`, error);

            // Marca como erro
            await snap.ref.update({
                status: "ERROR",
                errorMessage,
                errorAt: now,
                updatedAt: now,
            });

            throw error;
        }
    });
