import { firebaseAuth } from "../providers/firebase";

export async function createFirebaseUserAccount(email: string, password: string, displayName: string) {
  const user = await firebaseAuth.createUser({
    email,
    password,
    displayName,
  });
  return user;
}

export async function updateFirebaseUserAccount(firebaseUid: string, updates: { email?: string; password?: string; displayName?: string }) {
  const user = await firebaseAuth.updateUser(firebaseUid, updates);
  return user;
}

export async function deleteFirebaseUserAccount(firebaseUid: string) {
  await firebaseAuth.deleteUser(firebaseUid);
}
