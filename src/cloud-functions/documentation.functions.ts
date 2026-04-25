import * as functions from "firebase-functions";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "../swagger";
import { handleError } from "../handlers/common";

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
