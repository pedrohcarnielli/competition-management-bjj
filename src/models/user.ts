import { Graduation } from "./graduation";
import { Role } from "./role";
import { UserHistoryEntry } from "./user-history-entry";

export interface User {
  id: string;
  fullName: string;
  birthDate: string;
  weight: number;
  graduation: Graduation;
  photo?: string;
  email: string;
  phone: string;
  roles: Role[];
  responsibleLegalEmail?: string;
  technicalResponsibleEmail?: string;
  passwordHash?: string;
  firebaseUid?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  history: UserHistoryEntry[];
}

export interface UserPayload {
  fullName?: string;
  birthDate?: string;
  weight?: number;
  graduation?: Graduation;
  photoBase64?: string;
  email?: string;
  phone?: string;
  roles?: Role[];
  responsibleLegalEmail?: string;
  technicalResponsibleEmail?: string;
  password?: string;
}
