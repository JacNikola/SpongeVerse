AFRAME.registerComponent('logout', {
    init: function () {
        let el = this.el
        this.logout = function () {
            location.href = 'http://spongeverse.herokuapp.com/auth/logout'
        }
        this.el.addEventListener('click', this.logout)
    },
    remove: function () {
        this.el.removeEventListener('click', this.logout)
    },
})
