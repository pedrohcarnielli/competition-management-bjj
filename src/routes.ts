import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger";
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
import { requestLoggingMiddleware, responseLoggingMiddleware, errorLoggingMiddleware } from "./middleware/logging.middleware";

const wrapLocalRoute = (
    handler: (req: any, res: any) => Promise<void>
): express.RequestHandler => {
    return async (req, res, next) => {
        try {
            await handler(req as any, res as any);
        } catch (error) {
            next(error);
        }
    };
};

export function buildLocalApp() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(requestLoggingMiddleware);
    app.use(responseLoggingMiddleware);

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, x-tenant-id, x-firebase-token"
        );
        if (req.method === "OPTIONS") {
            return res.sendStatus(200);
        }
        next();
    });

    app.get("/health", (req, res) => {
        res.json({ status: "OK", message: "Local API server running" });
    });

    app.get("/getUsers", wrapLocalRoute(getUsersHandler));
    app.get("/getUserById", wrapLocalRoute(getUserByIdHandler));
    app.get("/getUserHistory", wrapLocalRoute(getUserHistoryHandler));
    app.post("/createUserFunction", wrapLocalRoute(createUserHandler));
    app.put("/updateUserFunction", wrapLocalRoute(updateUserHandler));
    app.delete("/deleteUserFunction", wrapLocalRoute(deleteUserHandler));
    app.post("/login", wrapLocalRoute(loginHandler));
    app.get("/getApprovalsFunction", wrapLocalRoute(getApprovalsHandler));
    app.post("/respondApprovalFunction", wrapLocalRoute(respondApprovalHandler));
    app.get("/getGraduations", wrapLocalRoute(getGraduationsHandler));
    app.get("/getRoles", wrapLocalRoute(getRolesHandler));
    app.get("/getUsersByRole", wrapLocalRoute(getUsersByRoleHandler));

    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.get("/swagger.json", (req, res) => {
        res.json(swaggerDocument);
    });

    app.use(errorLoggingMiddleware);

    return app;
}

export function startLocalApp(port = 3000) {
    const app = buildLocalApp();
    app.listen(port, () => {
        console.log(`🚀 Local API running on http://localhost:${port}`);
        console.log("📍 Using Firebase remote services for Firestore/Auth/Storage");
    });
    return app;
}
