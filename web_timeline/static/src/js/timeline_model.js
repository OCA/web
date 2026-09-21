odoo.define("web_timeline.TimelineModel", function (require) {
    "use strict";

    const AbstractModel = require("web.AbstractModel");

    const TimelineModel = AbstractModel.extend({
        init: function () {
            this._super.apply(this, arguments);
        },

        load: function (params) {
            this.modelName = params.modelName;
            this.fieldNames = params.fieldNames;
            this.default_group_by = params.default_group_by;
            if (!this.preload_def) {
                this.preload_def = $.Deferred();
                $.when(
                    this._rpc({
                        model: this.modelName,
                        method: "check_access_rights",
                        args: ["write", false],
                    }),
                    this._rpc({
                        model: this.modelName,
                        method: "check_access_rights",
                        args: ["unlink", false],
                    }),
                    this._rpc({
                        model: this.modelName,
                        method: "check_access_rights",
                        args: ["create", false],
                    })
                ).then((write, unlink, create) => {
                    this.write_right = write;
                    this.unlink_right = unlink;
                    this.create_right = create;
                    this.preload_def.resolve();
                });
            }

            this.data = {
                domain: params.domain,
                context: params.context,
            };

            return this.preload_def.then(this._loadTimeline.bind(this));
        },

        /**
         * Read the records for the timeline.
         *
         * @private
         * @returns {jQuery.Deferred}
         */
        _loadTimeline: function () {
            const groupByFields = this.default_group_by
                ? this.default_group_by.split(",")
                : [];
            const orderFields = groupByFields.map((group) => {
                // Handle the case where the group by is a field with a group operator
                // e.g. date:month. For ordering, Odoo expects the base field name.
                return {name: group.includes(":") ? group.split(":")[0] : group};
            });
            // For fields to read, Odoo expects the full specifier if it's a :operator group,
            // as this will be the key in the returned records.
            const fieldsToRead = _.uniq([...this.fieldNames, ...groupByFields]);

            return this._rpc({
                model: this.modelName,
                method: "search_read",
                kwargs: {
                    fields: fieldsToRead,
                    domain: this.data.domain,
                    order: orderFields,
                    context: this.data.context,
                },
            }).then((events) => {
                this.data.data = events;
                this.data.rights = {
                    unlink: this.unlink_right,
                    create: this.create_right,
                    write: this.write_right,
                };
            });
        },
    });

    return TimelineModel;
});
