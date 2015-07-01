openerp.one2many_multi_select_input = function(instance){
    openerp.web.FormView.include({
        view_loading: function(r){
           this._super(r);
           // var team_id = openerp.webclient.action_manager.inner_widget.views.form.controller.fields.team_id.get_value()
           var button = $('.multi_select')[0]
           if (! _.isUndefined(button)) {
              button.onclick = function(e){
                //if (! openerp.webclient.action_manager.inner_widget.views.form.controller.$el[0].className.contains('oe_form_editable')){
                //    return;
                //}   use the class oe_edit_only in the <a class='button multi_sn oe_edit_only' href='#'>Add SN...</a>
                e.preventDefault();
                e.stopPropagation();
                var _t = instance.web._t;
                var form = openerp.webclient.action_manager.inner_widget.views.form;
                var one2many_field = form.controller.fields.timesheet_ids;
                var team_id = openerp.webclient.action_manager.inner_widget.views.form.controller.fields.team_id.get_value()
                var self = openerp.webclient.action_manager.inner_widget.views.form.controller.fields.timesheet_ids.view
                pop = new instance.web.form.SelectCreatePopup(self);  //self as parent,should be list view instead of form
                pop.select_element(
                    'xxx_timesheet.open.sn',                             // model for multi select
                    {title: _t("Uncompleted Serial Number ") ,
                     no_create: true},                                    // hide the default create button
                     [['team_id', '=', team_id]],                         // default domain
                     {}                                                   // context
                );
                var self = this;                                          //
                pop.on("elements_selected", self, function(element_ids) {
                    var selected_records = []
                    pop.dataset.read_ids(element_ids,['sn','product_id','account_id','output_qty','name','sequence','std_time','amount']).then(function (records) {
                        var old_records = one2many_field.get_value();
                        // get the default date from previous input
                        var default_date = openerp.web.date_to_str(new Date());
                        if (! _.isUndefined(old_records)) {
                            count = old_records.length-1;
                            for ( var i = count; i>= 0; i--){
                                if (old_records[i][0] == 0){
                                    default_date = old_records[i][2]['date'];
                                    break;
                                }
                            }
                        }
                        _(records).each(function(record) {
                           record.date=default_date;
                           //record.general_account_id=13;
                           record.journal_id=3;
                           // many2one field returned as [1,'description'], only id needed
                           record.sn = record.sn[0];
                           record.product_id = record.product_id[0];
                           record.account_id = record.account_id[0];
                           record.user_id = openerp.session.uid;   // add missing required field, otherwise one2many field invalid error when save
                           record.is_va = true;
                           selected_records.push([0,false,record]);
                        })
                        var new_records = one2many_field.get_value().concat(selected_records)
                        one2many_field.set_value(new_records);
                    });
                });
              }
           }
        }
    })
};
