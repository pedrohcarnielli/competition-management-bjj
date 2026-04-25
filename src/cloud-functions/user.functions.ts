import * as functions from "firebase-functions";
import { handleError } from "../handlers/common";
import {
    createUserHandler,
    deleteUserHandler,
    getUserByIdHandler,
    getUserHistoryHandler,
    getUsersHandler,
    updateUserHandler,
} from "../handlers/user.handlers";

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
