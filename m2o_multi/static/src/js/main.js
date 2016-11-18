odoo.define('m2o_multi', function (require) {
    "use strict";
    var core = require('web.core');
    var form_common = require('web.form_common');
    var form_relational= require('web.form_relational')
    var data = require('web.data');
    var _t = core._t;

    form_relational.FieldMany2One.include({
        _search_create_popup: function(view, ids, context){
            var self = this;            
            if (self.field.__attrs.multi_select === undefined){
                this._super(view, ids, context);
            }
            else {
                var values = self.view.dataset.x2m.viewmanager.active_view.controller.editor.form._get_onchange_values();
                var onchange_specs = self.view.dataset.x2m.viewmanager.active_view.controller.editor.form._onchange_specs;
                context =  new data.CompoundContext(self.view.dataset.get_context());
                if (self.view.dataset.parent_view) {
                        var parent_name = self.view.dataset.parent_view.get_field_desc(self.view.dataset.child_name).relation_field;
                        context.add({field_parent: parent_name});
                    }
                var def = $.when({});
                new form_common.SelectCreateDialog(this, _.extend({}, (this.options || {}), {
                    res_model: self.field.relation,
                    domain: self.build_domain(),
                    context: new data.CompoundContext(self.build_context(), context || {}),                    
                    title: (view === 'search' ? _t("Search: ") : _t("Create: ")) + this.string,
                    initial_ids: ids ? _.map(ids, function(x) {return x[0];}) : undefined,
                    initial_view: view,
                    disable_multiple_selection: false,                    
                    on_selected: function(element_ids) {
                         if (element_ids.length == 1 ){
                             self.add_id(element_ids[0]);
                             self.focus();             
                         }                             
                         else {
                             var promises = [];
                             _.each(element_ids, function(element_id) {
                                values[self.name] = element_id;
                                values['sequence'] = 10;
                                values['id'] = false;                                
                                 def = self.alive(self.view.dataset.call('onchange', [[], values, self.name, onchange_specs, context]))    ;
                                 def.done(function(response) {
                                     response.value[self.name] = element_id;
                                     self.view.dataset.x2m.data_create(response.value);
                                    });                                                                                                              
                                 promises.push(def);
                             });                                                             
                            $.when.apply(null, promises).done(function(results){
                                self.view.dataset.x2m.internal_set_value(self.view.dataset.x2m.dataset.ids);
                                self.view.dataset.x2m.reload_current_view();
                            });   
                        }
                    },
                })).open();
            }
        },        
    });
})
