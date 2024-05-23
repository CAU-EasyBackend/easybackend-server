"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var instanceSchema = new mongoose_1.Schema({
    instanceName: { type: String, required: true, unique: true },
    instanceNumber: { type: Number, required: true },
    ownerUserId: { type: String, required: true, ref: 'User' },
    status: { type: String, required: true },
    IP: { type: String },
});
var Instance = (0, mongoose_1.model)('Instance', instanceSchema);
exports.default = Instance;
