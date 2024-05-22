"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var response = function (responseStatus, result) {
    return {
        success: responseStatus.success,
        message: responseStatus.message,
        result: result
    };
};
exports.default = response;
