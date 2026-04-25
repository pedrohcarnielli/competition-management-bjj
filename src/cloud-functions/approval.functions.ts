import * as functions from "firebase-functions";
import { handleError } from "../handlers/common";
import { getApprovalsHandler, respondApprovalHandler } from "../handlers/approval.handlers";

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

export const getApprovalsFunction = makeFirebaseFunction(getApprovalsHandler);
export const respondApprovalFunction = makeFirebaseFunction(respondApprovalHandler);
