/* 

   Copyright (C) 2013 Therp BV
   License: GNU AFFERO GENERAL PUBLIC LICENSE
            Version 3 or any later version

*/

openerp.web_url_target_new = function (openerp) {
    openerp.web.page.FieldUrlReadonly.include({

        set_value: function(value) {
            this._super(value);
            this.$element.find('a').attr('target', '_blank')
        },

    });
}
