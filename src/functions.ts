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
import { getRolesHandler, getUsersByRoleHandler } from "./handlers/role.handlers";

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
