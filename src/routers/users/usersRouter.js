"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var deployInfosRouter_1 = require("./deployInfosRouter");
var router = (0, express_1.Router)();
router.use('/:userId/deployInfos', deployInfosRouter_1.default);
exports.default = router;
