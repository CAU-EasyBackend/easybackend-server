import simpleGit from 'simple-git';

class TestService {
  async gitClone(repositoryURL: string) {
    const parsedURL = new URL(repositoryURL);
    const pathParts = parsedURL.pathname.split('/').filter((part) => part !== '');
    const username = pathParts[0];
    const repositoryName = pathParts[1].replace('.git', '');

    const git = simpleGit();
    await git.clone(repositoryURL, 'copySourceCode/' + username + '/' + repositoryName);

    return;
  }
}

export default new TestService();
