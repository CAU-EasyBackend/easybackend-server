"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fs = require("fs");
var DeployService = /** @class */ (function () {
    function DeployService() {
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
            var sshCommand = "ssh -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ubuntu@").concat(instanceIp, "  \"sudo DEBIAN_FRONTEND=noninteractive apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y zip unzip && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y npm && ls ~/");
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
    DeployService.prototype.executeSCPCommand = function (instanceIp, localFilePath, remoteFilePath, privateKeyPath) {
        return new Promise(function (resolve, reject) {
            var icaclsCommand = "icacls \"".concat(privateKeyPath, "\" /reset && icacls \"").concat(privateKeyPath, "\" /grant:r \"%USERNAME%:R\" && icacls \"").concat(privateKeyPath, "\" /inheritance:r"); //윈도우 실행환경의 경우
            var chmodCommand = "null"; //ubuntu version
            var scpCommand = " && scp -i ".concat(privateKeyPath, " -o StrictHostKeyChecking=no ").concat(localFilePath, " ubuntu@").concat(instanceIp, ":").concat(remoteFilePath);
            (0, child_process_1.exec)(icaclsCommand + scpCommand, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && !stderr.includes("Permanently added")) {
                    reject(new Error(stderr));
                    return;
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
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    };
    return DeployService;
}());
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
var deployService = new DeployService();
var instanceName = 'gwak26';
var ami = 'ami-01ed8ade75d4eee2f';
var instanceType = 't2.micro';
var fileName = 'express.zip';
var temp_ip = 'localhost';
deployService.createTerraformConfig(instanceName, ami, instanceType)
    .then(function () { return deployService.executeTerraform(instanceName); }) //cicd_key.pem에 대한 권한 설정 필요(rrr->rwrr)
    .then(function (ip) {
    temp_ip = ip;
    console.log("AWS Instance IP: ".concat(ip));
    return sleep(30000); //생성된지 얼마 안되서 상태가 메롱해서 잠깐 기다림
})
    .then(function () { return deployService.executeSCPCommand(temp_ip, fileName, "~/", "cicd_key.pem"); }) //zip 전송
    .then(function (result) { return console.log('SCP Command output:', result); })
    .then(function () { return deployService.executeSetupCommand(temp_ip, "cicd_key.pem"); }) //필요한 의존성 설치, zip,unzip, npm 
    .then(function (result) { return console.log('Setup Command output:', result); })
    .then(function () { return deployService.executeUnzipAndListFiles(temp_ip, fileName, "~/", "cicd_key.pem"); })
    .then(function (result) { return console.log('Unzip and List Command output:', result); })
    .then(function () { return deployService.executeCommand(temp_ip, 'npm start', "cicd_key.pem"); })
    .then(function (result) { return console.log('start node app Command output:', result); })
    .catch(function (error) { return console.error('Error:', error); });
exports.default = DeployService;
