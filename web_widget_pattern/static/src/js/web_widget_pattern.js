//-*- coding: utf-8 -*-
//© 2016 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_widget_pattern = function(instance)
{
    instance.web.form.FieldChar.include({
        is_syntax_valid: function()
        {
            if(this.options.pattern)
            {
                var val = this.$('input').val(),
                    regex = new RegExp(
                    this.options.pattern, this.options.pattern_modifiers || ''
                );
                if(!!val && !regex.test(this.$('input').val()))
                {
                    return false;
                }
            }
            return this._super.apply(this, arguments);
        },
    });
};
