odoo.define('web_widget_many2many_tags_multi_selection.multiple_tags', function (require) {
    "use strict";

    var rel_fields = require('web.relational_fields');
    var dialogs = require('web.view_dialogs');
    var core = require('web.core');
    var _t = core._t;

    rel_fields.FieldMany2One.include({

        /**
         * @override
         */
        _searchCreatePopup: function(view, ids, context) {
            var self = this;

            // Don't include already selected instances in the search domain
            var domain = self.record.getDomain({fieldName: self.name});
            if (self.field.type === 'many2many') {
                var selected_ids = self._getSearchBlacklist();
                if (selected_ids.length > 0) {
                    domain.push(['id', 'not in', selected_ids]);
                }
            }

            return new dialogs.SelectCreateDialog(self, _.extend({}, self.nodeOptions, {
                res_model: self.field.relation,
                domain: domain,
                context: _.extend({}, self.record.getContext(self.recordParams), context || {}),
                title: (view === 'search' ? _t("Search: ") : _t("Create: ")) + self.string,
                initial_ids: ids ? _.map(ids, function(x) {return x[0];}) : undefined,
                initial_view: view,
                disable_multiple_selection: self.field.type !== 'many2many',
                on_selected: function(records) {
                    if (self.field.type !== 'many2many') {
                        self.reinitialize(records[0]);
                    } else {
                        self.reinitialize(records);
                    }
                    self.activate();
                }
            })).open();
        },
    });

    rel_fields.FieldMany2ManyTags.include({

        /**
         * Odoo destroy the one2many and all childrens.
         * So, we need recreate the 'create popup'.
         *
         * @override
         */
        _renderEdit: function () {
            var self = this;
            var need_modal = false;
            if (this.many2one) {
                var m2o_childrens = this.many2one.getChildren();
                need_modal = _.some(m2o_childrens, function (children) {
                    return 'dialogClass' in children;
                });
            }
            return this._super.apply(this, arguments).then(function () {
                if (need_modal) {
                    self.many2one._searchCreatePopup("form", false, self.many2one._createContext(""));
                }
            });
        },
    });
});
