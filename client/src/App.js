import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Whiteboard from './components/Whiteboard';

import Pusher from "pusher-js";
import shortid from 'shortid'; // for generating unique IDs

const channel_name =  'alex';//shortid.generate();
const BASE_URL = process.env.REACT_APP_SERVER_URL;

class App extends Component {
  constructor(props){
    super(props);
    // this.pusher = new Pusher({
    //   appId: process.env.PUSHER_APP_ID,
    //   key: process.env.PUSHER_KEY,
    //   secret: process.env.PUSHER_SECRET,
    //   cluster: 'eu',
    // });
    // Enable pusher logging - don't include this in production
    // Pusher.logToConsole = true;
    console.log(process.env)
    console.log(process.env.REACT_APP_PUSHER_APP_KEY)
    this.pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
      authEndpoint: `/pusher/auth`,
      cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
      encrypted: true
    });
    console.log(`private-group-${channel_name}`)
    this.group_channel = this.pusher.subscribe(`private-group-${channel_name}`);
    this.group_channel.bind("pusher:subscription_error", (status) => {
      console.log("error subscribing to group channel: ", status);
    });

    this.group_channel.bind("pusher:subscription_succeeded", () => {
      console.log("subscription to group succeeded")
    });
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
            <div className="sidebar-header">
              <h3>Whiteboard room</h3>
            </div>

            <ul className="list-unstyled components">
              <p>Color Guide</p>
              <li>
                <div className="user user">User</div>
              </li>
              <li>
                <div className="user guest">Guest</div>
              </li>
            </ul>
          </nav>
          <div className="col-md-9 col-lg-10 d-md-block bg-light">
            <Whiteboard group_channel={this.group_channel}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
