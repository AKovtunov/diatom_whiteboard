import React, { Component, createRef } from 'react';


class UserList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      clients: this.props.clients
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log("Component state updated")
    this.setState({ clients: nextProps.clients });
  }

  render() {
    console.log(this.state.clients)
    return Object.keys(this.state.clients).map(username =>
      <li>
        <div className="user" key={username} style={{background: this.state.clients[username]}}>
          { username == this.props.me ? `${username} (YOU)` : username}
        </div>
      </li>
    )
  }
}


export default UserList;
