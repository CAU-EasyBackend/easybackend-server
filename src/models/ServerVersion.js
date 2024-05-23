"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var serverVersionSchema = new mongoose_1.Schema({
    serverId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Server' },
    version: { type: Number, required: true },
    port: { type: Number },
    description: { type: String },
});
var ServerVersion = (0, mongoose_1.model)('ServerVersion', serverVersionSchema);
exports.default = ServerVersion;
