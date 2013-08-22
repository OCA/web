/* 

   Copyright (C) 2013 Therp BV
   License: GNU AFFERO GENERAL PUBLIC LICENSE
            Version 3 or any later version

*/

openerp.web_confirm_window_close = function(openerp) {
    openerp.web.FormView.include({

        warning_on_close: function() {
            if (this.widget_parent && this.widget_parent.active_view == 'form' && this.$element.hasClass('oe_form_dirty')) {
                // Firefox will show a generic confirmation dialog
                // When any text is returned here.
                return openerp.web._t('You have unsaved data in this window. Do you really want to leave?');
            }
        },

        start: function() {
            res = this._super();
            if (!(this.embedded_view)) {
                $(window).bind('beforeunload', _.bind(
                    this.warning_on_close, this));
            }
            return res;
        }

    });
}
