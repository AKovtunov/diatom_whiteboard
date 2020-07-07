require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');

const app = express();
const path = require('path');
const port = process.env.PORT || 5000;

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: 'eu',
});

const clients = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// app.get("/", (req, res) => {
//   res.send("Server is working...");
// });

app.post("/pusher/auth", (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  console.log("authing...");
  var auth = pusher.authenticate(socketId, channel);
  return res.send(auth);
});

app.post("/clients", (req, res) => {
  if (!clients[req.body.username]){
    clients[req.body.username] = req.body.usercolor
  }
  console.log(clients)
  return res.send(clients);
});

app.get("/clients", (req, res) => {
  return res.send(clients);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
