AFRAME.registerComponent('tryon', {
    init: function () {
        console.log("tryon");
        let el = this.el
        this.tryon = function () {
            location.href = 'https://spongeverse.herokuapp.com/metaverse/try'
        }
        this.el.addEventListener('click', this.tryon)
    },
    remove: function () {
        this.el.removeEventListener('click', this.tryon)
    },
})
