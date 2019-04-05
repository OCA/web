odoo.define('web_notify.Notification', function (require) {
    "use strict";

    var Notification = require('web.Notification');

    Notification.include({
        icon_mapping: {
            'success': 'fa-thumbs-up',
            'danger': 'fa-exclamation-triangle',
            'warning': 'fa-exclamation',
            'info': 'fa-info',
            'default': 'fa-lightbulb-o',
        },
        init: function () {
            this._super.apply(this, arguments);
            // Delete default classes
            this.className = this.className.replace(' o_error', '');
            // Add custom icon and custom class
            this.icon = (this.type in this.icon_mapping) ?
                this.icon_mapping[this.type] :
                this.icon_mapping['default'];
            this.className += ' o_' + this.type;
        },
    });

});
