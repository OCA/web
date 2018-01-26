// Copyright (C) 2018 DynApps <http://www.dynapps.be>
// @author Stefan Rijnhart <stefan@opener.amsterdam>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
openerp.web_copy_confirm = function(instance) {
    instance.web.FormView.include({
        on_button_duplicate: function() {
            var self = this;
            this.has_been_loaded.done(function() {
                if (confirm(_t("Do you really want to copy this record?"))) {
                    return self._super.apply(self, arguments);
                }
            });
        }
    });
};
