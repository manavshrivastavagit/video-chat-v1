const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const showTimer = document.querySelector("#showTimer");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
myVideo.volume = 0;

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name");
const startTime = new Date();
elapsedTimeIntervalRef = setInterval(() => {
  // Compute the elapsed time & display
  showTimer.innerText = timeAndDateHandling.getElapsedTime(startTime); //pass the actual record start time
}, 1000);

// Clear interval
// if (typeof elapsedTimeIntervalRef !== "undefined") {
//   clearInterval(elapsedTimeIntervalRef);
//   elapsedTimeIntervalRef = undefined;
// }

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;
var videoDevices = [0, 0];
var isFrontCameraAvailable = true;
var isBackCameraAvailable = false;
var mainCamera = "front";
var constraints = { audio: true, video: true };
navigator.mediaDevices
  .enumerateDevices()
  .then((devices) => {
    var videoDeviceIndex = 0;
    devices.forEach(function (device) {
      console.log(
        device.kind + ": " + device.label + " id = " + device.deviceId
      );
      if (device.kind == "videoinput") {
        videoDevices[videoDeviceIndex++] = device.deviceId;
      }
    });
    console.log(videoDevices);
    alert(videoDevices);
    // alert(videoDevices.length);
    if (videoDevices[1] != 0) {
      isBackCameraAvailable = true;
      alert('BackCameraAvailable');
    }
    console.log(constraints);
    alert(JSON.stringify(constraints));
    return navigator.mediaDevices.getUserMedia(constraints);
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, myVideoStream);
  });

peer.on("call", (call) => {
  call.answer(myVideoStream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
});

socket.on("user-connected", (userId) => {
  connectToNewUser(userId, stream);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  // if (window.webkitURL) {
  //   video.src = URL.createObjectURL(stream);
  //   myVideoStream = stream;
  // }
  if (video.mozSrcObject !== undefined) {
    video.mozSrcObject = stream;
  } else if (video.srcObject !== undefined) {
    video.srcObject = stream;
  } else {
    video.src = stream;
  }
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");
let endCall = document.getElementById("endCall");
let changeCamera = document.getElementById("changeCamera");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

endCall.addEventListener("click", (e) => {
  myVideoStream.getAudioTracks()[0].enabled = false;
  myVideoStream.getVideoTracks()[0].enabled = false;
  peer.disconnect();
  // window.open(window.location.href, '_blank');
  location.reload();
});

changeCamera.addEventListener("click", (e) => {
  alert(isBackCameraAvailable);
  if (isBackCameraAvailable) {
    mainCamera = mainCamera == "front" ? "back" : "front";
  } else {
    mainCamera = "front";
  }
  alert(mainCamera);
  console.log(videoDevices);
  alert(videoDevices);
  const videoDeviceIndex = mainCamera == "front" ? 0 : 1;
  alert(videoDeviceIndex);
  constraints = {
    // width: { min: 1024, ideal: 1280, max: 1920 },
    // height: { min: 776, ideal: 720, max: 1080 },
    audio: true,
    video: true,
    deviceId: { exact: videoDevices[videoDeviceIndex] },
  };
  console.log(constraints);
  alert(JSON.stringify(constraints));
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      myVideoStream = stream;
      addVideoStream(myVideo, stream);
    })
    .catch((e) => console.log("unable to change main camera"));
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});
