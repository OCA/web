odoo.define('web_form_sidebar_hide_attachment.Sidebar', function (require) {
    "use strict";

    var Sidebar = require('web.Sidebar');

    Sidebar.include({

        init: function() {
            var self = this;
            self._super.apply(self, arguments);
            if (!self.get_use_attachment_sidebar()) {
                self.remove_attachment_sidebar();
            }
        },

        get_use_attachment_sidebar: function() {
            var self = this;
            var view = self.getParent();
            var fields_view = view.fields_view;
            var use_sidebar = true;
            if(fields_view && fields_view.type === 'form') {
                use_sidebar = view.is_action_enabled('attachment_sidebar');
            }
            return use_sidebar;
        },

        remove_attachment_sidebar: function() {
            var self = this;
            var sections = self.sections;
            self.sections = _.without(sections, _.findWhere(sections, {
                name: 'files',
            }));
        }

    });

});