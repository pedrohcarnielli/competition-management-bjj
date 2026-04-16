"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const user_service_1 = require("./services/user.service");
const approval_service_1 = require("./services/approval.service");
const auth_service_1 = require("./services/auth.service");
const age_1 = require("./utils/age");
const graduation_1 = require("./models/graduation");
const swagger_1 = require("./swagger");
const auth_middleware_1 = require("./middleware/auth.middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "10mb" }));
const PORT = process.env.PORT || 3000;
app.get("/users", auth_middleware_1.validateApiKey, auth_middleware_1.validateFirebaseToken, async (req, res, next) => {
    try {
        const users = await (0, user_service_1.getActiveUsers)();
        res.json(users.map(user_service_1.sanitizeUser));
    }
    catch (error) {
        next(error);
    }
});
app.get("/users/:id", auth_middleware_1.validateApiKey, auth_middleware_1.validateFirebaseToken, async (req, res, next) => {
    try {
        const user = await (0, user_service_1.getUser)(req.params.id);
        if (!user || user.deletedAt) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        res.json((0, user_service_1.sanitizeUser)(user));
    }
    catch (error) {
        next(error);
    }
});
app.get("/users/:id/history", auth_middleware_1.validateApiKey, auth_middleware_1.validateFirebaseToken, async (req, res, next) => {
    try {
        const user = await (0, user_service_1.getUser)(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        res.json(user.history || []);
    }
    catch (error) {
        next(error);
    }
});
app.post("/users", auth_middleware_1.validateApiKey, auth_middleware_1.validateFirebaseToken, async (req, res, next) => {
    try {
        const payload = req.body;
        const result = await (0, user_service_1.createUser)(payload);
        res.status(201).json((0, user_service_1.sanitizeUser)(result.user));
    }
    catch (error) {
        next(error);
    }
});
app.post("/login", auth_middleware_1.validateApiKey, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "email e password são obrigatórios" });
        }
        const result = await (0, auth_service_1.loginUser)(email, password);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
app.put("/users/:id", auth_middleware_1.validateApiKey, auth_middleware_1.validateFirebaseToken, async (req, res, next) => {
    try {
        const payload = req.body;
        const result = await (0, user_service_1.updateUser)(req.params.id, payload);
        res.json((0, user_service_1.sanitizeUser)(result.user));
    }
    catch (error) {
        next(error);
    }
});
app.delete("/users/:id", auth_middleware_1.validateApiKey, auth_middleware_1.validateFirebaseToken, async (req, res, next) => {
    try {
        await (0, user_service_1.deleteUser)(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
app.get("/approvals", auth_middleware_1.validateApiKey, auth_middleware_1.validateFirebaseToken, async (req, res, next) => {
    try {
        const approvals = await (0, approval_service_1.getApprovals)();
        res.json(approvals);
    }
    catch (error) {
        next(error);
    }
});
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerDocument));
app.post("/approvals/:id/respond", auth_middleware_1.validateApiKey, auth_middleware_1.validateFirebaseToken, async (req, res, next) => {
    try {
        const { approverEmail, approve } = req.body;
        if (!approverEmail || approve === undefined) {
            return res.status(400).json({ message: "approverEmail e approve são obrigatórios" });
        }
        const updated = await (0, approval_service_1.respondApproval)(req.params.id, approverEmail, approve);
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
app.get("/graduations", (req, res) => {
    const birthDate = req.query.birthDate;
    if (!birthDate) {
        return res.status(400).json({ message: "birthDate é obrigatório para listar graduações" });
    }
    const age = (0, age_1.calculateAge)(birthDate);
    res.json({ age, allowedGraduations: (0, graduation_1.getAllowedGraduations)(age) });
});
app.use((error, req, res, next) => {
    if (error?.status) {
        return res.status(error.status).json({ error: error.errors ?? error.message });
    }
    console.error(error);
    res.status(500).json({ error: "Erro interno" });
});
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
