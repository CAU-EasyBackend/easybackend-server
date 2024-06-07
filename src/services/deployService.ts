import { exec,spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';



class DeployService {
    
    private ami = 'ami-01ed8ade75d4eee2f';
    private instanceType = 't2.micro';
    private privateKeyPath = 'terras/cicd_key.pem';




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

    user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y awscli unzip

              # Install the CloudWatch Logs agent
              wget https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/awslogs-agent-setup.py
              python ./awslogs-agent-setup.py --region us-west-2 --non-interactive --configfile /etc/awslogs/awslogs.conf

              # Create CloudWatch Logs configuration file
              cat <<-EOT > /etc/awslogs/awslogs.conf
              [general]
              state_file = /var/awslogs/state/agent-state

              [/var/log/syslog]
              file = /var/log/syslog
              log_group_name = ${instanceName}-log-group
              log_stream_name = {instance_id}/syslog
              datetime_format = %b %d %H:%M:%S

              [/var/log/dmesg]
              file = /var/log/dmesg
              log_group_name = ${instanceName}-log-group
              log_stream_name = {instance_id}/dmesg
              datetime_format = %Y-%m-%dT%H:%M:%S

              EOT

              # Restart the CloudWatch Logs agent
              service awslogs restart
              chkconfig awslogs on
              EOF
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
resource "aws_cloudwatch_log_group" "example_log_group" {
  name              = "/aws/instance/example-log-group"
  retention_in_days = 14
}
`;

            fs.writeFile(`terras/${instanceName}.tf`, config, (err) => {
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
            exec('cd terras && terraform init && terraform apply -auto-approve',  (error, stdout, stderr) => {
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
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "export DEBIAN_FRONTEND=noninteractive && sudo apt-get update && sudo apt-get install -y zip unzip && curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && sudo apt-get install -y nodejs && ls ~/"`;
            exec(sshCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && !stderr.includes("Permanently added")) {
                    console.warn(`stderr: ${stderr}`);
                }
                resolve(stdout);
            });
        });
    }

    executeKeyModCommand(privateKeyPath: string): Promise<string> {
         
        return new Promise((resolve, reject) => {
            // 환경에 따라 적절한 권한 설정 명령을 선택합니다.
            const isWindows = process.platform === 'win32';
            const icaclsCommand = isWindows ? `icacls "${privateKeyPath}" /reset && icacls "${privateKeyPath}" /grant:r "%USERNAME%:R" && icacls "${privateKeyPath}" /inheritance:r` : '';
            const chmodCommand = !isWindows ? `chmod 600 "${privateKeyPath}"` : '';
            
            // scp 명령을 구성합니다.
            const scpCommand = `${isWindows ? icaclsCommand : chmodCommand}`;
            
            // 명령을 실행합니다.
            exec(scpCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && !stderr.includes("Permanently added")) {
                    console.warn(`stderr: ${stderr}`);
                }
                resolve(stdout);
            });
        });
    }

    executeSCPCommand(instanceIp: string, localFilePath: string, remoteFilePath: string, privateKeyPath: string): Promise<string> {
         
        return new Promise((resolve, reject) => {
           // const icaclsCommand = `icacls "${privateKeyPath}" /reset && icacls "${privateKeyPath}" /grant:r "%USERNAME%:R" && icacls "${privateKeyPath}" /inheritance:r`; // 윈도우 실행환경의 경우
           // const chmodCommand = `null`; // ubuntu version
            const scpCommand = `scp -i ${privateKeyPath} -o StrictHostKeyChecking=no ${localFilePath} ubuntu@${instanceIp}:${remoteFilePath}`;
            exec(scpCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && !stderr.includes("Permanently added")) {
                    console.warn(`stderr: ${stderr}`);
                }
                resolve(stdout);
            });
        });
    }



    executeUnzipAndListFiles(instanceIp: string, zipFilePath: string, targetDirectory: string, privateKeyPath: string): Promise<string> {
         
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "unzip -o ${zipFilePath} -d ${targetDirectory} && ls ${targetDirectory}"`;
            exec(sshCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && !stderr.includes("Permanently added")) {
                    console.warn(`stderr: ${stderr}`);
                }
                resolve(stdout);
            });
        });
    }

    executeStartCommand(instanceIp: string, privateKeyPath: string): Promise<void> {
         
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "npm start"`;
            const child = spawn(sshCommand, { shell: true });

            let stdoutBuffer = '';
            let stderrBuffer = '';

            child.stdout.on('data', (data) => {
                const output = data.toString();
                stdoutBuffer += output;
                console.log(`stdout: ${output}`);
                if (stdoutBuffer.includes('Listening on port 8080')) {
                    resolve();
                }
            });

            child.stderr.on('data', (data) => {
                const output = data.toString();
                stderrBuffer += output;
                console.error(`stderr: ${output}`);
            });

            child.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Command failed with code ${code}`));
                } else if (!stdoutBuffer.includes('Listening on port 8080')) {
                    reject(new Error('Server did not start correctly.'));
                }
            });
        });
    }

    executeVersionNameChangeCommand(instanceIp: string, version:number, fileName:string,privateKeyPath: string): Promise<string> {
         
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "sudo mv ${fileName}.zip ${fileName}ver${version}.zip"`;
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

    executeClosePortCommand(instanceIp: string,privateKeyPath: string): Promise<string> {
         
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "sudo lsof -t -i :8080 | xargs sudo kill -9"`;
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

    executeRemoveFileAndDirectoryCommand(instanceIp: string,privateKeyPath: string): Promise<string> {
         
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "find . -maxdepth 1 -mindepth 1 ! -name '*.zip' ! -name '.*' -exec rm -rf {} +
            "`;
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
    executeTerminateInstance(instanceName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            exec(`cd terras && terraform destroy -auto-approve`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }
                resolve();
            });
        });
    }
    checkInstanceStatus(instanceIp: string, privateKeyPath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "echo 'Instance is up'"`;
            exec(sshCommand, (error, stdout, stderr) => {
                if (error) {
                    if (stderr && stderr.includes('Connection refused')) {
                        resolve(false);
                    } else {
                        reject(error);
                    }
                    return;
                }
                resolve(true);
            });
        });
    }
    checkServerStatus(instanceIp: string, privateKeyPath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const sshCommand = `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no ubuntu@${instanceIp} "curl -s http://localhost:8080"`;
            exec(sshCommand, (error, stdout, stderr) => {
                if (error) {
                    if (stderr && stderr.includes('Connection refused')) {
                        resolve(false);
                    } else {
                        reject(error);
                    }
                    return;
                }
                resolve(true);
            });
        });
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async firstGenerate(instanceName:string): Promise<string> {
        
    
        await this.createTerraformConfig(instanceName,this.ami,this.instanceType);
        
        const ip = await this.executeTerraform(instanceName);
        
        await this.sleep(30000);
        
        await this.executeKeyModCommand(this.privateKeyPath);
        await this.executeSetupCommand(ip, this.privateKeyPath);
        
        return ip;
    }

    async uploadBackCode(ip: string, version: number, fileName: string, zipFileDir: string): Promise<void> {
       // await this.executeSCPCommand(ip, `uploads/deploy/${fileName}.zip`, "~/", this.privateKeyPath);
      // console.log("uploadBackCode, zipFileDir/fileName is :",`${zipFileDir}/${fileName}`);
        await this.executeSCPCommand(ip, `${zipFileDir}/${fileName}.zip`, "~/", this.privateKeyPath);
        await this.executeVersionNameChangeCommand(ip, version, fileName, this.privateKeyPath);
    }

    async executeBackCode(ip: string, version: number, fileName: string): Promise<void> {
        await this.executeUnzipAndListFiles(ip, `${fileName}ver${version}.zip`, "~/", this.privateKeyPath);
        await this.executeStartCommand(ip, this.privateKeyPath);
    }

    async terminateBackCode(ip: string): Promise<void> {
        await this.executeClosePortCommand(ip, this.privateKeyPath);
        await this.executeRemoveFileAndDirectoryCommand(ip, this.privateKeyPath);
    }
    async terminateInstance(instanceName: string): Promise<void> {
        await this.executeTerminateInstance(instanceName);
    }

    async getInstanceStatus(ip: string): Promise<boolean> {
        return await this.checkInstanceStatus(ip, this.privateKeyPath);
    }
    async getServerStatus(ip: string): Promise<boolean> {
        return await this.checkServerStatus(ip, this.privateKeyPath);
    }



}

export default new DeployService();
