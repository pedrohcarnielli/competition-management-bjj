import { getApprovalById, listApprovals, saveApproval } from "../repositories/approval.repository";
import { getUserById, saveUser } from "../repositories/user.repository";
import { sendApprovalResponseEmail } from "../utils/email";

export async function getApprovals() {
  return listApprovals();
}

export async function respondApproval(id: string, approverEmail: string, approve: boolean) {
  const approval = await getApprovalById(id);
  if (!approval) {
    throw { status: 404, message: "Solicitação de aprovação não encontrada" };
  }
  if (approval.status !== "pending") {
    throw { status: 400, message: "Esta solicitação já foi processada" };
  }
  if (approval.responsibleEmail.toLowerCase() !== approverEmail.toLowerCase()) {
    throw { status: 400, message: "O aprovador deve ser o responsável indicado" };
  }

  approval.status = approve ? "approved" : "rejected";
  approval.updatedAt = new Date().toISOString();
  await saveApproval(approval);

  const requester = await getUserById(approval.requesterId);
  if (requester) {
    if (!approve) {
      if (approval.type === "legal") {
        requester.responsibleLegalEmail = undefined;
      } else {
        requester.technicalResponsibleEmail = undefined;
      }
      requester.updatedAt = new Date().toISOString();
      await saveUser(requester);
    }
    sendApprovalResponseEmail(approval.type, requester.email, approve);
  }

  return approval;
}
