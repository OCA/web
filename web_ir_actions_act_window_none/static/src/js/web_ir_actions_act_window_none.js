//-*- coding: utf-8 -*-
//?? 2016 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


odoo.define('web_ir_actions_act_window_none', function(require) {

var ActionManager = require('web.ActionManager');
    ActionManager.include({

    ir_actions_act_window_none: function(action)
            {
                if(action.reload === undefined || action.reload)
                {
                    if(this.dialog_widget && this.dialog_widget.views.form)
                    {
                        return this.dialog_widget.views.form.controller.reload();
                    }
                }
            },

    });

});
