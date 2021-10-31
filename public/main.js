async function monitorRoomCodeInput(roomId) {
    // let roomId = e.target.value;
    if(roomId.length < 6) return;
    // e.target.value = "";
    // let sessionStorage = window.sessionStorage;

    if(userNameInput.value.length == 0){
        userNameInput.style["border"] = "2px solid rgb(255 141 141)";
        return;
    }

    let roomStatus = await fetch(`/joinRoom/${roomId}`).then(res => {return res.json()}).then(res => {return res['status']})
    if(!roomStatus){
        console.log("No Room is there")
        return;
    }

    sessionStorage.setItem('roomId', roomId);
    sessionStorage.setItem('createRoom', false);
    sessionStorage.setItem('name', document.querySelector("#user-name").value);
    window.location.href = "room.html";

}

let roomCodeInput, userNameInput;

window.onload = function(){
    roomCodeInput = document.querySelector('#room-id');
    userNameInput = document.querySelector('#user-name');
    roomCodeInput.addEventListener('input', () => {monitorRoomCodeInput(roomCodeInput.value)});


    document.querySelector("#join-arrow").addEventListener("click", () => {

        if (roomCodeInput.value.length != 6) {
            roomCodeInput.style["border"] = "2px solid rgb(255 141 141)";
        }else{
            roomCodeInput.style["border"] = "none";
            roomCodeInput.style["border"] = "2px solid white";
        }

        if (userNameInput.value.length == 0) {
            userNameInput.style["border"] = "2px solid rgb(255 141 141)";
        } else {
            userNameInput.style["border"] = "none";
            userNameInput.style["border"] = "2px solid white";
        }

        monitorRoomCodeInput(roomCodeInput.value)
    });

    document.querySelector("#create-room-btn").addEventListener("click", async() => {
        let roomIdResponse = await fetch("createRoom").then(res => {return res.json()});
        let roomId = roomIdResponse['roomId'];

        sessionStorage.setItem('roomId', roomId);
        sessionStorage.setItem('createRoom', true);
        sessionStorage.setItem('name', document.querySelector("#user-name").value);
        window.location.href = "room.html";
    });
}