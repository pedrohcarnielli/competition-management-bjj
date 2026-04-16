"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveApproval = saveApproval;
exports.getApprovalById = getApprovalById;
exports.listApprovals = listApprovals;
const datastore_1 = require("../providers/datastore");
const KIND = "ApprovalRequest";
function createKey(id) {
    return datastore_1.datastore.key([KIND, id]);
}
function mapEntity(entity) {
    return {
        id: entity[datastore_1.datastore.KEY].name || entity[datastore_1.datastore.KEY].id,
        type: entity.type,
        requesterId: entity.requesterId,
        requesterEmail: entity.requesterEmail,
        responsibleEmail: entity.responsibleEmail,
        status: entity.status,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
    };
}
async function saveApproval(approval) {
    const key = createKey(approval.id);
    await datastore_1.datastore.save({ key, data: { ...approval } });
    return approval;
}
async function getApprovalById(id) {
    const key = createKey(id);
    const [entity] = await datastore_1.datastore.get(key);
    return entity ? mapEntity(entity) : null;
}
async function listApprovals() {
    const query = datastore_1.datastore.createQuery(KIND);
    const [entities] = await datastore_1.datastore.runQuery(query);
    return entities.map(mapEntity);
}
