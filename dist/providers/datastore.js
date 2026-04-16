"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datastore = void 0;
const datastore_1 = require("@google-cloud/datastore");
const config_1 = require("../config");
exports.datastore = new datastore_1.Datastore({ projectId: config_1.GCP_PROJECT_ID || undefined });
