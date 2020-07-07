import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Whiteboard from './components/Whiteboard';
import UserList from './components/UserList';
import Pusher from "pusher-js";
import shortid from 'shortid'; // for generating unique IDs
import Faker from 'faker'


const channel_name =  'P5Mil9LGK';//shortid.generate();
const BASE_URL = process.env.REACT_APP_SERVER_URL;
const username = Faker.internet.userName();
const usercolor = Faker.internet.color();

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      clients: {}
    }

    this.pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
      authEndpoint: `/pusher/auth`,
      cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
      encrypted: true
    });

    this.group_channel = this.pusher.subscribe(`private-group-${channel_name}`);
    this.group_channel.bind("pusher:subscription_error", (status) => {
      console.log("error subscribing to group channel: ", status);
    });

    this.group_channel.bind("pusher:subscription_succeeded", () => {
      console.log("subscription to group succeeded");
      this.group_channel.trigger('client-subscribed', {username: username, color: usercolor});
    });

    this.group_channel.bind("client-subscribed", (data) => {
      console.log("client list updated");
      fetch('/clients')
          .then((response) => response.json())
          .then((data) => {
            this.setState({ clients: data })
          })
          .catch((error) => {
            console.error(error);
          });
    });

    this.group_channel.bind("clients-refreshed", () => {
      console.log("Refreshed clients list, subscribing back")
      console.log(`My name is ${username} and color is ${usercolor}`)
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username, usercolor: usercolor })
      };
      fetch('/clients', requestOptions)
          .then((response) => response.json())
          .then((data) => {
            this.setState({ clients: data })
            console.log("state updated")
            console.log(data)
          })
          .catch((error) => {
            console.error(error);
          });
          console.log("state is:")
          console.log(this.state.clients)
    });

  }

  async componentDidMount() {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, usercolor: usercolor })
    };
    fetch('/clients', requestOptions)
        .then((response) => response.json())
        .then((data) => {
          this.setState({ clients: data })
          console.log("state updated")
          console.log(data)
        })
        .catch((error) => {
          console.error(error);
        });
        console.log("state is:")
        console.log(this.state.clients)
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
            <div className="sidebar-header">
              <h3>Whiteboard room {channel_name}</h3>
            </div>

            <ul className="list-unstyled components">
              <p>Color Guide</p>
              <UserList clients={this.state.clients} me={username}/>
            </ul>
          </nav>
          <div className="col-md-9 col-lg-10 d-md-block bg-light">
            <Whiteboard group_channel={this.group_channel} usercolor={usercolor}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
