openerp.web_advanced_search_wildcard = function(instance){
    var _lt = instance.web._lt;
    instance.web.search.ExtendedSearchProposition.Char.prototype.operators.push(
        {value: '=ilike', text: _lt("matches")}
    );
};
