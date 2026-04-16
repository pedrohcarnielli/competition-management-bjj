"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
const config_1 = require("../config");
async function loginUser(email, password) {
    if (!config_1.FIREBASE_WEB_API_KEY) {
        throw { status: 500, message: "Firebase API key não configurada" };
    }
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config_1.FIREBASE_WEB_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        const message = data?.error?.message || "Credenciais inválidas";
        throw { status: 401, message };
    }
    return {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        localId: data.localId,
        email: data.email,
    };
}
