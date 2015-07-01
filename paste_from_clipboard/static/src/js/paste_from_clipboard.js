(function() {
    openerp.web.FormView.include({
        view_loading: function(r){
           this._super(r);
           var textarea = $('.textarea')[0];
           if (! _.isUndefined(textarea)) {
                self = this;
                paste = function(){
                    var rows = textarea.value.split(/[\r\n]+/g);
                    var fields = rows[0].split(String.fromCharCode(9));
                    var form = openerp.webclient.action_manager.inner_widget.views.form;
                    var one2many_field = $('.textarea')[0].name;
                    var fields_meta = form.controller.fields[one2many_field].field.views.tree.fields;
                    var model = form.controller.fields[one2many_field].field.relation
                    if (! _.isUndefined(fields_meta)){
                        var fields_count = fields.length;
                        var field = ''
                        for (var i=0; i<fields_count; i++){
                            field = fields[i]
                            if (! _.isUndefined(fields_meta[field])){
                               fields[i] = {'field': field,'type':fields_meta[field].type};
                               if (fields_meta[field].type==='many2one') {
                                    fields[i].relation = fields_meta[field].relation;
                               }
                            }
                            else{
                                alert('invalid field column name in header '+ field)
                                return;
                            }
                        }
                        rows = rows.splice(1);
                        var rows_count = rows.length;
                        if (rows_count === 0){
                            return;
                        }
                        var data = []
                        var row = []
                        for (var i=0; i<rows_count; i++){
                           row = rows[i].split(String.fromCharCode(9))
                           if (row.length === fields_count && row[0].length != 0 ){
                                data[i] = row
                           }
                        }
                        var all_fields = []
                        $.each(fields_meta,function(k,v)
                                        {all_fields.push(k)}
                                        )
                        fields_count = fields.length;
                        var import_fields = []
                        for (var i=0; i<fields_count; i++){
                            import_fields.push(fields[i].field);
                        }
                        hidden_fields=_.difference(all_fields, import_fields);
                        self.rpc('/paste_from_clipboard/get_records', {fields: fields,data:data,o2m_model:model,hidden_fields:hidden_fields}).then(function(records) {
                                        var form = openerp.webclient.action_manager.inner_widget.views.form;
                                        var one2many_field = form.controller.fields[$('.textarea')[0].name];
                                        var new_records = one2many_field.get_value().concat(records)
                                        one2many_field.set_value(new_records);
                                        $('.textarea')[0].value = '';
                                    })
                    }
                }
                textarea.onpaste = function() {
                    window.setTimeout(paste, 100);
                };
           }
        }
    })
}) ();
