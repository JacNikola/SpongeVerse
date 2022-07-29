const socket = io({ transports: ['websocket'] })

socket.on('init', (metaDataJSON) => {
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
            thisUserEl.setAttribute('position', data.position)
            // Rotate the camera to look at the center
            // Based on: https://stackoverflow.com/questions/62806316/how-to-look-to-objects-using-lookat-with-a-frame-camera-component-and-look-con
            // ***Error in Movement of Second User***
            thisUserEl.sceneEl.camera.lookAt(new THREE.Vector3(0, 0, 0))
        } else {
            const otherUserEl = document.createElement('a-entity')
            otherUserEl.setAttribute('id', id)
            otherUserEl.setAttribute('position', data.position) // *** Set Attribute not setting position ***
            console.log(otherUserEl)
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
    otherUserEl.setAttribute('position', userData.position)
    otherUserEl.innerHTML = `
                <a-cylinder position="0 1 0" color="green" height="0.75" radius="0.75" shadow="receive: true; cast: true;"></a-cylinder>
                <a-cylinder position="0 1.875 0" color="blue" height="1" radius="0.75" shadow="receive: true; cast: true;"></a-cylinder>
                <a-sphere position="0 3 0" color="red" radius="0.5" shadow="receive: true; cast: true;"></a-sphere>
            `
    document.querySelector('a-scene').appendChild(otherUserEl)
})

document.addEventListener('keydown', () => {
    console.log(document.getElementById(socket.id))
    // socket.emit(
    //     'user movement update',
    //     document.getElementById(socket.id).position
    // )
})

socket.on('user movement update', (userDataJSON) => {
    const userData = JSON.parse(userDataJSON)
    const otherUserEl = document.getElementById(userData.id)
    otherUserEl.position = userData.position
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
