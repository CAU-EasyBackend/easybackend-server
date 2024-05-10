import { exec } from 'child_process';
import * as fs from 'fs';

class DeployService {
    createTerraformConfig(instanceName: string, ami: string, instanceType: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const config = `
resource "aws_instance" "${instanceName}" {
  ami           = "${ami}"
  instance_type = "${instanceType}"
  key_name = aws_key_pair.cicd_make_keypair.key_name

  vpc_security_group_ids = [aws_security_group.${instanceName}_allow_ssh.id]

  tags = {
    Name = "${instanceName}"
  }
}
output "${instanceName}_public_ip" {
    value = aws_instance.${instanceName}.public_ip
}

resource "aws_security_group" "${instanceName}_allow_ssh" {
    name        = "${instanceName}_allow_ssh"
    description = "Allow SSH inbound traffic"

    ingress {
      from_port   = 22 
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        from_port   = 8080 
        to_port     = 8080
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
}
`;
            fs.writeFile(`${instanceName}.tf`, config, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    executeTerraform(instanceName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec('terraform init && terraform apply -auto-approve', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }
                const match = stdout.match(new RegExp(`${instanceName}_public_ip = "([\\d\\.]+)"`));
                if (match && match[1]) {
                    resolve(match[1]);
                } else {
                    reject(new Error('No IP address found in Terraform output.'));
                }
            });
        });
    }

    executeCommand(instanceIp: string, command: string, privateKeyPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "${command}"`;
            exec(sshCommand, (error, stdout, stderr) => {
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
    }

    executeSetupCommand(instanceIp: string, privateKeyPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp}  "sudo DEBIAN_FRONTEND=noninteractive apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y zip unzip && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y npm && ls ~/`;
            exec(sshCommand, (error, stdout, stderr) => {
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
    }

    executeSCPCommand(instanceIp:string, localFilePath: string, remoteFilePath: string, privateKeyPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const icaclsCommand = `icacls "${privateKeyPath}" /reset && icacls "${privateKeyPath}" /grant:r "%USERNAME%:R" && icacls "${privateKeyPath}" /inheritance:r`; //윈도우 실행환경의 경우
            const chmodCommand=`null`; //ubuntu version
            const scpCommand = ` && scp -i ${privateKeyPath} -o StrictHostKeyChecking=no ${localFilePath} ubuntu@${instanceIp}:${remoteFilePath}`;
            exec(icaclsCommand + scpCommand, (error, stdout, stderr) => {
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
    }

    executeUnzipAndListFiles(instanceIp:string,zipFilePath: string, targetDirectory: string, privateKeyPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "unzip -o ${zipFilePath} -d ${targetDirectory} && ls ${targetDirectory}"`;
            exec(sshCommand, (error, stdout, stderr) => {
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
    }

    // startNodeApp(instanceIp: string, privateKeyPath: string): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         const sshCommand = `
    //             ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "
    //                 # package.json 파일을 찾습니다.
    //                 DIRECTORY=\$(find / -type f -name 'package.json' 2>/dev/null)
    //                 # 찾은 디렉토리로 이동합니다.
    //                 if [ -z \\"\$DIRECTORY\\" ]; then
    //                     echo 'package.json not found'
    //                     exit 1
    //                 fi
    //                 CD_DIR=\$(dirname \$DIRECTORY)
    //                 cd \$CD_DIR
    //                 # npm start 명령을 실행합니다.
    //                 npm start
    //             "
    //         `;
    //         exec(sshCommand, (error, stdout, stderr) => {
    //             if (error) {
    //                 reject(error);
    //                 return;
    //             }
    //             if (stderr) {
    //                 reject(new Error(stderr));
    //                 return;
    //             }
    //             resolve(stdout);
    //         });
    //     });
    // }
}


function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const deployService = new DeployService();
const instanceName = 'gwak26';
const ami = 'ami-01ed8ade75d4eee2f';
const instanceType = 't2.micro';
const fileName='express.zip';
let temp_ip= 'localhost';

deployService.createTerraformConfig(instanceName, ami, instanceType)
    .then(() => deployService.executeTerraform(instanceName)) //cicd_key.pem에 대한 권한 설정 필요(rrr->rwrr)
    .then((ip) => {
        temp_ip = ip;
        console.log(`AWS Instance IP: ${ip}`);
        return sleep(30000); //생성된지 얼마 안되서 상태가 메롱해서 잠깐 기다림
    })
    .then(() => deployService.executeSCPCommand(temp_ip,fileName, "~/", "cicd_key.pem")) //zip 전송
    .then((result) => console.log('SCP Command output:', result))
  

    .then(() => deployService.executeSetupCommand(temp_ip, "cicd_key.pem")) //필요한 의존성 설치, zip,unzip, npm 
    .then((result) => console.log('Setup Command output:', result))

    .then(() => deployService.executeUnzipAndListFiles(temp_ip,fileName, "~/", "cicd_key.pem"))
    .then((result) => console.log('Unzip and List Command output:', result))
 
    .then(() => deployService.executeCommand(temp_ip, 'npm start', "cicd_key.pem"))
    .then((result) => console.log('start node app Command output:', result))
    .catch((error) => console.error('Error:', error));

export default DeployService;
