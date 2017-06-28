"use strict";

(function() {

var instance = openerp;
var _t = instance.web._t;
var _lt = instance.web._lt;

instance.web.search.ExtendedSearchProposition.Char.include({
    get_domain: function (field, operator) {
    	if (operator.value == '=ilike') 
    		return this.make_domain(field.name, operator.value, this.get_value() + '%');
    	return this._super(field, operator);
    },
});

instance.web.search.ExtendedSearchProposition.Char.prototype.operators.push(
    {value: "=ilike", text: _lt("starts with")}
);

})();