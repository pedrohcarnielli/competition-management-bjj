"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
const auth_1 = require("firebase/auth");
const firebase_1 = require("../providers/firebase");
async function loginUser(email, password) {
    try {
        const userCredential = await (0, auth_1.signInWithEmailAndPassword)(firebase_1.webAuth, email, password);
        const idToken = await userCredential.user.getIdToken();
        return {
            idToken,
            refreshToken: userCredential.user.refreshToken,
            expiresIn: 3600,
            localId: userCredential.user.uid,
            email: userCredential.user.email,
        };
    }
    catch (error) {
        const errorMessage = error?.message || "Credenciais inválidas";
        throw { status: 401, message: errorMessage };
    }
}
