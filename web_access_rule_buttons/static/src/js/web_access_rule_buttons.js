/*
 * © 2016 Camptocamp SA
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)
 */
odoo.define('web_access_rule_buttons.main', function (require) {
  "use strict";

  var core = require('web.core');

  var FormView = require('web.FormView');
  var ListView = require('web.ListView');

  FormView.include({

    load_record: function() {
      var self = this;
      return this._super.apply(this, arguments)
        .then(function() {
          self.show_hide_buttons()
        });
    },

    show_hide_buttons: function() {
      var self = this;
      this.dataset.call('check_access_rule_all',
                        [[this.datarecord.id],
                         ['write']])
        .then(function(accesses) {
          self.show_hide_edit_button(accesses.write);
        });
    },

    show_hide_edit_button: function(access) {
      if (this.$buttons) {
          var button = this.$buttons.find('.oe_form_button_edit');
          if(button) {
            button.prop('disabled', !access);
          }
      }
    }

  });

});
