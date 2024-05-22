"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instance_1 = require("../../models/Instance");
var Server_1 = require("../../models/Server");
var ServerVersion_1 = require("../../models/ServerVersion");
var DeployInfosService = /** @class */ (function () {
    function DeployInfosService() {
    }
    DeployInfosService.prototype.getStatusAll = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, instances, _i, _a, instance, serverList, servers, _b, _c, server, versionList, serverVersions, _d, _e, version;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        result = [];
                        return [4 /*yield*/, this.getInstanceList(userId)];
                    case 1:
                        instances = _f.sent();
                        _i = 0, _a = instances.instances;
                        _f.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        instance = _a[_i];
                        serverList = [];
                        return [4 /*yield*/, this.getServerList(instance.instanceId)];
                    case 3:
                        servers = _f.sent();
                        _b = 0, _c = servers.servers;
                        _f.label = 4;
                    case 4:
                        if (!(_b < _c.length)) return [3 /*break*/, 7];
                        server = _c[_b];
                        versionList = [];
                        return [4 /*yield*/, this.getServerVersionList(server.serverId)];
                    case 5:
                        serverVersions = _f.sent();
                        for (_d = 0, _e = serverVersions.serverVersions; _d < _e.length; _d++) {
                            version = _e[_d];
                            versionList.push(version);
                        }
                        serverList.push({
                            server: server,
                            serverVersions: versionList,
                        });
                        _f.label = 6;
                    case 6:
                        _b++;
                        return [3 /*break*/, 4];
                    case 7:
                        result.push({
                            instance: instance,
                            servers: serverList,
                        });
                        _f.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, { instances: result }];
                }
            });
        });
    };
    DeployInfosService.prototype.getInstanceList = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var instanceList, instances;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Instance_1.default.find({ ownerUserId: userId }).sort({ instanceNumber: 1 }).exec()];
                    case 1:
                        instanceList = _a.sent();
                        return [4 /*yield*/, Promise.all(instanceList.map(function (instance) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            instanceId: instance._id,
                                            instanceName: instance.instanceName,
                                            instanceNumber: instance.instanceNumber,
                                            status: instance.status,
                                            IP: instance.IP,
                                        })];
                                });
                            }); }))];
                    case 2:
                        instances = _a.sent();
                        return [2 /*return*/, { instances: instances }];
                }
            });
        });
    };
    DeployInfosService.prototype.getServerList = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var serverList, servers;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Server_1.default.find({ instanceId: instanceId })];
                    case 1:
                        serverList = _a.sent();
                        return [4 /*yield*/, Promise.all(serverList.map(function (server) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            serverId: server._id,
                                            serverName: server.serverName,
                                            runningVersion: server.runningVersion,
                                            latestVersion: server.latestVersion,
                                            port: server.port,
                                        })];
                                });
                            }); }))];
                    case 2:
                        servers = _a.sent();
                        return [2 /*return*/, { servers: servers }];
                }
            });
        });
    };
    DeployInfosService.prototype.getServerVersionList = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var serverVersionList, serverVersions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ServerVersion_1.default.find({ serverId: serverId }).sort({ version: 1 }).exec()];
                    case 1:
                        serverVersionList = _a.sent();
                        serverVersions = serverVersionList.map(function (serverVersion) { return ({
                            version: serverVersion.version,
                            port: serverVersion.port,
                            description: serverVersion.description,
                        }); });
                        return [2 /*return*/, { serverVersions: serverVersions }];
                }
            });
        });
    };
    return DeployInfosService;
}());
exports.default = new DeployInfosService();
