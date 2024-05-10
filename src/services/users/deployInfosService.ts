import Instance, {IInstance} from '../../models/Instance';
import Server, {IServer} from '../../models/Server';
import ServerVersion, {IServerVersion} from '../../models/ServerVersion';

class DeployInfosService {
  async getStatusAll(userId: string) {
    const instanceList: IInstance[] = await this.getInstanceList(userId);

    return await Promise.all(instanceList.map(async (instance) => {
      const serverList: IServer[] = await this.getServerList(instance._id);

      const serverWithVersions = await Promise.all(serverList.map(async (server) => {
        const serverVersionList: IServerVersion[] = await this.getServerVersionList(server._id);

        return {
          serverName: server.serverName,
          serverVersionList,
        };
      }));

      return {
        instanceName: instance.instanceName,
        serverWithVersions,
      };
    }));
  }

  async getInstanceList(userId: string) {
    const instanceList: IInstance[] = await Instance.find({ ownerUserId: userId }).sort({ instanceNumber: 1 }).exec();

    return instanceList;
  }

  async getServerList(instanceId: string) {
    const serverList: IServer[] = await Server.find({ instanceId });

    return serverList;
  }

  async getServerVersionList(serverId: string) {
    const serverVersionList: IServerVersion[] = await ServerVersion.find({ serverId }).sort({ version: 1 }).exec();

    return serverVersionList;
  }
}

export default new DeployInfosService();
