import React, { Component } from "react";

class Private extends Component {
  state = {
    message: ""
  };
  componentDidMount() {
    const { getAccessToken } = this.props.auth;
    fetch("/private", {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("response was not okay");
        }
      })
      .then(response => {
        this.setState({ message: response.message });
      })
      .catch(err => this.setState({ message: err.message }));
  }
  render() {
    return <div>{this.state.message}</div>;
  }
}

export default Private;
