export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalType = "legal" | "technical";

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  requesterId: string;
  requesterEmail: string;
  responsibleEmail: string;
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}
