const express = require("express");
const cors = require("cors");
// const crypto = require("crypto");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'))

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 5555;
let numRooms = 0;
let maxRoomIdLength = 6;

app.get("/createRoom", (req, res) => {
    res.send({roomId: createRandomRoomId()});
})

app.get("/joinRoom/:roomId", (req, res) => {
    let roomId = req.params.roomId;
    res.send({status: rooms.hasOwnProperty(roomId)})
})

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origins: ["*"],
        handlePreflightRequest: (req, res) => {
            res.writeHead(200, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST",
                // "Access-Control-Allow-Headers": "my-custom-header",
                // "Access-Control-Allow-Credentials": true
            });
            res.end();
        }
        // allowedHeaders: ["my-custom-header"],
        // credentials: true
    }});
// const rooms = io.of("/").adapter.rooms;
let rooms = {};

io.on("connection", (socket) => {

    // Read Query params
    let roomId = socket.handshake.query['roomId'];
    let userName = socket.handshake.query['name'];
    let createRoom = socket.handshake.query['createRoom'];
    let partyUrl = socket.handshake.query['partyUrl'];

    // Set name and roomId params as props for that socket
    socket["username"] = userName;
    socket["roomId"] = roomId;

    // Join the room
    socket.join(roomId);

    // If this is a newly created room, create a prop with this roomId for storing connected sockets
    if(!rooms.hasOwnProperty(roomId)){
        rooms[roomId] = {
            host: socket.id,
            users: [],
            partyUrl: partyUrl
        };
    }

    // After a user connected to a room, send the usernames of all other connected users in that room
    let roomData = {
        roomId,
        users: {}
    };
    rooms[roomId].users.forEach(user => { roomData.users[user.id] = user.username});
    io.to(socket.id).emit("roomData", roomData);

    // Finally store the current user's socket in this room
    rooms[roomId].users.push(socket);

    // Inform to other users that a new user got added
    let currentUser = {}
    currentUser[socket.id] = socket["username"]
    socket.to(roomId).emit("userAdded", currentUser);

    // Event to send messages
    socket.on("msg", (data) => {
        data['from'] = userName;
        socket.to(roomId).emit("msg", data);
    });

    // Event to send controls
    socket.on("control", (data) => {
        data['from'] = userName;
        data['fromHost'] = rooms[roomId].host == socket.id;
        socket.to(roomId).emit("control", data);
    });

    // Upon user manually leaving
    socket.on("leaveRoom", (data) => {
        if(data){
            socket.to(roomId).emit("userLeft", currentUser);
            socket.leave(roomId);
            let socketIdx = rooms[roomId].users.findIndex(user => user == socket);
            rooms[roomId].users.splice(socketIdx, 1);
        }
    })


    // io.to(roomId).emit("test", "Voila");


});

// app.listen(port, () => console.log(`Listening on port ${port}..`));

httpServer.listen(port, () => console.log(`Listening on port ${port}..`));


function createRandomRoomId(){
    let randomSet = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    let randomRoomId = "";
    let numRandChars = 0;
    let numRoomDigits = numRooms.toString().length;
    if(numRoomDigits <= maxRoomIdLength){
        numRandChars = maxRoomIdLength - numRoomDigits;
    }
    for(let i = 0; i < numRandChars; i++){
        let randomChar = Math.floor(Math.random() * 52);
        randomRoomId += randomSet[randomChar];
    }
    randomRoomId += numRooms.toString();
    numRooms += 1;
    return randomRoomId;
}