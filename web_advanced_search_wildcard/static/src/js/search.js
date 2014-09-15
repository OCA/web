openerp.search_enhanced_operators = function(instance){
    var _lt = instance.web._lt;
    instance.web.search.ExtendedSearchProposition.Char.prototype.operators.push(
        {value: '=ilike', text: _lt("matches")}
    );
};
