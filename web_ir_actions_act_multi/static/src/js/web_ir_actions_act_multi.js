// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// Copyright 2018 Brainbean Apps <hello@brainbeanapps.com>
// Copyright 2020 OpenSynergy Indonesia
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

openerp.web_ir_actions_act_multi = function(instance)
{
    'use strict';
    instance.web.ActionManager.include({
       ir_actions_act_multi: function(action, options)
       {
           if(this.inner_widget && this.inner_widget.active_view == 'form' &&
               this.inner_widget.views[this.inner_widget.active_view])
           {
               this._executeMultiAction(action, options);
           }
           if(options && options.on_close)
           {
               options.on_close();
           }
       },
       _handleAction: function (action, options) {
           if (action.type === 'ir.actions.act_multi') {
               return this._executeMultiAction(action, options);
           }

           return this.do_action(action);
       },
       _executeMultiAction: function(action, options, index) {
         var self = this;
         if (index === undefined) {
             index = 0;
         }
         if (index === action.actions.length - 1) {
             return this._handleAction(action.actions[index], options);
         } else if (index >= action.actions.length) {
             return $.when();
         }

         return this
             ._handleAction(action.actions[index], options)
             .then(function () {
                 return self._executeMultiAction(action, options, index + 1);
             });
       },
    });
}
