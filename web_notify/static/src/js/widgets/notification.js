odoo.define('web_notify.Notification', function (require) {
    "use strict";

    var Notification = require('web.Notification');

    Notification.include({
        init: function () {
            this._super.apply(this, arguments);
            // Delete default classes
            this.className = this.className.replace(' o_error', '');
            var addClass = 'o_' + this.type;
            if (this.type === 'success') {
                this.icon = 'fa-thumbs-up';
            } else if (this.type === 'danger') {
                this.icon = 'fa-exclamation-triangle';
            } else if (this.type === 'warning') {
                this.icon = 'fa-exclamation';
            } else if (this.type === 'info') {
                this.icon = 'fa-info';
            } else {
                this.icon = 'fa-lightbulb-o';
            }
            this.className += ' ' + addClass;
        },
    });

});
