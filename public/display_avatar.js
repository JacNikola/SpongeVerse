function getAvatar() {
    const user = document.createElement('a-sphere')
    user.setAttribute('radius', '1.25')
    user.setAttribute('position', '5 2 0')
    user.setAttribute('color', '#EF2D5E')
    user.setAttribute('wireframe', 'true')
    document.body.querySelector('#add-users').appendChild(user)
}

socket.on('hello', (arg) => {
    console.log(arg)
    getAvatar()
})
