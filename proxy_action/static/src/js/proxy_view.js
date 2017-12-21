'use strict';
odoo.define('proxy_action.proxy_view', function (require) {
    var ActionManager = require('web.ActionManager');

    ActionManager.include({
        ir_actions_act_proxy: function (action, options) {
            var self = this;

            action.action_list.forEach(function (task) {
                $.ajax({
                    url: task['url'],
                    type: 'POST',
                    data: JSON.stringify(task['params']),
                    contentType: 'application/json',
                }).done(function (result) {
                    console.log("Proxy action have been done with sucess", result);
                    //TODO add an UI feedback
                    self.ir_actions_act_window_close(action, options);
                }).fail(function (result) {
                    console.log('Proxy action have failed', result);
                    //TODO add an UI feedback
                    self.ir_actions_act_window_close(action, options);
                })
            })
            this.do_action({"type":"ir.actions.act_window_close"});
        }
    });
});
