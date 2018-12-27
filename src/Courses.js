import React, { Component } from "react";

class Courses extends Component {
  state = {
    courses: [],
    message: ""
  };
  componentDidMount() {
    const { getAccessToken } = this.props.auth;
    fetch("/course", {
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
        this.setState({ courses: response.courses, message: "" });
      })
      .catch(err => this.setState({ message: err.message }));

      fetch("/admin", {
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
          console.log(response);
        })
        .catch(err => this.setState({ message: err.message }));
  
  }
  render() {
    return (
      <div>
        {this.state.message}
        <ul>
          {this.state.courses.map(course => (
            <li key={course.id}>{course.title}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Courses;
