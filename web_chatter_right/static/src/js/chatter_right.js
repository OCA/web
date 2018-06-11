odoo.define('web_chatter_right.Chatter', function (require) {
  'use strict';
  /*
   * Theme Chatter Right
   * GNU Public License
   * Alexandre Díaz <dev@redneboa.es>
   */

  var FormRenderer = require('web.FormRenderer');

  FormRenderer.include({

      _updateView: function ($newContent) {
          this._super.apply(this, arguments);
          var $chatter = this.$el.find('.oe_chatter');
          if (this.has_sheet && $chatter.length !== 0) {
              if ($chatter.css('visibility') === 'hidden'|| $chatter.css('display') === 'none') {
                  this.$el.find('.o_form_sheet_bg').removeClass("o_form_sheet_chatter_right");
              } else {
                  this.$el.find('.o_form_sheet_bg').addClass("o_form_sheet_chatter_right");
              }
          }
      },

  });

});
