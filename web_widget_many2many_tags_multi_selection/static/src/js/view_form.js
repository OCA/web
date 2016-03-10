odoo.define('web_widget_many2many_tags_multi_selection.multiple_tags', function (require) {
    "use strict";

    var FormCommon = require('web.form_common');
    var core = require('web.core');
    var data = require('web.data');
    var _t = core._t;

    FormCommon.CompletionFieldMixin._search_create_popup = function(view, ids, context) {
        var self = this;
        new FormCommon.SelectCreateDialog(this, {
            res_model: self.field.relation,
            domain: self.build_domain(),
            context: new data.CompoundContext(self.build_context(), context || {}),
            title: (view === 'search' ? _t("Search: ") : _t("Create: ")) + this.string,
            initial_ids: ids ? _.map(ids, function(x) {return x[0];}) : undefined,
            initial_view: view,
            disable_multiple_selection: this.field.type != 'many2many',
            on_selected: function(element_ids) {
                for(var i=0, len=element_ids.length; i<len;i++) {
                    self.add_id(element_ids[i]);
                    if (self.field.type != 'many2many') {
                        break;
                    }
                }
                self.focus();
            }
        }).open();
        var domain = self.build_domain();

        if (self.field.type == 'many2many') {
            var selected_ids = self.get_search_blacklist();
            if (selected_ids.length > 0) {
                domain = new data.CompoundDomain(domain, ["!", ["id", "in", selected_ids]]);
            }
        }

    }
});
