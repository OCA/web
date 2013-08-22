/* 

   Copyright (C) 2013 Therp BV
   License: GNU AFFERO GENERAL PUBLIC LICENSE
            Version 3 or any later version

*/

openerp.web_confirm_window_close = function(openerp) {
	//3 essential differences between 6.1 and 7.0
	// - widget_parent replaced by ViewManager
	// - $element. replaced by $el
	// - $(window).bind replaced by $(window).on
    openerp.web.FormView.include({
        warning_on_close: function() {
            if (this.ViewManager 
            && this.ViewManager.active_view == 'form'
            && this.$el.hasClass('oe_form_dirty'))
        	// Firefox will show a generic confirmation dialog
            // When any text is returned here.
        	return openerp.web._t(
    			"You have unsaved data in this window. " +
    			"Do you really want to leave?");
        },
        
        start: function() {
            res = this._super();
            if (!(this.embedded_view)) {
                $(window).on("beforeunload", _.bind(
                    this.warning_on_close, this));
            }
            return res;
        }

    });
}
