odoo.define('web.web_action_conditionable', function (require) {
    "use strict";

    var View = require('web.View');

    View.include({
        is_action_enabled: function(action) {
            var attrs = this.fields_view.arch.attrs;
            if (action in attrs) {
                try {
                      return this._super(action);
                } catch(error) {
                      var expr = attrs[action];
                      var expression = py.parse(py.tokenize(expr));
                      var cxt = this.dataset.get_context().__eval_context.__contexts[1];
                      var result = py.evaluate(expression, cxt).toJSON();
                      return result
                }
            } else {
                return true;
            }
        }
    });
});
