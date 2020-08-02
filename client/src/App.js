import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import Whiteboard from './components/Whiteboard';
import UserList from './components/UserList';
import Pusher from "pusher-js";
import shortid from 'shortid'; // for generating unique IDs
import Faker from 'faker'
import { SliderPicker } from 'react-color';


const channel_name =  'P5Mil9LGK';//shortid.generate();
const BASE_URL = process.env.REACT_APP_SERVER_URL;
const username = Faker.internet.userName();

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      clients: {},
      color: Faker.internet.color()
    }

    this.pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
      authEndpoint: `/pusher/auth`,
      cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
      encrypted: true
    });

    this.group_channel = this.pusher.subscribe(`private-group-${channel_name}`);
  }

  async componentDidMount() {
    console.warn("COMPONENT componentDidMount FOR APP>JS");
    this.group_channel.bind("pusher:subscription_error", (status) => {
      console.log("error subscribing to group channel: ", status);
    });

    this.group_channel.bind("pusher:subscription_succeeded", () => {
      console.log("subscription to group succeeded");
      this.group_channel.trigger('client-subscribed', {username: username, color: this.state.color});
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
      console.log(`My name is ${username} and color is ${this.state.color}`)
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username, usercolor: this.state.color })
      };
      console.log(`Sending { username: ${username}, usercolor: ${this.state.color} } to the server`)
      fetch('/clients', requestOptions)
          .then((response) => response.json())
          .then((data) => {
            this.setState({ clients: data })
          })
          .catch((error) => {
            console.error(error);
          });
          console.log("state is:")
          console.log(this.state.clients)
    });


    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, usercolor: this.state.color })
    };
    fetch('/clients', requestOptions)
        .then((response) => response.json())
        .then((data) => {
          this.setState({ clients: data })
          console.log("state is:")
          console.log(this.state.clients)
        })
        .catch((error) => {
          console.error(error);
        });
  }

  handleChange = (color, event) => {
    this.setState({color: color.hex})
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row logo-navbar">
          <img src={logo} alt="DiatomEnterprises" className="logo" />
        </div>
        <div className="row main-container">
          <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
            <div className="sidebar-header">
              <p className="room-title">Whiteboard room {channel_name}</p>
            </div>

            <ul className="list-unstyled components">
              <h5>Color Guide</h5>
              <UserList clients={this.state.clients} me={username}/>
            </ul>
          </nav>
          <div className="col-md-8 col-lg-10 d-md-block bg-light whiteboard">
            <Whiteboard group_channel={this.group_channel} username = {username} usercolor={this.state.color}/>
          </div>
        </div>
        <div className="row bottom-bar">
          <div className="col-md-12 col-lg-12 d-md-block bg-light">
            <SliderPicker
              color={ this.state.color }
              onChangeComplete={ this.handleChange }
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
