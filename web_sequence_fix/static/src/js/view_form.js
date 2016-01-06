openerp.web_sequence_fix = function (instance) {

    instance.web.FormView.include({
        load_defaults: function () {
            var self = this;
            var keys = _.keys(this.fields_view.fields);
            if (_.contains(keys, 'sequence') && this.fields_view.fields['sequence'].type == 'integer') {
                var parent = this.ViewManager.getParent();
                if (parent !== undefined &&
                        parent.records !== undefined &&
                        parent.records.records !== undefined) {
                    var records = parent.dataset.cache;
                    var default_sequence = 1;
                    if (records.length > 0) {
                        var fnct = _.max;
                        var incremental = 1;
                        if (parent.editable() == 'top' && records.length > 1) {
                            fnct = _.min;
                            incremental = -1;
                        }
                        var element = fnct(records, function(o){
                            return o.values.sequence;
                        });
                        default_sequence = element.values.sequence + incremental;
                    }
                    var options = {};
                    options['context'] = {'default_sequence': default_sequence}
                    return this.dataset.default_get(keys, options).then(function(r) {
                        self.trigger('load_record', r);
                    });
                }
            }
            return this._super();
        }
    });
};
