AFRAME.registerComponent('exit-tryon', {
    init: function () {
        let el = this.el
        this.exit = function () {
            location.href = 'http://localhost:5000/metaverse'
        }
        this.el.addEventListener('click', this.exit)
    },
    remove: function () {
        this.el.removeEventListener('click', this.exit)
    },
})