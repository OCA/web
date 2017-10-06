odoo.define('web_widget_form_reload.form_widget', function (require) {
"use strict";
var core = require('web.core');

var ActionManager = require('web.ActionManager');



ActionManager.include({

ir_actions_act_close_wizard_and_reload_view: function (action, options) {
        if (!this.dialog) {
            options.on_close();
        }
        this.dialog_stop();
        this.inner_widget.active_view.controller.reload();
        return $.when();
        },
    });
    
    
    
    
function FormReload(parent, action) {
    console.log('parentparentparent',parent);
    parent.inner_widget.active_view.controller.reload();
};
core.action_registry.add("form-reload", FormReload);

return FormReload;

});
