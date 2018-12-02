odoo.define('web_keyboard_navigation.WebClient', function (require) {
    "use strict";

    var WebClient = require('web.WebClient');
    var KeyboardNavigationMixin = require(
        'web_keyboard_navigation.KeyboardNavigationMixin');

    return WebClient.include(KeyboardNavigationMixin, {
        events: _.extend(KeyboardNavigationMixin.events, {}),

        init: function (parent) {
            this._super(parent);
            KeyboardNavigationMixin.init.call(this);
        },
    });

});
