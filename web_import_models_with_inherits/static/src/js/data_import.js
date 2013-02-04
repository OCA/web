/* 

   Copyright (C) 2013 Therp BV
   License: GNU AFFERO GENERAL PUBLIC LICENSE
            Version 3 or any later version

 */
   
openerp.web_import_models_with_inherits = function(openerp) {
    openerp.web.DataImport = openerp.web.DataImport.extend({
        /* At widget start, tag on to the 'ready' queue with a function to
           add the model's _inherits fields to the list that contains all
           fields that need not be provided by the import file even if they
           have the 'required' attribute
        */
        start: function() {
            var self = this;
            this._super();
            this.ready.push(new openerp.web.DataSet(
                this, this.model, this.context).call(
                    'get_fields_inherits', [], function(fields) {
                        _.each(fields, function(val) {
                            self.fields_with_defaults.push(val);
                        });
                    }));
        },
    });
}
