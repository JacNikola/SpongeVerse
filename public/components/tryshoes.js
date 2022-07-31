AFRAME.registerComponent('tryshoes', {
    init: function () {
        let el = this.el
        this.tryon = function () {
            location.href = 'http://localhost:5000/metaverse/tryshoes'
        }
        this.el.addEventListener('click', this.tryon)
    },
    remove: function () {
        this.el.removeEventListener('click', this.tryon)
    },
})
