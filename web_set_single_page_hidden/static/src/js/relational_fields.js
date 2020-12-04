odoo.define("web_set_single_page_hidden.relational_fields", function (require) {
    "use strict";

    var relational_fields = require("web.relational_fields");
    var FieldOne2Many = relational_fields.FieldOne2Many,
        FieldMany2Many = relational_fields.FieldMany2Many;

    FieldOne2Many.include({
        start: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                if (!_.isUndefined(self.pager)) {
                    self.pager.set_single_page_hidden(false);
                }
            });
        },
    });

    FieldMany2Many.include({
        start: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                if (!_.isUndefined(self.pager)) {
                    self.pager.set_single_page_hidden(false);
                }
            });
        },
    });
});
