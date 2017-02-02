odoo.define('horanet_web_search_with_and', function (require) {
    "use strict";

    var SearchView = require('web.SearchView');
    var Backbone = window.Backbone;

    SearchView.include({
        // Override the base method to detect a 'shift' event
        select_completion: function (e, ui) {
            if (e.shiftKey
                && ui.item.facet.values
                && ui.item.facet.values.length
                && String(ui.item.facet.values[0].value).trim() !== "") {
                // In case of an 'AND' search a new facet is added regarding of the previous facets
                e.preventDefault();

                this.query.add(ui.item.facet, {shiftKey: true});
            } else {

                return this._super.apply(this, arguments);
            }
        }
    });

    SearchView.SearchQuery.prototype = SearchView.SearchQuery.extend({
        // Override the odoo method to (conditionally) add a search facet even if a existing
        // facet for the same field/category already exists
        add: function (values, options) {
            options = options || {};
            if (options.shiftKey) {

                if (!values) {
                    values = [];
                }
                else if (!(values instanceof Array)) {
                    values = [values];
                }

                delete options.shiftKey;
                _(values).each(function (value) {
                    var model = this._prepareModel(value, options);
                    Backbone.Collection.prototype.add.call(this, model, options);
                }, this);

                return this;
            }
            else {
                return this.constructor.__super__.add.call(this, values, options);
            }
        }}).prototype;


});