//-*- coding: utf-8 -*-
//© 2016 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_option_autocomplete = function(instance)
{
    instance.web.form.FieldChar.include({
        render_value: function()
        {
            var ret = this._super.apply(this, arguments);
            var autocomplete = this.options.autocomplete;
            if (autocomplete) {
                var input = this.$('input');
                input.attr('autocomplete', autocomplete);
            }
            return ret;
        },
    });
};
