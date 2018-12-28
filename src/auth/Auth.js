import auth0 from "auth0-js";

const REDIRECT_ON_LOGIN = "redirect_on_login";

const privateStore = {
  idToken: null,
  accessToken: null,
  scopes: null,
  expiresAt: null
};

class Auth {
  /**
   * @param {React-Router-History} history - needed to perform redirect
   */
  constructor(history) {
    this.history = history;
    this.userProfile = null;
    this.err = null;
    this.requestedScopes = "openid profile email read:courses";
    this.auth0 = new auth0.WebAuth({
      domain: process.env.REACT_APP_AUTH0_DOMAIN,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URL,
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      responseType: "token id_token",
      scope: this.requestedScopes
    });
    window.debugAuth = () => {
      console.log(privateStore);
    };
  }

  login = () => {
    // we need to redirect back to page once the oauth occurs.
    localStorage.setItem(
      REDIRECT_ON_LOGIN,
      JSON.stringify(this.history.location)
    );
    this.auth0.authorize(); // will redirect browser to Auth0 login;
  };

  handleAuthentication = () => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        const storedRedirect = localStorage.getItem(REDIRECT_ON_LOGIN);
        const redirectLocation = storedRedirect
          ? JSON.parse(storedRedirect)
          : "/";
        this.history.push(redirectLocation);
      } else if (err) {
        this.history.push("/");
        alert(`Error: ${err.error}. Check the console for further details`);
        console.log(err);
      }
    });
  };

  setSession = authResult => {
    // set the time the access token will expire
    privateStore.expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
    privateStore.scopes = authResult.scope || this.requestedScopes || "";
    privateStore.accessToken = authResult.accessToken;
    privateStore.idToken = authResult.idToken;
    this.scheduleTokenRenewal(); 
  };

  /* These checks are merely here for user experience, not security
  It is the server's job to validate the user is authorized when a api call
  is made. */
  isAuthenticated = () => new Date().getTime() < privateStore.expiresAt;

  /* These checks are merely here for user experience, not security
  It is the server's job to validate the user is authorized when a api call
  is made. */
  userHasScopes = scopes =>
    scopes.every(scope => privateStore.scopes.includes(scope));

  logout = () => {
    for (let key in privateStore) {
      privateStore[key] = null;
    }
    localStorage.removeItem(REDIRECT_ON_LOGIN);
    this.userProfile = null;
    this.err = null;
    this.auth0.logout({
      clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: "http://localhost:3000"
    });
  };

  getAccessToken = () => privateStore.accessToken;

  getProfile = () =>
    new Promise((resolve, reject) => {
      if (this.userProfile) {
        return resolve(this.userProfile);
      }
      this.auth0.client.userInfo(this.getAccessToken(), (err, profile) => {
        if (profile) {
          this.err = null;
          this.userProfile = profile;
          resolve(profile);
        }
        if (err) {
          this.err = err;
          reject(err);
        }
      });
    });

  renewToken = () =>
    new Promise((resolve, reject) => {
      this.auth0.checkSession({}, (err, result) => {
        if (err) {
          console.error(`Error: ${err.error} - ${err.error_description}.`);
          reject(err);
          return;
        }
        this.setSession(result);
        resolve(result);
      });
    });

  scheduleTokenRenewal = () => {
    const delay = privateStore.expiresAt - Date.now();
    if(delay > 0) {
      setTimeout(() => this.renewToken(), delay); 
    }
  }
}

export default Auth;
