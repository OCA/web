odoo.define("web_widget_open_tab.FieldOpenTab", function (require) {
    "use strict";

    var AbstractField = require("web.AbstractField");
    var field_registry = require("web.field_registry");
    var ListRenderer = require("web.ListRenderer");
    var core = require("web.core");
    var config = require("web.config");
    var qweb = core.qweb;
    var _t = core._t;

    var FieldOpenTab = AbstractField.extend({
        description: "",
        // We want to maintain it black in order to show nothing on the header
        supportedFieldTypes: ["integer"],
        events: _.extend({}, AbstractField.prototype.events, {
            click: "_onClick",
        }),
        isSet: function () {
            return true;
        },
        _getReference: function () {
            var url = window.location.href;
            var searchParams = new URLSearchParams(url.split("#")[1]);
            searchParams.set("view_type", "form");
            searchParams.set("id", this.res_id);
            if (
                !searchParams.has("model") ||
                searchParams.get("model") !== this.model
            ) {
                searchParams.set("model", this.model);
                searchParams.delete("action");
            }
            return url.split("#")[0] + "#" + searchParams.toString();
        },
        _renderReadonly: function () {
            var $content = $("<a/>", {
                href: this._getReference(),
                class: "open_tab_widget fa fa-external-link",
            });
            var self = this;
            $content.tooltip({
                delay: {show: 1000, hide: 0},
                title: function () {
                    return qweb.render("WidgetButton.tooltip", {
                        debug: config.debug,
                        state: self.record,
                        node: {
                            attrs: {
                                help: _t("Click in order to open on new tab"),
                                type: _t("Widget"),
                            },
                        },
                    });
                },
            });
            this.$el.append($content);
        },
        _onClick: function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var element = $(ev.currentTarget).find("a");
            if (element !== null && element[0].href !== null) {
                window.open(this._getReference());
            }
        },
    });
    ListRenderer.include({
        // We want to simplify the header of this kind of elements
        // and disallow sorting
        _renderHeaderCell: function (node) {
            var $th = this._super.apply(this, arguments);
            if (node.attrs.widget === "open_tab") {
                $th.removeClass("o_column_sortable");
                $th[0].width = 1;
            }
            return $th;
        },
    });

    field_registry.add("open_tab", FieldOpenTab);
    return FieldOpenTab;
});
