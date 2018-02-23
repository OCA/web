// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

odoo.define('web_ir_actions_act_multi.ir_actions_act_multi', function (require) {
"use strict";

    var ActionManager = require('web.ActionManager');

    ActionManager.include({

        execute_ir_actions_act_multi: function(actions, options, index){
            var self = this;

            if (index >= actions.length){
                return actions[actions.length-1];
            }

            return self.do_action(actions[index],options)
                .then(function(){
                    index++;
                    return self.execute_ir_actions_act_multi(actions, options, index);
                });
        },

        ir_actions_act_multi: function(action, options){
            return this.execute_ir_actions_act_multi(action.actions, options, 0);
        },

    });

});
