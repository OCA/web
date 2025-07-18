/** @odoo-module **/
/* Copyright 2024 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import ListRenderer from "web.ListRenderer";
import core from "web.core";

var _t = core._t;

ListRenderer.include({
    events: _.extend({}, ListRenderer.prototype.events, {
        "click tr .o_list_record_clone": "_onCloneIconClick",
    }),

    init: function (parent, state, params) {
        this._super(parent, state, params);
        this.addCloneIcon =
            parent &&
            parent.attrs &&
            parent.attrs.options &&
            parent.attrs.options.allow_clone &&
            !parent.isReadonly &&
            parent.activeActions &&
            parent.activeActions.create;
    },

    _onCloneIconClick: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var $row = $(event.target).closest("tr");
        var id = $row.data("id");
        var record = this.state.data.find(function (rec) {
            return rec.id === id;
        });

        var self = this;
        this.unselectRow().then(function () {
            self._rpc({
                model: record.model,
                method: "copy_data",
                args: [record.res_id],
            }).then(function (dict) {
                var newContext = {};
                for (var key in dict) {
                    if (dict.hasOwnProperty(key)) {
                        newContext["default_" + key] = dict[key];
                    }
                }
                self.trigger_up("add_record", {
                    context: [newContext],
                    forceEditable: "bottom",
                });
            });
        });
    },

    _getNumberOfCols: function () {
        var n = this._super();
        if (this.addCloneIcon) {
            n++;
        }
        return n;
    },

    _renderHeader: function () {
        var $thead = this._super.apply(this, arguments);
        if (this.addCloneIcon) {
            $thead.find("tr").append($("<th>", {class: "o_list_record_clone"}));
        }
        return $thead;
    },

    _renderFooter: function () {
        const $footer = this._super.apply(this, arguments);
        if (this.addCloneIcon) {
            $footer.find("tr").append($("<td>"));
        }
        return $footer;
    },

    _renderRow: function (record, index) {
        var $row = this._super.apply(this, arguments);
        if (this.addCloneIcon) {
            const isDisabled = !record.res_id;
            const $icon = $("<button>", {
                class: "fa fa-copy",
                name: "clone",
                "aria-label": _t("Clone row ") + (index + 1),
                disabled: isDisabled,
            });
            const $td = $("<td>", {class: "o_list_record_clone"}).append($icon);
            const $deleteIconTd = $row.find(".o_list_record_remove");
            if ($deleteIconTd.length > 0) {
                $deleteIconTd.before($td);
            } else {
                $row.append($td);
            }
        }
        return $row;
    },
});
