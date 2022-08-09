AFRAME.registerComponent('trypants', {
    init: function () {
        let el = this.el
        this.tryon = function () {
            location.href = 'https://spongeverse.herokuapp.com/metaverse/trypants'
        }
        this.el.addEventListener('click', this.tryon)
    },
    remove: function () {
        this.el.removeEventListener('click', this.tryon)
    },
})
