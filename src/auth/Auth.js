import auth0 from "auth0-js";

const REDIRECT_ON_LOGIN = "redirect_on_login";

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
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    const scopes = authResult.scope || this.requestedScopes || "";
    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    // this is just for convenience. The server validates
    // these claims, this is just so that we don't have
    // to parse the JWT every time on the client.
    // REMEMBER IOS DOESN'T HAVE LOCALSTORAGE
    // might need to rewrite Auth class for that case
    localStorage.setItem("expires_at", expiresAt);
    localStorage.setItem("scopes", JSON.stringify(scopes));
  };

  /* These checks are merely here for user experience, not security
  It is the server's job to validate the user is authorized when a api call
  is made. */
  isAuthenticated() {
    try {
      const expiresAt = JSON.parse(localStorage.getItem("expires_at"));
      return new Date().getTime() < expiresAt;
    } catch (e) {
      return false;
    }
  }

  /* These checks are merely here for user experience, not security
  It is the server's job to validate the user is authorized when a api call
  is made. */
  userHasScopes(scopes) {
    const grantedScopes = (
      JSON.parse(localStorage.getItem("scopes")) || ""
    ).split(" ");
    return scopes.every(scope => grantedScopes.includes(scope));
  }

  logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("scopes");
    localStorage.removeItem(REDIRECT_ON_LOGIN);
    this.userProfile = null;
    this.err = null;
    this.auth0.logout({
      clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: "http://localhost:3000"
    });
  };

  getAccessToken = () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }
      return accessToken;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

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
}

export default Auth;
