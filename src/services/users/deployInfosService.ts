import Instance, {IInstance} from '../../models/Instance';
import Server, {IServer} from '../../models/Server';
import ServerVersion, {IServerVersion} from '../../models/ServerVersion';

class DeployInfosService {
  async getStatusAll(userId: string) {
    const result = [];
    const instances = await this.getInstanceList(userId);

    for(const instance of instances.instances) {
      const serverList = [];
      const servers = await this.getServerList(instance.instanceId);

      for(const server of servers.servers) {
        const versionList = [];
        const serverVersions = await this.getServerVersionList(server.serverId);

        for(const version of serverVersions.serverVersions) {
          versionList.push(version);
        }
        serverList.push({
          server,
          serverVersions: versionList,
        });
      }
      result.push({
        instance,
        servers: serverList,
      });
    }
    return { instances: result };
  }

  async getInstanceList(userId: string) {
    const instanceList: IInstance[] = await Instance.find({ ownerUserId: userId }).sort({ instanceNumber: 1 }).exec();
    const instances = await Promise.all(instanceList.map(async (instance) => ({
      instanceId: instance._id,
      instanceName: instance.instanceName,
      instanceNumber: instance.instanceNumber,
      status: instance.status,
      IP: instance.IP,
    })));

    return { instances };
  }

  async getServerList(instanceId: string) {
    const serverList: IServer[] = await Server.find({ instanceId });
    const servers = await Promise.all(serverList.map(async (server) => ({
      serverId: server._id,
      serverName: server.serverName,
      runningVersion: server.runningVersion,
      latestVersion: server.latestVersion,
      port: server.port,
    })));

    return { servers };
  }

  async getServerVersionList(serverId: string) {
    const serverVersionList: IServerVersion[] = await ServerVersion.find({ serverId }).sort({ version: 1 }).exec();
    const serverVersions = serverVersionList.map((serverVersion) => ({
      version: serverVersion.version,
      port: serverVersion.port,
      description: serverVersion.description,
    }));

    return { serverVersions };
  }
}

export default new DeployInfosService();
