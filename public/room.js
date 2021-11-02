let roomId = "";
let selfName = "";
let createRoom = false;
let socket;

let participantsList = {};

function addParticipant(participantName, participantId = "self"){
    let participantsWrapper = document.querySelector("#participants-wrapper");

    let participant = document.createElement("div");
    participant.classList.add("participant");
    let pAvatar = document.createElement("div");
    pAvatar.classList.add("p-avatar");
    let pName = document.createElement("div");
    pName.classList.add("p-name");

    pAvatar.innerHTML = participantName[0];
    pName.innerHTML = participantName;

    participant.append(pAvatar, pName);
    participantsWrapper.append(participant);

    participantsList[participantId] = participant;

}

function addMessage(msgData, bySelf = true, isStatus = false){

    let msgText = msgData['text'];

    let msgWrapper = document.createElement("div");
    msgWrapper.classList.add("msg-wrapper");
    if(isStatus){
        let statusMsg = document.createElement("div");
        statusMsg.className += "status-msg";
        statusMsg.innerHTML = msgText;
        msgWrapper.append(statusMsg);
    }else{

        let from = msgData['from'];
        let timestamp = msgData['timestamp'];

        let msgDiv = document.createElement("div");
        msgDiv.classList.add("msg");
        if (bySelf){

            // Msg Emitting event

            socket.emit("msg", { text: msgText, from: "You", timestamp: timestamp });

            msgDiv.classList.add("my-msg");
        }
        let msgFrom = document.createElement("div");
        msgFrom.classList.add("msg-from");
        let msgContent = document.createElement("div");
        msgContent.classList.add("msg-content");
        let msgTimestamp = document.createElement("div");
        msgTimestamp.classList.add("msg-timestamp");

        msgFrom.innerHTML = from;
        msgContent.innerHTML = msgText;
        msgTimestamp.innerHTML = getCurrentTimestamp(new Date(timestamp));

        msgDiv.append(msgFrom, msgContent, msgTimestamp);
        msgWrapper.append(msgDiv);
    }

    let messages = document.querySelector("#messages");
    messages.append(msgWrapper);

    messages.scrollTo({ left: 0, top: messages.scrollHeight, behavior: "smooth" }); // To scroll to the bottom msg.
}

function getCurrentTimestamp(date = new Date()){
    // let date = new Date();
    let hours = date.getHours();
    let hoursMod = hours % 12;
    return `${hoursMod < 10 ? "0" : ""}${hoursMod}:${date.getMinutes()} ${hours >= 12 ? "PM" : "AM"}`;
}

window.onload = function(){

    addParticipant("You");

    loadSessionValues();

    makeSocketConnections();

    loadTestData();

    let msgInput = document.querySelector("#msg-input-content");

    document.querySelector("#send-btn").addEventListener("click", (e) => {
        let msgText = msgInput.value;
        addMessage({ text: msgText, from: "You", timestamp: Date.now() });
        msgInput.value = "";
    });

    document.querySelector("#leave-btn").addEventListener("click", (e) => {
        socket.emit("leaveRoom", true);
        socket.disconnect();
        window.location.href = "/";
    });

    msgInput.addEventListener("keyup", (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            let msgText = msgInput.value;
            addMessage({ text: msgText, from: "You", timestamp: Date.now() });
            msgInput.value = "";
        }
    })

};

function loadSessionValues(){
    roomId = sessionStorage.getItem('roomId');
    createRoom = sessionStorage.getItem('createRoom');
    selfName = sessionStorage.getItem('name');

    console.log("From Session", [roomId, createRoom, selfName]);


    // Remove saved data from sessionStorage
    // sessionStorage.removeItem('key');

    // Remove all saved data from sessionStorage
    sessionStorage.clear();


}

function makeSocketConnections(){
    document.querySelector("#room-id").innerHTML = roomId;

    socket = io({
        query: {
            roomId,
            name: selfName,
            createRoom,
            partyUrl: ""
        }
    });

    socket.on("test", (data) => {
        console.log(data);
    });

    socket.on("roomData", (data) => {
        let users = data['users'];
        let partyUrl = data["partyUrl"];
        console.log("PU", partyUrl)
        for (userId in users){
            addParticipant(users[userId], userId)
        }
    });

    socket.on("userAdded", (data) => {
        for (userId in data) {
            addParticipant(data[userId], userId);
            addMessage({ text: `${data[userId]} Joined` }, false, true);
        }
    });

    socket.on("userLeft", (data) => {
        for (userId in data) {
            
            addMessage({ text: `${data[userId]} Left` }, false, true);
            participantsList[userId].remove();
            delete participantsList[userId];
        }
    });


    socket.on("msg", (data) => {
        // data["timestamp"] = getCurrentTimestamp(new Date(data["timestamp"]));
        addMessage(data, false)
    });

    socket.on("control", (data) => {
        console.log("control", data)
    });


}

function loadTestData(){
    return;
    addParticipant("You");
    addParticipant("Homer Simpson");
    addParticipant("Bart Simpson");

    addMessage({ text: "Hello Everyone", from: "You", timestamp: "09:23 PM" });
    addMessage({ text: "mmm...Helloo", from: "Homer Simpson", timestamp: "09:25 PM" }, false);
    addMessage({ text: "Bart Simpson Joined" }, false, true);
    addMessage({ text: "Ah Caramba", from: "Bart Simpson", timestamp: "09:26 PM" }, false);
    addMessage({ text: "D'Oh", from: "Homer Simpson", timestamp: "09:27 PM" }, false);
}