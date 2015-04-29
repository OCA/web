openerp.web_completion_search = function(instance, local) {
    var _t = instance.web._t;

    instance.web.form.CompletionFieldMixin._search_create_popup = function(view, ids, context) {
        var self = this;
        var pop = new instance.web.form.SelectCreatePopup(this);
        var domain = self.build_domain();

        if (self.field.type == 'many2many') {
            var selected_ids =self.get_search_blacklist();
            if (selected_ids.length > 0) {
                domain = new instance.web.CompoundDomain(domain, ["!", ["id", "in", selected_ids]]);
            }
        }

        pop.select_element(
            self.field.relation,
            {
                title: (view === 'search' ? _t("Search: ") : _t("Create: ")) + this.string,
                initial_ids: ids ? _.map(ids, function(x) {return x[0];}) : undefined,
                initial_view: view,
                disable_multiple_selection: this.field.type != 'many2many',
            },
            domain,
            new instance.web.CompoundContext(self.build_context(), context || {})
        );
        pop.on("elements_selected", self, function(element_ids) {
            for(var i=0, len=element_ids.length; i<len;i++) {
                self.add_id(element_ids[i]);
                if (self.field.type != 'many2many') {
                    break;
                }
            }
            self.focus();
        });
    };
}
