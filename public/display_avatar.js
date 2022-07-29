const socket = io('ws://localhost:5000', { transports: ['websocket'] })
let socketId

socket.on('init', (metaDataJSON) => {
    socketId = socket.id
    // Why JSON?
    // Read this: https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/5344074#5344074
    // Why reviver (defined below)?
    // Read this: https://stackoverflow.com/a/56150320/11342472
    const metaData = JSON.parse(metaDataJSON, reviver)
    console.log(metaData)

    metaData.usersData.forEach((data, id) => {
        if (id === socket.id) {
            const thisUserEl = document.getElementById('user')
            thisUserEl.setAttribute('id', id)
            thisUserEl.getAttribute('position').x = data.position.x
            thisUserEl.getAttribute('position').y = data.position.y
            thisUserEl.getAttribute('position').z = data.position.z

            // Rotate the camera to look at the center
            // Based on: https://stackoverflow.com/questions/62806316/how-to-look-to-objects-using-lookat-with-a-frame-camera-component-and-look-con
            // ***Error in Movement of Second User***
            thisUserEl.sceneEl.camera.lookAt(new THREE.Vector3(0, 0, 0))
        } else {
            const otherUserEl = document.createElement('a-entity')
            otherUserEl.setAttribute('id', id)
            otherUserEl.getAttribute('position').x = data.position.x
            otherUserEl.getAttribute('position').y = data.position.y
            otherUserEl.getAttribute('position').z = data.position.z
            console.log(otherUserEl.getAttribute('position'), data.position)
            otherUserEl.innerHTML = `
                <a-cylinder position="0 1 0" color="green" height="0.75" radius="0.75" shadow="receive: true; cast: true;"></a-cylinder>
                <a-cylinder position="0 1.875 0" color="blue" height="1" radius="0.75" shadow="receive: true; cast: true;"></a-cylinder>
                <a-sphere position="0 3 0" color="red" radius="0.5" shadow="receive: true; cast: true;"></a-sphere>
            `
            document.querySelector('a-scene').appendChild(otherUserEl)
        }
    })
})

socket.on('new user', (userDataJSON) => {
    const userData = JSON.parse(userDataJSON)
    const otherUserEl = document.createElement('a-entity')
    otherUserEl.setAttribute('id', userData.id)
    otherUserEl.getAttribute('position').x = userData.position.x
    otherUserEl.getAttribute('position').y = userData.position.y
    otherUserEl.getAttribute('position').z = userData.position.z
    otherUserEl.innerHTML = `
                <a-cylinder position="0 1 0" color="green" height="0.75" radius="0.75" shadow="receive: true; cast: true;"></a-cylinder>
                <a-cylinder position="0 1.875 0" color="blue" height="1" radius="0.75" shadow="receive: true; cast: true;"></a-cylinder>
                <a-sphere position="0 3 0" color="red" radius="0.5" shadow="receive: true; cast: true;"></a-sphere>
            `
    document.querySelector('a-scene').appendChild(otherUserEl)
})

document.addEventListener('keydown', () => {
    console.log(socketId, document.getElementById(socketId))
    socket.emit(
        'user movement update',
        document.getElementById(socketId).getAttribute('position')
    )
})

socket.on('user movement update', (userDataJSON) => {
    const userData = JSON.parse(userDataJSON)
    const otherUserEl = document.getElementById(userData.id)
    console.log('hit', userData.id, otherUserEl)
    otherUserEl.getAttribute('position').x = userData.position.x
    otherUserEl.getAttribute('position').y = userData.position.y
    otherUserEl.getAttribute('position').z = userData.position.z
})

// @desc    required for serializing maps in JSON parse
function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value)
        }
    }
    return value
}
