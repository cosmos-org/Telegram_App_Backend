require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRouter = require("./routes/index");
const {PORT} = require("./constants/constants");
const {MONGO_URI} = require("./constants/constants");
const bodyParser = require('body-parser');
var http = require("http");
// const io = require('socket.io')(3000)
// const MessageModel = require("../models/Messages");

// connect to mongodb
mongoose.connect(MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(res => {
    console.log("connected to mongodb");
})
    .catch(err => {
        console.log(err);
    })
const app = express();
// use middleware to parse body req to json
// app.use(express.json());

// use middleware to enable cors
app.use(cors());
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
// route middleware
app.use("/", mainRouter);

app.get('/settings', function (req, res) {
    res.send('Settings Page');
});


app.listen(PORT, () => {
    console.log("server start - " + PORT);
})


const socketApp = express();
const socketPort =  7070;
var socketServer = http.createServer(socketApp);
var io = require("socket.io")(socketServer);



//middlewre
socketApp.use(express.json());
var clients = {};

io.on("connection", (socket) => {
  console.log("connetetd");
  console.log(socket.id, "has joined");
  socket.on("signin", (id) => {
    console.log(id);
    clients[id] = socket;
    console.log(clients.length);
  }
  );
  socket.on("message", (msg) => {
    console.log(msg);
    let targetId = msg.to;
    if (clients[targetId]) clients[targetId].emit("message", msg);
  });
  socket.on('disconnect', () => {
    let toDeleteUser;
    for (let key of Object.entries(clients)) {
      // index 1, returns the value for each map key
      let tmp_socket = key[1];
      if (tmp_socket == socket) {
        toDeleteUser = key[0];
      }
    }
    console.log('Deleting User: ' + toDeleteUser);
    if (undefined != toDeleteUser) {
      delete clients[toDeleteUser];
      socket.removeAllListeners('message');
		  socket.removeAllListeners('disconnect');
    }
    console.log(clients.length);
  })
}
);

socketServer.listen(socketPort, "0.0.0.0", () => {
  console.log("server socket started");
});

