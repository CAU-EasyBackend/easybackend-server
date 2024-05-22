"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var response_1 = require("./response");
var httpError_1 = require("./httpError");
var baseResponseStatus_1 = require("./baseResponseStatus");
var simple_git_1 = require("simple-git");
function errorHandler(error, req, res, next) {
    console.error(error);
    if (error instanceof httpError_1.default) {
        var status_1 = error.responseStatus.status;
        return res.status(status_1).json((0, response_1.default)(error.responseStatus));
    }
    else if (error instanceof simple_git_1.GitError) {
        var status_2 = baseResponseStatus_1.BaseResponseStatus.GIT_CLONE_ERROR.status;
        return res.status(status_2).json((0, response_1.default)(baseResponseStatus_1.BaseResponseStatus.GIT_CLONE_ERROR));
    }
    else {
        var status_3 = baseResponseStatus_1.BaseResponseStatus.SERVER_ERROR.status;
        return res.status(status_3).json((0, response_1.default)(baseResponseStatus_1.BaseResponseStatus.SERVER_ERROR));
    }
}
exports.default = errorHandler;
