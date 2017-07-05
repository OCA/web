// Copyright 2017 Janire Olagibel (<janolabil@gmail.com>)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define('web_pivot_hide_measure', function (require) {
    "use strict";
    var PivotView = require('web.PivotView');

    PivotView.include({
        do_search: function (domain, context, group_by) {
            var res = this._super(domain, context, group_by);
            for (var key in this.measures) {
                if (this.measures.hasOwnProperty(key)) {
                    if (this.measures[key].hasOwnProperty("selectable") && this.measures[key].selectable === false) {
                        delete this.measures[key];
                    }
                }
            }
            return res;
        }

    });
});
