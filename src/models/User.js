"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
});
var User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
