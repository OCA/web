/*
 * Allow to bypass readonly fi the value is changed
 */

openerp.web_readonly_bypass = function(instance) {

    var QWeb = instance.web.qweb, _t = instance.web._t;
    /**
     * ignore readonly: place options['readonly_fields'] into the data
     * if nothing is specified into the context
     *
     * create mode: remove read-only keys having a 'false' value
     *
     * @param boolean mode: True case of create, false case of write
     * @param {Object} context->filter_out_readonly
     * @param {Object} data field values to possibly be updated
     * @param {Object} options Dictionary that can contain the following keys:
     *   - readonly_fields: Values from readonly fields to merge into the data object
     */
    function ignore_readonly(data, options, mode, context){
        if (options){
            if ('readonly_fields' in options && options['readonly_fields'] &&
                    !('filter_out_readonly' in context && context['filter_out_readonly'] == true )) {
                if(mode){
                    $.each( options.readonly_fields, function( key, value ) {
                        if(value==false){
                            delete(options.readonly_fields[key]);
                        }
                    });
                }
                data = $.extend(data,options['readonly_fields'])
            }
        }
    };

    instance.web.BufferedDataSet.include({

        init : function() {
            this._super.apply(this, arguments);
        },
        /**
         * Creates Overriding
         *
         * @param {Object} data field values to set on the new record
         * @param {Object} options Dictionary that can contain the following keys:
         *   - readonly_fields: Values from readonly fields that were updated by
         *     on_changes. Only used by the BufferedDataSet to make the o2m work correctly.
         * @returns super {$.Deferred}
         */
        create : function(data, options) {
            var self = this;
            ignore_readonly(data, options, true, self.context);
            return self._super(data,options);
        },
        /**
         * Creates Overriding
         *
         * @param {Object} data field values to set on the new record
         * @param {Object} options Dictionary that can contain the following keys:
         *   - readonly_fields: Values from readonly fields that were updated by
         *     on_changes. Only used by the BufferedDataSet to make the o2m work correctly.
         * @returns super {$.Deferred}
         */
        write : function(id, data, options) {
            var self = this;
            ignore_readonly(data, options, false, self.context);
            return self._super(id,data,options);
        },

    });

    instance.web.DataSet.include({
        /*
        BufferedDataSet: case of 'add an item' into a form view
        */
        init : function() {
            this._super.apply(this, arguments);
        },
        /**
         * Creates Overriding
         *
         * @param {Object} data field values to set on the new record
         * @param {Object} options Dictionary that can contain the following keys:
         *   - readonly_fields: Values from readonly fields that were updated by
         *     on_changes. Only used by the BufferedDataSet to make the o2m work correctly.
         * @returns super {$.Deferred}
         */
        create : function(data, options) {
            var self = this;
            ignore_readonly(data, options, true, self.context);
            return self._super(data,options);
        },
        /**
         * Creates Overriding
         *
         * @param {Object} data field values to set on the new record
         * @param {Object} options Dictionary that can contain the following keys:
         *   - readonly_fields: Values from readonly fields that were updated by
         *     on_changes. Only used by the BufferedDataSet to make the o2m work correctly.
         * @returns super {$.Deferred}
         */
        write : function(id, data, options) {
            var self = this;
            ignore_readonly(data, options, false, self.context);
            return self._super(id,data,options);
        },

    });
};
