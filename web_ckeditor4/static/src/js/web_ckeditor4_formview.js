odoo.define('web_ckeditor4.FormView', function(require) {
  "use strict";

  var core = require('web.core');
  var FormView = core.view_registry.get('form');

  FormView.include({

    can_be_discarded: function(message) {
      var self = this;
      var res = this._super().done(function() {
        // if form can be discarded
        // we want to destroy all ck4 editor instances
        for(name in CKEDITOR.instances){
          if (self.fields.hasOwnProperty(name)){
            self.fields[name].destroy_content();
          }
        }
      });
      return res;
    }

  });

});
