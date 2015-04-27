openerp.web_search_with_and = function (instance) {

    instance.web.SearchView =  instance.web.SearchView.extend({
        select_completion: function (e, ui) {
            var self = this;
            if (e.shiftKey) {
                e.preventDefault();

                var input_index = _(this.input_subviews).indexOf(
                    this.subviewForRoot(
                        this.$('div.oe_searchview_input:focus')[0]));
                this.query.add(ui.item.facet, {at: input_index / 2, shiftKey: true});
            } else {
                this._super(e, ui);
            }
        },
    });

    instance.web.search.SearchQuery = instance.web.search.SearchQuery.extend({
        add: function (values, options) {

            options = options || {};

            if (!values) {
                values = [];
            } else if (!(values instanceof Array)) {
                values = [values];
            }

            if (options.shiftKey) {
                delete options.shiftKey;
                _(values).each(function (value) {
                    var model = this._prepareModel(value, options);
                    Backbone.Collection.prototype.add.call(this, model, options);
                }, this);
                return this;
            }
            else {
                return this.constructor.__super__.add.apply(this, arguments);
            }
        },
    });
};
