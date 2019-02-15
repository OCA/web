// Copyright 2019 Alexandre Díaz <dev@redneboa.es>
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
odoo.define('web_view_transitions.ViewManager', function (require) {
    "use strict";

    var ViewManager = require('web.ViewManager');
    var session = require('web.session');

    ViewManager.include({
        _display_view: function () {
            this._super.apply(this, arguments);

            if (this.active_view && session.view_transition_mode) {
                this.active_view.$fragment.addClass(
                    'o-view-transition-' + session.view_transition_mode);
            }
        },
    });

});
