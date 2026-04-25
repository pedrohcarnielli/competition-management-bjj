import "./env";
import * as functions from "firebase-functions";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger";
import { handleError } from "./handlers/common";
import {
    createUserHandler,
    deleteUserHandler,
    getUserByIdHandler,
    getUserHistoryHandler,
    getUsersHandler,
    updateUserHandler,
} from "./handlers/user.handlers";
import { getApprovalsHandler, respondApprovalHandler } from "./handlers/approval.handlers";
import { loginHandler } from "./handlers/auth.handlers";
import { getGraduationsHandler } from "./handlers/graduation.handlers";
import { getEmailHealthHandler } from "./handlers/health.handlers";
import { getRolesHandler, getUsersByRoleHandler } from "./handlers/role.handlers";
import { sendEmailMessage } from "./services/email-sender.service";
import { firestore } from "./providers/firebase";

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

export const getUsers = makeFirebaseFunction(getUsersHandler);
export const getUserById = makeFirebaseFunction(getUserByIdHandler);
export const getUserHistory = makeFirebaseFunction(getUserHistoryHandler);
export const createUserFunction = makeFirebaseFunction(createUserHandler);
export const updateUserFunction = makeFirebaseFunction(updateUserHandler);
export const deleteUserFunction = makeFirebaseFunction(deleteUserHandler);
export const login = makeFirebaseFunction(loginHandler);
export const getApprovalsFunction = makeFirebaseFunction(getApprovalsHandler);
export const respondApprovalFunction = makeFirebaseFunction(respondApprovalHandler);
export const getGraduations = makeFirebaseFunction(getGraduationsHandler);
export const getRoles = makeFirebaseFunction(getRolesHandler);
export const getUsersByRole = makeFirebaseFunction(getUsersByRoleHandler);
export const healthEmail = makeFirebaseFunction(getEmailHealthHandler);

export const docs = functions.https.onRequest(async (req, res) => {
    try {
        res.setHeader("Content-Type", "text/html");
        const html = swaggerUi.generateHTML(swaggerDocument, { explorer: true });
        res.status(200).send(html);
    } catch (error) {
        handleError(res, error);
    }
});

export const swaggerJson = functions.https.onRequest(async (req, res) => {
    try {
        res.json(swaggerDocument);
    } catch (error) {
        handleError(res, error);
    }
});

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
