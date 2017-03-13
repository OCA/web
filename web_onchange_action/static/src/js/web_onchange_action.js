//-*- coding: utf-8 -*-
//© 2017 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_onchange_action = function(instance)
{
    instance.web.FormView.include({
        on_processed_onchange: function(result)
        {
            var self = this,
                action = null;
            if(result.warning && result.warning.action)
            {
                action = result.warning.action;
                delete result.warning;
            }
            return jQuery.when(this._super.apply(this, arguments))
            .then(function()
            {
                if(action)
                {
                    self.do_action(action);
                }
            });
        },
    });
};
