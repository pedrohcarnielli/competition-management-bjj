import * as functions from "firebase-functions";
import { firestore } from "../providers/firebase";
import { sendJson } from "./common";

const MAIL_COLLECTION = process.env.FIREBASE_MAIL_COLLECTION || "mail";

export async function getEmailHealthHandler(req: functions.Request, res: functions.Response) {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }

    try {
        // Checa conectividade com Firestore e acesso à coleção de fila de e-mails.
        await firestore.collection(MAIL_COLLECTION).limit(1).get();

        return sendJson(res, {
            status: "OK",
            email: {
                healthy: true,
                provider: "firebase-firestore-trigger-email",
                collection: MAIL_COLLECTION,
            },
        });
    } catch (error: any) {
        return sendJson(res, {
            status: "ERROR",
            email: {
                healthy: false,
                provider: "firebase-firestore-trigger-email",
                collection: MAIL_COLLECTION,
                message: error?.message || "Falha ao acessar coleção de e-mail",
            },
        }, 503);
    }
}
