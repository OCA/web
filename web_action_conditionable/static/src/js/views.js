/*global openerp, _, $ */

openerp.web_action_conditionable = function (instance) {
  instance.web.View.include({
    is_action_enabled: function(action) {
      var attrs = this.fields_view.arch.attrs;
      if (action in attrs) {
	try {
	  data = JSON.parse(attrs[action]);
	  return data;
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
}
