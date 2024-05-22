"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var serverSchema = new mongoose_1.Schema({
    instanceId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Instance' },
    serverName: { type: String, required: true },
    runningVersion: { type: Number, required: true },
    latestVersion: { type: Number, required: true },
    port: { type: Number },
});
var Server = (0, mongoose_1.model)('Server', serverSchema);
exports.default = Server;
