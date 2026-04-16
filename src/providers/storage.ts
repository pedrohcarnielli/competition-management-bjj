import { Storage } from "@google-cloud/storage";
import { PHOTO_BUCKET } from "../config";

export const storage = new Storage();
export const photoBucketName = PHOTO_BUCKET;
