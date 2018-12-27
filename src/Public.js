import React, { Component } from "react";

class Public extends Component {
  state = {
    message: ""
  };
  componentDidMount() {
    fetch("/public")
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

export default Public;