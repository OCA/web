/* Copyright 2017 Onestein
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_listview_invert_selection", function (require) {
    "use strict";
    var ListView = require("web.ListView");

    ListView.include(/** @lends instance.web.ListView# */{

        load_list: function (data, grouped) {
            var self = this;
            var result = this._super.apply(this, arguments);

            this.$("span.o_invert_selection").click(function () {
                var checked = self.$("tbody .o_list_record_selector input:checked");
                var unchecked = self.$("tbody .o_list_record_selector input:not(:checked)");
                checked.prop("checked", false);
                unchecked.prop("checked", true);

                var selected = [];
                checked.each(function () {
                    selected.push($(this).attr("name"));
                });
                if (selected.length === 0) {
                    self.$("thead .o_list_record_selector input").prop("checked", true);
                } else {
                    self.$("thead .o_list_record_selector input").prop("checked", false);
                }
            });

            return result;
        }
    });
});
