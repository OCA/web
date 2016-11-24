/* 

   Copyright (C) 2013 Therp BV
   License: GNU AFFERO GENERAL PUBLIC LICENSE
            Version 3 or any later version

*/

openerp.web_confirm_window_close = function(instance) {

    instance.web.FormView.include({
        init: function(parent, dataset, view_id, options) {
            res = this._super(parent, dataset, view_id, options);
            instance.web.bus.on('report_uncommitted_changes', this, function(e) {
                if (this.$el.is('.oe_form_dirty')) {
                    e.preventDefault();
                }
            });
            return res;
        }
    }),
    
    instance.web.WebClient.include({
        warning_on_close: function() {
            var $e = $.Event('report_uncommitted_changes');
            instance.web.bus.trigger('report_uncommitted_changes', $e);
            if ($e.isDefaultPrevented()) {
        	return instance.web._t(
    		    "You have unsaved data in this window. " +
    			"Do you really want to leave?");
            }
        },

        start: function() {
            res = this._super();
            $(window).on("beforeunload", _.bind(
                this.warning_on_close, this));
            return res;
        }

    });
}
