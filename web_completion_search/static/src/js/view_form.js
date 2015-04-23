openerp.web_completion_search = function(instance, local) {
    var _t = instance.web._t;


    instance.web.form.CompletionFieldMixin.init = function() {
        if (this.field.type == 'many2many') {
            this.limit = 0;
        } else {
            this.limit = 7;
        }
        this.orderer = new instance.web.DropMisordered();
    };

    instance.web.form.CompletionFieldMixin._search_create_popup = function(view, ids, context) {
        var self = this;
        var pop = new instance.web.form.SelectCreatePopup(this);
        pop.select_element(
            self.field.relation,
            {
                title: (view === 'search' ? _t("Search: ") : _t("Create: ")) + this.string,
                initial_ids: ids ? _.map(ids, function(x) {return x[0];}) : undefined,
                initial_view: view,
                disable_multiple_selection: this.field.type != 'many2many',
            },
            self.build_domain(),
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
