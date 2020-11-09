odoo.define("web_search_with_and", function(require) {
    "use strict";

    var searchBarAutocompleteRegistry = require("web.search_bar_autocomplete_sources_registry");
    var SearchBar = require("web.SearchBar");

    SearchBar.include({
        // Override the base method to detect a "shift" event
        _onAutoCompleteSelected: function(e, ui) {
            var values = ui.item.facet.values;
            if (
                e.shiftKey &&
                values &&
                values.length &&
                String(values[0].value).trim() !== ""
            ) {
                // In case of an "AND" search a new facet is added regarding of
                // the previous facets
                e.preventDefault();
                var filter = ui.item.facet.filter;
                var field = this.fields[filter.attrs.name];
                var Obj = searchBarAutocompleteRegistry.getAny([
                    filter.attrs.widget,
                    field.type,
                ]);
                var obj = new Obj(this, filter, field, this.actionContext);
                var new_filter = Object.assign({}, ui.item.facet.filter, {
                    domain: obj.getDomain(values),
                    autoCompleteValues: values,
                });
                this.trigger_up("new_filters", {
                    filters: [new_filter],
                });
            } else {
                return this._super.apply(this, arguments);
            }
        },
    });
});
