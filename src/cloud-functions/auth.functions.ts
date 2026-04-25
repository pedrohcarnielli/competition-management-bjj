import * as functions from "firebase-functions";
import { handleError } from "../handlers/common";
import { loginHandler } from "../handlers/auth.handlers";

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

export const login = makeFirebaseFunction(loginHandler);
