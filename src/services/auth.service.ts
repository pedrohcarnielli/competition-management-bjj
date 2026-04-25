import { signInWithEmailAndPassword } from "firebase/auth";
import { webAuth } from "../providers/firebase";

export async function loginUser(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(webAuth, email, password);
        const idToken = await userCredential.user.getIdToken();

        return {
            idToken,
            refreshToken: userCredential.user.refreshToken,
            expiresIn: 3600,
            localId: userCredential.user.uid,
            email: userCredential.user.email,
        };
    } catch (error: any) {
        const errorMessage = error?.message || "Credenciais inválidas";
        throw { status: 401, message: errorMessage };
    }
}
