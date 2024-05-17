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
var child_process_1 = require("child_process");
var fs = require("fs");
var DeployService = /** @class */ (function () {
    function DeployService() {
        this.instanceName = 'gwaktt';
        this.ami = 'ami-01ed8ade75d4eee2f';
        this.instanceType = 't2.micro';
        this.privateKeyPath = 'cicd_key.pem';
    }
    DeployService.prototype.createTerraformConfig = function (instanceName, ami, instanceType) {
        return new Promise(function (resolve, reject) {
            var config = "\nresource \"aws_instance\" \"".concat(instanceName, "\" {\n  ami           = \"").concat(ami, "\"\n  instance_type = \"").concat(instanceType, "\"\n  key_name = aws_key_pair.cicd_make_keypair.key_name\n\n  vpc_security_group_ids = [aws_security_group.").concat(instanceName, "_allow_ssh.id]\n\n  tags = {\n    Name = \"").concat(instanceName, "\"\n  }\n}\noutput \"").concat(instanceName, "_public_ip\" {\n    value = aws_instance.").concat(instanceName, ".public_ip\n}\n\nresource \"aws_security_group\" \"").concat(instanceName, "_allow_ssh\" {\n    name        = \"").concat(instanceName, "_allow_ssh\"\n    description = \"Allow SSH inbound traffic\"\n\n    ingress {\n      from_port   = 22 \n      to_port     = 22\n      protocol    = \"tcp\"\n      cidr_blocks = [\"0.0.0.0/0\"]\n    }\n\n    ingress {\n        from_port   = 8080 \n        to_port     = 8080\n        protocol    = \"tcp\"\n        cidr_blocks = [\"0.0.0.0/0\"]\n    }\n\n    egress {\n      from_port   = 0\n      to_port     = 0\n      protocol    = \"-1\"\n      cidr_blocks = [\"0.0.0.0/0\"]\n    }\n}\n");
            fs.writeFile("".concat(instanceName, ".tf"), config, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    };
    DeployService.prototype.executeTerraform = function (instanceName) {
        return new Promise(function (resolve, reject) {
            (0, child_process_1.exec)('terraform init && terraform apply -auto-approve', function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }
                var match = stdout.match(new RegExp("".concat(instanceName, "_public_ip = \"([\\d\\.]+)\"")));
                if (match && match[1]) {
                    resolve(match[1]);
                }
                else {
                    reject(new Error('No IP address found in Terraform output.'));
                }
            });
        });
    };
    DeployService.prototype.executeCommand = function (instanceIp, command, privateKeyPath) {
        return new Promise(function (resolve, reject) {
            var sshCommand = "ssh -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ubuntu@").concat(instanceIp, " \"").concat(command, "\"");
            (0, child_process_1.exec)(sshCommand, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    };
    DeployService.prototype.executeSetupCommand = function (instanceIp, privateKeyPath) {
        return new Promise(function (resolve, reject) {
            var sshCommand = "ssh -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ubuntu@").concat(instanceIp, " \"export DEBIAN_FRONTEND=noninteractive && sudo apt-get update && sudo apt-get install -y zip unzip && curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && sudo apt-get install -y nodejs && ls ~/\"");
            (0, child_process_1.exec)(sshCommand, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && !stderr.includes("Permanently added")) {
                    console.warn("stderr: ".concat(stderr));
                }
                resolve(stdout);
            });
        });
    };
    DeployService.prototype.executeKeyModCommand = function (privateKeyPath) {
        return new Promise(function (resolve, reject) {
            // 환경에 따라 적절한 권한 설정 명령을 선택합니다.
            var isWindows = process.platform === 'win32';
            var icaclsCommand = isWindows ? "icacls \"".concat(privateKeyPath, "\" /reset && icacls \"").concat(privateKeyPath, "\" /grant:r \"%USERNAME%:R\" && icacls \"").concat(privateKeyPath, "\" /inheritance:r") : '';
            var chmodCommand = !isWindows ? "chmod 600 \"".concat(privateKeyPath, "\"") : '';
            // scp 명령을 구성합니다.
            var scpCommand = "".concat(isWindows ? icaclsCommand : chmodCommand);
            // 명령을 실행합니다.
            (0, child_process_1.exec)(scpCommand, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && !stderr.includes("Permanently added")) {
                    console.warn("stderr: ".concat(stderr));
                }
                resolve(stdout);
            });
        });
    };
    DeployService.prototype.executeSCPCommand = function (instanceIp, localFilePath, remoteFilePath, privateKeyPath) {
        return new Promise(function (resolve, reject) {
            // const icaclsCommand = `icacls "${privateKeyPath}" /reset && icacls "${privateKeyPath}" /grant:r "%USERNAME%:R" && icacls "${privateKeyPath}" /inheritance:r`; // 윈도우 실행환경의 경우
            // const chmodCommand = `null`; // ubuntu version
            var scpCommand = "scp -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ").concat(localFilePath, " ubuntu@").concat(instanceIp, ":").concat(remoteFilePath);
            (0, child_process_1.exec)(scpCommand, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && !stderr.includes("Permanently added")) {
                    console.warn("stderr: ".concat(stderr));
                }
                resolve(stdout);
            });
        });
    };
    DeployService.prototype.executeUnzipAndListFiles = function (instanceIp, zipFilePath, targetDirectory, privateKeyPath) {
        return new Promise(function (resolve, reject) {
            var sshCommand = "ssh -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ubuntu@").concat(instanceIp, " \"unzip -o ").concat(zipFilePath, " -d ").concat(targetDirectory, " && ls ").concat(targetDirectory, "\"");
            (0, child_process_1.exec)(sshCommand, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && !stderr.includes("Permanently added")) {
                    console.warn("stderr: ".concat(stderr));
                }
                resolve(stdout);
            });
        });
    };
    DeployService.prototype.executeStartCommand = function (instanceIp, privateKeyPath) {
        return new Promise(function (resolve, reject) {
            var sshCommand = "ssh -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ubuntu@").concat(instanceIp, " \"npm start\"");
            var child = (0, child_process_1.spawn)(sshCommand, { shell: true });
            var stdoutBuffer = '';
            var stderrBuffer = '';
            child.stdout.on('data', function (data) {
                var output = data.toString();
                stdoutBuffer += output;
                console.log("stdout: ".concat(output));
                if (stdoutBuffer.includes('Listening on port 8080')) {
                    resolve();
                }
            });
            child.stderr.on('data', function (data) {
                var output = data.toString();
                stderrBuffer += output;
                console.error("stderr: ".concat(output));
            });
            child.on('close', function (code) {
                if (code !== 0) {
                    reject(new Error("Command failed with code ".concat(code)));
                }
                else if (!stdoutBuffer.includes('Listening on port 8080')) {
                    reject(new Error('Server did not start correctly.'));
                }
            });
        });
    };
    DeployService.prototype.executeVersionNameChangeCommand = function (instanceIp, version, fileName, privateKeyPath) {
        return new Promise(function (resolve, reject) {
            var sshCommand = "ssh -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ubuntu@").concat(instanceIp, " \"sudo mv ").concat(fileName, ".zip ").concat(fileName, "ver").concat(version, ".zip\"");
            (0, child_process_1.exec)(sshCommand, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    };
    DeployService.prototype.executeClosePortCommand = function (instanceIp, privateKeyPath) {
        return new Promise(function (resolve, reject) {
            var sshCommand = "ssh -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ubuntu@").concat(instanceIp, " \"sudo lsof -t -i :8080 | xargs sudo kill -9\"");
            (0, child_process_1.exec)(sshCommand, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    };
    DeployService.prototype.executeRemoveFileAndDirectoryCommand = function (instanceIp, privateKeyPath) {
        return new Promise(function (resolve, reject) {
            var sshCommand = "ssh -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ubuntu@").concat(instanceIp, " \"find . -maxdepth 1 -mindepth 1 ! -name '*.zip' ! -name '.*' -exec rm -rf {} +\n            \"");
            (0, child_process_1.exec)(sshCommand, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    };
    DeployService.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    DeployService.prototype.firstGenerate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createTerraformConfig(this.instanceName, this.ami, this.instanceType)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.executeTerraform(this.instanceName)];
                    case 2:
                        ip = _a.sent();
                        console.log("here i am ip asdfasdf \n\n\n");
                        return [4 /*yield*/, this.sleep(30000)];
                    case 3:
                        _a.sent();
                        console.log("here i am \n\n\n");
                        return [4 /*yield*/, this.executeKeyModCommand(this.privateKeyPath)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.executeSetupCommand(ip, this.privateKeyPath)];
                    case 5:
                        _a.sent();
                        console.log("hihi");
                        return [2 /*return*/, ip];
                }
            });
        });
    };
    DeployService.prototype.uploadBackCode = function (ip, version, fileName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeSCPCommand(ip, "".concat(fileName, ".zip"), "~/", this.privateKeyPath)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.executeVersionNameChangeCommand(ip, version, fileName, this.privateKeyPath)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DeployService.prototype.executeBackCode = function (ip, version, fileName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeUnzipAndListFiles(ip, "".concat(fileName, "ver").concat(version, ".zip"), "~/", this.privateKeyPath)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.executeStartCommand(ip, this.privateKeyPath)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DeployService.prototype.terminateBackCode = function (ip) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeClosePortCommand(ip, this.privateKeyPath)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.executeRemoveFileAndDirectoryCommand(ip, this.privateKeyPath)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return DeployService;
}());
module.exports = DeployService;
