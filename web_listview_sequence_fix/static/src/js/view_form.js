openerp.web_listview_sequence_fix = function (instance) {

    instance.web.FormView.include({
        _process_save: function(save_obj) {
            var self = this;
            var to_ret = this._super(save_obj);
            if (self.fields_view.fields.sequence &&
                    self.fields_view.fields.sequence.type == 'integer' &&
                    self.dataset.cache) {
                _.each(self.dataset.cache, function(o, index) {
                    save_deferral = self.dataset.write(
                        o.id, {'sequence': index}).then(function(r) {
                            return self.record_saved(r);
                    }, null);
                });
            }
            return to_ret;
        }
    });
};
