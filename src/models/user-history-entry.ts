import { User } from "./user";

export interface UserHistoryEntry {
  timestamp: string;
  data: Omit<User, "history">;
}
