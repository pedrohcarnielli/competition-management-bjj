import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
        interface Response {
            requestId: string;
        }
    }
}

function sanitizeData(data: any): any {
    if (typeof data !== "object" || data === null) {
        return data;
    }

    const sensitiveFields = ["password", "token", "apiKey", "firebaseToken", "x-api-key", "x-firebase-token", "authorization"];
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
        if (sensitiveFields.includes(key.toLowerCase())) {
            sanitized[key] = "***REDACTED***";
        } else if (typeof sanitized[key] === "object") {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    }

    return sanitized;
}

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
    const requestId = uuid();
    req.requestId = requestId;
    res.requestId = requestId;

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] REQUEST [${requestId}] ${req.method} ${req.originalUrl}`);
    console.log(`[${timestamp}] REQUEST [${requestId}] Headers:`, JSON.stringify(sanitizeData(req.headers)));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`[${timestamp}] REQUEST [${requestId}] Body:`, JSON.stringify(sanitizeData(req.body)));
    }

    next();
}

export function responseLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
    const requestId = req.requestId || "unknown";
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    let responseBody: any = null;

    res.send = function (body?: any) {
        responseBody = body;
        return originalSend.call(this, body);
    };

    res.json = function (body?: any) {
        responseBody = body;
        return originalJson.call(this, body);
    };

    res.end = function (chunk?: any, encoding?: any) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] RESPONSE [${requestId}] Status: ${res.statusCode}`);
        if (responseBody !== null) {
            console.log(`[${timestamp}] RESPONSE [${requestId}] Body:`, JSON.stringify(sanitizeData(responseBody)));
        }
        return originalEnd.call(this, chunk, encoding);
    };

    next();
}

export function errorLoggingMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    const requestId = req.requestId || "unknown";
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR [${requestId}] ${err.message || err}`);
    console.error(`[${timestamp}] ERROR [${requestId}] Stack:`, err.stack);

    if (!res.headersSent) {
        const status = typeof err?.status === "number" ? err.status : 500;
        const errorPayload = err?.errors ?? err?.message ?? "Internal server error";
        res.status(status).json({ error: errorPayload, requestId });
    }
}