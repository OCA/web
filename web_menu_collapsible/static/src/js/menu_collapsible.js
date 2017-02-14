odoo.define('web_menu_collapsible.Menu', function(require) {
"use strict";
    var $ = require('$'),
        Menu = require('web.Menu');

    Menu.include({
        start: function() {
            var self = this;
            $(".oe_secondary_submenu").hide();
            $(".oe_secondary_menu_section").each(function() {
                if($(this).next().hasClass('oe_secondary_submenu')) {
                    $(this).unbind("click");
                    $(this).click(self.section_clicked);
                    $(this).addClass('oe_menu_toggler');
                }
            });
            return this._super.apply(this, arguments);
        },
        section_clicked: function() {
            $(this).toggleClass('oe_menu_opened').next().toggle();
        }
    });
});
