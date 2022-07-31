const socket = io({ transports: ["websocket"] });
let socketId;

socket.on("init", (metaDataJSON) => {
  socketId = socket.id;
  // Why JSON?
  // Read this: https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/5344074#5344074
  // Why reviver (defined below)?
  // Read this: https://stackoverflow.com/a/56150320/11342472
  const metaData = JSON.parse(metaDataJSON, reviver);
  console.log(metaData);

  metaData.usersData.forEach((data, id) => {
    if (id === socket.id) {
      const thisUserEl = document.getElementById("user");
      thisUserEl.setAttribute("id", id);
      thisUserEl.getAttribute("position").x = data.position.x;
      thisUserEl.getAttribute("position").y = data.position.y;
      thisUserEl.getAttribute("position").z = data.position.z;

      // Center the camera to look at the center
      // *** Will implement later ***
    } else {
      const otherUserEl = document.createElement("a-entity");
      otherUserEl.setAttribute("id", id);
      otherUserEl.getAttribute("position").x = data.position.x;
      otherUserEl.getAttribute("position").y = data.position.y;
      otherUserEl.getAttribute("position").z = data.position.z;
      otherUserEl.object3D.rotation.set( 
        THREE.Math.degToRad(0),
        THREE.Math.degToRad(180),
        THREE.Math.degToRad(0),    
      );
      otherUserEl.innerHTML = `
          <a-entity position="0 -1 0" gltf-model="#model" scale="3 3 3"></a-entity>
            `;
      document.querySelector("a-scene").appendChild(otherUserEl);
    }
  });
});


socket.on("new user", (userDataJSON) => {
  const userData = JSON.parse(userDataJSON);
  const otherUserEl = document.createElement("a-entity");
  otherUserEl.setAttribute("id", userData.id);
  otherUserEl.getAttribute("position").x = userData.position.x;
  otherUserEl.getAttribute("position").y = userData.position.y;
  otherUserEl.getAttribute("position").z = userData.position.z;
  otherUserEl.object3D.rotation.set( 
    THREE.Math.degToRad(0),
    THREE.Math.degToRad(180),
    THREE.Math.degToRad(0),    
  );
   otherUserEl.innerHTML = `
  <a-entity position="0 -1 0" gltf-model="#model" scale="3 3 3"></a-entity>
            `;
  document.querySelector("a-scene").appendChild(otherUserEl);
});


socket.on("user disconnected", (disconnectedUser) => {
  document.getElementById(disconnectedUser).remove();
});

document.addEventListener("keydown", () => {
  let userGlobalPosition = document
    .getElementById(socketId)
    .getAttribute("position");

  let cameraRelativePosition = document
    .getElementById("camera")
    .getAttribute("position");

  let updatedPosition = {
    x: userGlobalPosition.x + cameraRelativePosition.x,
    y: userGlobalPosition.y,
    z: userGlobalPosition.z + cameraRelativePosition.z,
  };

  socket.emit("user movement update", updatedPosition);
});

socket.on("user movement update", (userDataJSON) => {
  const userData = JSON.parse(userDataJSON);
  const userEl = document.getElementById(userData.id);
  userEl.getAttribute("position").x = userData.position.x;
  userEl.getAttribute("position").y = userData.position.y;
  userEl.getAttribute("position").z = userData.position.z;
});

document.addEventListener("mousemove", () => {
  let cameraRelativeRotation = document
    .getElementById("camera")
    .getAttribute("rotation");

  socket.emit("user rotation update", cameraRelativeRotation);
});


socket.on("user rotation update", (userDataJSON) => {
  const userData = JSON.parse(userDataJSON);
  const userEl = document.getElementById(userData.id).querySelector('a-entity');
  // Why not rotating using getAttribute? 
  // Ans: Because it's less recommended in the aframe documentation
  // https://aframe.io/docs/1.3.0/components/rotation.html#sidebar
  userEl.object3D.rotation.set( 
    THREE.Math.degToRad(0),
    THREE.Math.degToRad(userData.rotation.y),
    THREE.Math.degToRad(0),    
  );
  console.log("Log: ", userData.rotation, userEl.getAttribute('rotation'))
});


// @desc    required for serializing maps in JSON parse
function reviver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}
