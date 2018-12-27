import React, { Component } from "react";
import { Link } from "react-router-dom";

class Nav extends Component {
  render() {
    const { isAuthenticated, userHasScopes, logout, login } = this.props.auth;
    const isAuth = isAuthenticated();
    return (
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/public">Public</Link>
          </li>
          {isAuth ? (
            <li>
              <Link to="/private">Private</Link>
            </li>
          ) : null}
          {isAuth && userHasScopes(["read:courses"]) ? (
            <li>
              <Link to="/courses">Courses</Link>
            </li>
          ) : null}
          <li>
            <button onClick={isAuth ? logout : login}>
              {isAuth ? "Logout" : "Login"}
            </button>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Nav;
