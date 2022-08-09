AFRAME.registerComponent('tryshoes', {
    init: function () {
        let el = this.el
        this.tryon = function () {
            location.href = 'https://spongeverse.herokuapp.com/metaverse/tryshoes'
        }
        this.el.addEventListener('click', this.tryon)
    },
    remove: function () {
        this.el.removeEventListener('click', this.tryon)
    },
})
