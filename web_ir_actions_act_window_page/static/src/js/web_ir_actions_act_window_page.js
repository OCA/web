// coding: utf-8
// © 2013-2015 Therp BV (<http://therp.nl>)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)
odoo.define('web.ir_actions_act_window_page', function(require) {

    var ActionManager = require('web.ActionManager');
    ActionManager.include({
        ir_actions_act_window_page_prev: function(action, options)
        {
            if(this.inner_widget && this.inner_widget.active_view.type == 'form' &&
                this.inner_widget.active_view)
            {
                this.inner_widget.active_view.controller.pager.previous();
            }
            if(options && options.on_close)
            {
                options.on_close();
            }
        },
        ir_actions_act_window_page_next: function(action, options)
        {
            if(this.inner_widget && this.inner_widget.active_view.type == 'form' &&
                this.inner_widget.active_view)
            {
                this.inner_widget.active_view.controller.pager.next();
            }
            if(options && options.on_close)
            {
                options.on_close();
            }
        },
    });
});
