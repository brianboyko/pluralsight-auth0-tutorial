const express = require("express");
require("dotenv").config();
const jwt = require("express-jwt"); // validate JWT and set req.user;
const jwksRsa = require("jwks-rsa"); // retrieve RSA keys from a JSON web key set (JWKS) endpoint;
const checkScope = require("express-jwt-authz");

const checkJwt = jwt({
  // dynamically provide a signing key based on the kid in the header
  // and the signing keys provided by the JWKS endpoint
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${
      process.env.REACT_APP_AUTH0_DOMAIN
    }/.well-known/jwks.json`
  }),
  audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,
  algorithms: ["RS256"]
});

const app = express();

app.get("/public", (req, res) => {
  res.json({
    message: "Hello from a public API!"
  });
});

app.get("/private", checkJwt, (req, res) => {
  res.json({
    message: "Hello from a private API!"
  });
});

app.get("/course", checkJwt, checkScope(["read:courses"]), (req, res) => {
  // in the real world, it would read the sub (subscriber id) from the access token
  // and use it to query the database for the author's courses.
  // the remote api would get the scopes from the cryptographic signature,
  // *they* would check the scope too.
  setTimeout(() => {
    res.json({
      courses: [
        { id: 1, title: "Building apps with React" },
        { id: 2, title: "Creating reusable React Components" }
      ]
    });
  }, 1500);
});

app.listen(3001);

console.log("API server listening on " + process.env.REACT_APP_AUTH0_AUDIENCE);
