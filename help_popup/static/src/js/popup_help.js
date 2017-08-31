odoo.define('help_popup.help_button', function(require) {
    "use strict";

    var view_manager = require('web.ViewManager');
    var extended_manager = view_manager.include({

    start : function() {
        var self = this;
        var res = self._super();
        $('button.view_help').each(function() {
        var $elem = $(this);
        var advanced_help = self.action.advanced_help;
        var enduser_help = self.action.enduser_help;
        if (typeof self.action.id === "undefined" || (advanced_help.length === 0 || typeof advanced_help.length === "undefined" && $(enduser_help).text().length === 0)) {
            $('button.view_help').hide();
            $('ol.breadcrumb').css('width', '');
        } else {
            $('button.view_help').show()
            $('ol.breadcrumb').css('width', '44%');
        }
        $elem.on('click', function(e) {
            var params = 'height=650, width=800, location=no, ';
            params += 'resizable=yes, menubar=yes';
            var path = self.action.id;
            var my_window = window.open('/report/html/help_popup.tpl_help/' + path, 'Help', params);
            // allows to back to the window if opened previoulsy
            setTimeout(my_window.focus(), 1);
        });
        });
        return res;
    }
    });
});
