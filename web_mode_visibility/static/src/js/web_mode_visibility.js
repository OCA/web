/* 

   Copyright (C) 2013 Therp BV
   License: GNU AFFERO GENERAL PUBLIC LICENSE
            Version 3 or any later version

*/

openerp.web_mode_visibility = function (openerp) {
    openerp.web.form.Field.include({

        init: function(view, node) {
            this._super(view, node);
            if (! this.invisible) {
                var options = this.get_definition_options();
                if (this.view.form_template == "PageView") {
                    this.invisible = options.page_invisible;
                }
                else if (this.view.form_template == "FormView") {
                    this.invisible = options.form_invisible;
                }
            }
        },

    });
}
