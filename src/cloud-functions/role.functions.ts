import * as functions from "firebase-functions";
import { handleError } from "../handlers/common";
import { getRolesHandler, getUsersByRoleHandler } from "../handlers/role.handlers";

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

export const getRoles = makeFirebaseFunction(getRolesHandler);
export const getUsersByRole = makeFirebaseFunction(getUsersByRoleHandler);
