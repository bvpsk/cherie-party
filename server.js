const express = require("express");
// const crypto = require("crypto");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
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
const io = new Server(httpServer, { /* options */ });
// const rooms = io.of("/").adapter.rooms;
let rooms = {};

io.on("connection", (socket) => {

    // Read Query params
    let roomId = socket.handshake.query['roomId'];
    let userName = socket.handshake.query['name'];
    let createRoom = socket.handshake.query['createRoom'];

    // Set name and roomId params as props for that socket
    socket["username"] = userName;
    socket["roomId"] = roomId;

    // Join the room
    socket.join(roomId);

    // If this is a newly created room, create a prop with this roomId for storing connected sockets
    if(!rooms.hasOwnProperty(roomId)){
        rooms[roomId] = [];
    }

    // After a user connected to a room, send the usernames of all other connected users in that room
    let roomData = {
        roomId,
        users: {}
    };
    rooms[roomId].forEach(user => { roomData.users[user.id] = user.username});
    io.to(socket.id).emit("roomData", roomData);

    // Finally store the current user's socket in this room
    rooms[roomId].push(socket);

    // Inform to other users that a new user got added
    let currentUser = {}
    currentUser[socket.id] = socket["username"]
    socket.to(roomId).emit("userAdded", currentUser);

    // Event to send messages
    socket.on("msg", (data) => {
        data['from'] = userName;
        socket.to(roomId).emit("msg", data);
    });

    // Upon user manually leaving
    socket.on("leaveRoom", (data) => {
        if(data){
            socket.to(roomId).emit("userLeft", currentUser);
            socket.leave(roomId);
            let socketIdx = rooms[roomId].findIndex(user => user == socket);
            rooms[roomId].splice(socketIdx, 1);
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