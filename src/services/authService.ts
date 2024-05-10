import HttpError from '../helpers/httpError';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import axios from 'axios';

class AuthService {
  async getGithubLoginURL() {
    const serverURL: string | undefined = process.env.SERVER_URL;
    const githubClientID: string | undefined = process.env.GITHUB_CLIENT_ID;
    if(serverURL == undefined || githubClientID == undefined) {
      throw new HttpError(BaseResponseStatus.ENVIRONMENT_VARIABLE_ERROR);
    }

    return 'https://github.com/login/oauth/authorize?client_id='
      + githubClientID + '&redirect_uri=' + serverURL + '/auth/callback';
  }

  async getGithubUserData(code: string) {
    const githubClientID: string | undefined = process.env.GITHUB_CLIENT_ID;
    const githubClientSecret: string | undefined = process.env.GITHUB_CLIENT_SECRET;
    if(githubClientID == undefined || githubClientSecret == undefined) {
      throw new HttpError(BaseResponseStatus.ENVIRONMENT_VARIABLE_ERROR);
    }
    /*
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: githubClientID,
      client_secret: githubClientSecret,
      code: code
    }, {
      headers: {
        'Accept': 'application/json'
      },
    });

    const accessToken = response.data.access_token;

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': 'token ' + accessToken
      }
    });*/
  }
}

export default new AuthService();
