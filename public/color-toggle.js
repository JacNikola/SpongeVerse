const socket = io()

AFRAME.registerComponent('color-toggle', {
    init: function () {
        let el = this.el
        this.toggleColor = function () {
            socket.emit('color-toggle', 'blue')
            el.setAttribute('color', 'blue')
        }

        socket.on('color-toggle', (arg) => {
            el.setAttribute('color', arg)
        })

        this.el.addEventListener('click', this.toggleColor)
    },
    remove: function () {
        this.el.removeEventListener('click', this.toggleColor)
    },
})
