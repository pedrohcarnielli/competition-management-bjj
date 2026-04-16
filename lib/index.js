"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGraduations = exports.respondApprovalFunction = exports.getApprovalsFunction = exports.login = exports.deleteUserFunction = exports.updateUserFunction = exports.createUserFunction = exports.getUserHistory = exports.getUserById = exports.getUsers = void 0;
const functions = __importStar(require("firebase-functions"));
const user_service_1 = require("./services/user.service");
const approval_service_1 = require("./services/approval.service");
const auth_service_1 = require("./services/auth.service");
const age_1 = require("./utils/age");
const graduation_1 = require("./models/graduation");
const auth_middleware_1 = require("./middleware/auth.middleware");
// Helper to send JSON response
function sendJson(res, data, status = 200) {
    res.status(status).json(data);
}
// Helper to handle errors
function handleError(res, error) {
    if (error?.status) {
        sendJson(res, { error: error.errors ?? error.message }, error.status);
    }
    else {
        console.error(error);
        sendJson(res, { error: "Erro interno" }, 500);
    }
}
// Users collection
exports.getUsers = functions.https.onRequest(async (req, res) => {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    try {
        await (0, auth_middleware_1.validateApiKey)(req, res, () => { });
        await (0, auth_middleware_1.validateFirebaseToken)(req, res, () => { });
        const users = await (0, user_service_1.getActiveUsers)();
        sendJson(res, users.map(user_service_1.sanitizeUser));
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.getUserById = functions.https.onRequest(async (req, res) => {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    try {
        await (0, auth_middleware_1.validateApiKey)(req, res, () => { });
        await (0, auth_middleware_1.validateFirebaseToken)(req, res, () => { });
        const user = await (0, user_service_1.getUser)(req.params.id);
        if (!user || user.deletedAt) {
            return sendJson(res, { message: "Usuário não encontrado" }, 404);
        }
        sendJson(res, (0, user_service_1.sanitizeUser)(user));
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.getUserHistory = functions.https.onRequest(async (req, res) => {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    try {
        await (0, auth_middleware_1.validateApiKey)(req, res, () => { });
        await (0, auth_middleware_1.validateFirebaseToken)(req, res, () => { });
        const user = await (0, user_service_1.getUser)(req.params.id);
        if (!user) {
            return sendJson(res, { message: "Usuário não encontrado" }, 404);
        }
        sendJson(res, user.history || []);
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.createUserFunction = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    try {
        await (0, auth_middleware_1.validateApiKey)(req, res, () => { });
        await (0, auth_middleware_1.validateFirebaseToken)(req, res, () => { });
        const payload = req.body;
        const result = await (0, user_service_1.createUser)(payload);
        sendJson(res, (0, user_service_1.sanitizeUser)(result.user), 201);
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.updateUserFunction = functions.https.onRequest(async (req, res) => {
    if (req.method !== "PUT") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    try {
        await (0, auth_middleware_1.validateApiKey)(req, res, () => { });
        await (0, auth_middleware_1.validateFirebaseToken)(req, res, () => { });
        const payload = req.body;
        const result = await (0, user_service_1.updateUser)(req.params.id, payload);
        sendJson(res, (0, user_service_1.sanitizeUser)(result.user));
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.deleteUserFunction = functions.https.onRequest(async (req, res) => {
    if (req.method !== "DELETE") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    try {
        await (0, auth_middleware_1.validateApiKey)(req, res, () => { });
        await (0, auth_middleware_1.validateFirebaseToken)(req, res, () => { });
        await (0, user_service_1.deleteUser)(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        handleError(res, error);
    }
});
// Auth
exports.login = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    try {
        await (0, auth_middleware_1.validateApiKey)(req, res, () => { });
        const { email, password } = req.body;
        if (!email || !password) {
            return sendJson(res, { message: "email e password são obrigatórios" }, 400);
        }
        const result = await (0, auth_service_1.loginUser)(email, password);
        sendJson(res, result);
    }
    catch (error) {
        handleError(res, error);
    }
});
// Approvals
exports.getApprovalsFunction = functions.https.onRequest(async (req, res) => {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    try {
        await (0, auth_middleware_1.validateApiKey)(req, res, () => { });
        await (0, auth_middleware_1.validateFirebaseToken)(req, res, () => { });
        const approvals = await (0, approval_service_1.getApprovals)();
        sendJson(res, approvals);
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.respondApprovalFunction = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    try {
        await (0, auth_middleware_1.validateApiKey)(req, res, () => { });
        await (0, auth_middleware_1.validateFirebaseToken)(req, res, () => { });
        const { approverEmail, approve } = req.body;
        if (!approverEmail || approve === undefined) {
            return sendJson(res, { message: "approverEmail e approve são obrigatórios" }, 400);
        }
        const updated = await (0, approval_service_1.respondApproval)(req.params.id, approverEmail, approve);
        sendJson(res, updated);
    }
    catch (error) {
        handleError(res, error);
    }
});
// Graduations
exports.getGraduations = functions.https.onRequest(async (req, res) => {
    if (req.method !== "GET") {
        return sendJson(res, { error: "Método não permitido" }, 405);
    }
    const birthDate = req.query.birthDate;
    if (!birthDate) {
        return sendJson(res, { message: "birthDate é obrigatório para listar graduações" }, 400);
    }
    const age = (0, age_1.calculateAge)(birthDate);
    sendJson(res, { age, allowedGraduations: (0, graduation_1.getAllowedGraduations)(age) });
});
