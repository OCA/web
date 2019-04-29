odoo.define('web.fullscreen', function (require) {
    "use strict";

    var ControlPanel = require('web.ControlPanel');

    ControlPanel.include({
        start: function () {
            this._super.apply(this, arguments);
            this.$el.on('click', '.o_cp_fullscreen', function () {
                $("#oe_main_menu_navbar").toggle();
                $(".o_sub_menu").toggle();
                $(".o_main_navbar").toggle();
            });
        },
    });
    /* eslint require-jsdoc: 0*/
});

