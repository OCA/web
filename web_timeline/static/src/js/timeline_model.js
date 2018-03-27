odoo.define('web_timeline.TimelineModel', function (require) {
"use strict";

var AbstractModel = require('web.AbstractModel');

var TimelineModel = AbstractModel.extend({
    init: function () {
        this._super.apply(this, arguments);
    },

    load: function (params) {
        var self = this;
        this.modelName = params.modelName;
        this.fieldNames = params.fieldNames;
        // this.fieldsInfo = params.fieldsInfo;
        // this.mapping = params.mapping;
        // this.mode = params.mode;       // one of month, week or day
        // this.scales = params.scales;   // one of month, week or day
        //
        // // Check whether the date field is editable (i.e. if the events can be
        // // dragged and dropped)
        // this.editable = params.editable;
        // this.creatable = params.creatable;
        //
        // // display more button when there are too much event on one day
        // this.eventLimit = params.eventLimit;
        //
        // // fields to display color, e.g.: user_id.partner_id
        // this.fieldColor = params.fieldColor;
        if (!this.preload_def) {
            this.preload_def = $.Deferred();
            $.when(
                this._rpc({model: this.modelName, method: 'check_access_rights', args: ["write", false]}),
                this._rpc({model: this.modelName, method: 'check_access_rights', args: ["unlink", false]}),
                this._rpc({model: this.modelName, method: 'check_access_rights', args: ["create", false]}))
            .then(function (write, unlink, create) {
                self.write_right = write;
                self.unlink_right = unlink;
                self.create_right = create;
                self.preload_def.resolve();
            });
        }

        this.data = {
            domain: params.domain,
            context: params.context,
            // get in arch the filter to display in the sidebar and the field to read
            // filters: params.filters,
        };

        return this.preload_def.then(this._loadTimeline.bind(this));
    },

    _loadTimeline: function () {
        var self = this;
        return self._rpc({
                model: self.modelName,
                method: 'search_read',
                context: self.data.context,
                fields: self.fieldNames,
                domain: self.data.domain,
        })
        .then(function (events) {
            self.data.data = events;
            self.data.rights = {
                'unlink': self.unlink_right,
                'create': self.create_right,
                'write': self.write_right,
            };
        });
    },
});

return TimelineModel;
});
