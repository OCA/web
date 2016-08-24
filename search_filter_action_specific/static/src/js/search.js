/* Code mostly copied from web/static/src/js/search.js */
openerp.search_filter_action_specific = function(instance){
    var module = instance.web.search // loading the namespace of the 'sample' module

    module.CustomFilters.include({
        _action: function() {
            var p = this.getParent();
            // instance.web.ViewManagerAction is an ancestor of this widget
            //  and has an 'action' property
            while (p) {
                if (p.action && p.action.id) {
                    return p.action.id;
                }
                p = p.getParent();
            }
            return false;
        },
        start: function () {
            var self = this;
            this.model = new instance.web.Model('ir.filters');
            this.filters = {};
            this.$filters = {};
            this.view.query
                .on('remove', function (facet) {
                    if (!facet.get('is_custom_filter')) {
                        return;
                    }
                    self.clear_selection();
                })
                .on('reset', this.proxy('clear_selection'));
            this.$el.on('submit', 'form', this.proxy('save_current'));
            // make 'public' and 'default' two mutually exclusive options
            this.$el.on('click', '#oe_searchview_custom_public', function() {
                $('#oe_searchview_custom_default').prop('checked', false);
            });
            this.$el.on('click', '#oe_searchview_custom_default', function() {
                $('#oe_searchview_custom_public').prop('checked', false);
            });
            this.$el.on('click', 'h4', function () {
                self.$el.toggleClass('oe_opened');
            });
            return this.model.call('get_filters', [this.view.model, this._action()])
                .then(this.proxy('set_filters'))
                .done(function () { self.is_ready.resolve(); })
                .fail(function () { self.is_ready.reject.apply(self.is_ready, arguments); });
        },
        save_current: function () {
            var self = this;
            var $name = this.$('input:first');
            var private_filter = !this.$('#oe_searchview_custom_public').prop('checked');
            var action_only_filter = this.$('#oe_searchview_custom_action').prop('checked');
            var set_as_default = this.$('#oe_searchview_custom_default').prop('checked');
            if (_.isEmpty($name.val())){
                this.do_warn(_t("Error"), _t("Filter name is required."));
                return false;
            }
            var search = this.view.build_search_data();
            instance.web.pyeval.eval_domains_and_contexts({
                domains: search.domains,
                contexts: search.contexts,
                group_by_seq: search.groupbys || []
            }).done(function (results) {
                if (!_.isEmpty(results.group_by)) {
                    results.context.group_by = results.group_by;
                }
                // Don't save user_context keys in the custom filter, otherwise end
                // up with e.g. wrong uid or lang stored *and used in subsequent
                // reqs*
                var ctx = results.context;
                _(_.keys(instance.session.user_context)).each(function (key) {
                    delete ctx[key];
                });
                var filter = {
                    name: $name.val(),
                    user_id: private_filter ? instance.session.uid : false,
                    model_id: self.view.model,
                    context: results.context,
                    domain: results.domain,
                    is_default: set_as_default,
                    action_id: action_only_filter ? self._action() : false
                };
                // FIXME: current context?
                return self.model.call('create_or_replace', [filter]).done(function (id) {
                    filter.id = id;
                    self.append_filter(filter);
                    self.$el
                        .removeClass('oe_opened')
                        .find('form')[0].reset();
                });
            });
            return false;
        }
    });
};
