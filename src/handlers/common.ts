import * as functions from "firebase-functions";

export function getRequestId(req: functions.Request): string | undefined {
    const idQuery = req.query?.id as string | string[] | undefined;
    const idParam = (req.params as any)?.id;

    if (typeof idQuery === "string") {
        return idQuery;
    }
    if (Array.isArray(idQuery)) {
        return idQuery[0];
    }
    if (typeof idParam === "string") {
        return idParam;
    }
    if (Array.isArray(idParam)) {
        return idParam[0];
    }
    return undefined;
}

export function sendJson(res: functions.Response, data: any, status = 200) {
    res.status(status).json(data);
}

export function handleError(res: functions.Response, error: any) {
    if (error?.status) {
        sendJson(res, { error: error.errors ?? error.message }, error.status);
    } else {
        console.error(error);
        sendJson(res, { error: "Erro interno" }, 500);
    }
}
