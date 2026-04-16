"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUser = saveUser;
exports.getUserById = getUserById;
exports.listUsers = listUsers;
exports.findUserByEmail = findUserByEmail;
exports.findUserByEmailExcludingId = findUserByEmailExcludingId;
const datastore_1 = require("../providers/datastore");
const KIND = "User";
function createKey(id) {
    return datastore_1.datastore.key([KIND, id]);
}
function mapEntity(entity) {
    return {
        id: entity[datastore_1.datastore.KEY].name || entity[datastore_1.datastore.KEY].id,
        fullName: entity.fullName,
        birthDate: entity.birthDate,
        weight: entity.weight,
        graduation: entity.graduation,
        photo: entity.photo,
        email: entity.email,
        phone: entity.phone,
        roles: entity.roles,
        responsibleLegalEmail: entity.responsibleLegalEmail,
        technicalResponsibleEmail: entity.technicalResponsibleEmail,
        passwordHash: entity.passwordHash,
        deletedAt: entity.deletedAt || null,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        history: entity.history || [],
    };
}
async function saveUser(user) {
    const key = createKey(user.id);
    await datastore_1.datastore.save({ key, data: { ...user } });
    return user;
}
async function getUserById(id) {
    const key = createKey(id);
    const [entity] = await datastore_1.datastore.get(key);
    return entity ? mapEntity(entity) : null;
}
async function listUsers() {
    const query = datastore_1.datastore.createQuery(KIND).filter("deletedAt", "=", null);
    const [entities] = await datastore_1.datastore.runQuery(query);
    return entities.map(mapEntity);
}
async function findUserByEmail(email) {
    const query = datastore_1.datastore.createQuery(KIND).filter("email", "=", email.toLowerCase());
    const [entities] = await datastore_1.datastore.runQuery(query);
    const entity = entities[0];
    return entity ? mapEntity(entity) : null;
}
async function findUserByEmailExcludingId(email, excludeId) {
    const user = await findUserByEmail(email);
    return user && user.id !== excludeId ? user : null;
}
