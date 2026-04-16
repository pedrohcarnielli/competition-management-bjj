"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhoto = uploadPhoto;
const storage_1 = require("../providers/storage");
async function uploadPhoto(photoBase64, avatarId) {
    if (!storage_1.photoBucketName) {
        throw new Error("PHOTO_BUCKET não configurado para upload de fotos");
    }
    const match = photoBase64.match(/^data:(image\/[^;]+);base64,(.*)$/);
    const contentType = match ? match[1] : "image/jpeg";
    const base64Data = match ? match[2] : photoBase64;
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `users/${avatarId}-${Date.now()}.jpg`;
    const bucket = storage_1.storage.bucket(storage_1.photoBucketName);
    const file = bucket.file(fileName);
    await file.save(buffer, {
        contentType,
        metadata: {
            contentType,
        },
    });
    await file.makePublic();
    return `https://storage.googleapis.com/${storage_1.photoBucketName}/${fileName}`;
}
