/* 

   Copyright (C) 2013 Therp BV
   License: GNU AFFERO GENERAL PUBLIC LICENSE
            Version 3 or any later version

*/

openerp.web_mode_visibility = function (openerp) {
    openerp.web.form.Widget.include({
        init: function(view, node) {
            this._super(view, node);
            if (! this.invisible) {
                if (this.view.form_template == "PageView") {
                    this.invisible = (this.node.attrs.context &&
                                      this.node.attrs.context.page_invisible);
                }
                else if (this.view.form_template == "FormView") {
                    this.invisible = (this.node.attrs.context &&
                                      this.node.attrs.context.form_invisible);
                }
            }
        },
    });
}
