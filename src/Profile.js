import React, { Component } from "react";

class Profile extends Component {
  state = {
    profile: null,
    err: ""
  };
  componentDidMount() {
    this.loadUserProfile();
  }
  loadUserProfile = () => {
    this.props.auth
      .getProfile()
      .then(profile => {
        this.setState({ profile });
      })
      .catch(err => {
        this.setState({ err });
      });
  };
  render() {
    const {profile} = this.state; 
    if(!profile){
      return null; 
    }
    return (
      <div>
        <h1>Profile</h1>
        <p>{profile.nickname}</p>
        <img
          style={{ maxWidth: 50, maxHeight: 50 }}
          src={profile.picture}
          alt="profile pic"
        />
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </div>
    );
  }
}

export default Profile;
