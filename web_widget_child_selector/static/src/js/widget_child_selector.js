odoo.define("web.web_widget_child_selector", function (require) {
    "use strict";

    var relational_fields = require("web.relational_fields");
    var field_registry = require("web.field_registry");
    var core = require("web.core");
    var qweb = core.qweb;
    var FieldMany2One = relational_fields.FieldMany2One;

    var FieldChildSelector = FieldMany2One.extend({
        template: "FieldChildSelector",
        events: _.extend({}, FieldMany2One.prototype.events, {
            "click .o_child_selection_button": "_onChildSelectionClick",
        }),
        start: function () {
            this.$input_dropdown = this.$(".o_input_dropdown");
            this.$input_value = this.$(".o_input_value");
            return this._super.apply(this, arguments);
        },
        _renderReadonly: function () {
            var value = _.escape((this.m2o_value || "").trim())
                .split("\n")
                .join("<br/>");
            this.$el.html(value);
            if (!this.nodeOptions.no_open && this.value) {
                this.$el.attr(
                    "href",
                    _.str.sprintf(
                        "#id=%s&model=%s",
                        this.value.res_id,
                        this.field.relation
                    )
                );
                this.$el.addClass("o_form_uri");
            }
        },
        _set_childs: function () {
            var self = this;
            this.childs = {};
            this.parents = {};
            this.$input_dropdown.empty();
            this.$input_value.empty();
            var resources = [];
            if (this.value.res_id) resources = [this.value.res_id];
            this._rpc({
                model: this.field.relation,
                method: "get_record_direct_childs_parents",
                args: [
                    resources,
                    this.nodeOptions,
                    this.record.getDomain({fieldName: this.name}),
                ],
                context: this.record.getContext(this.recordParams),
            }).then(function (data) {
                _.each(data.parents, function (parent, key) {
                    self.parents[key] = parent;
                });
                _.each(data.childs, function (child, key) {
                    self.childs[key] = child;
                });
                self.$input_dropdown.append(
                    qweb.render("FieldChildSelectorChild", {
                        childs: self.childs,
                    })
                );
                self.$input_value.append(
                    qweb.render("FieldChildSelectorParent", {
                        parents: self.parents,
                    })
                );
            });
        },
        _onChildSelectionClick: function (event) {
            var target = $(event.target);
            var type = target.data("type");
            if (type === "clear") {
                this._setValue({id: false});
            } else {
                var index = target.data("index");
                var value = type === "child" ? this.childs[index] : this.parents[index];
                this._setValue({id: value[0], display_name: value[1]});
            }
        },
        _renderEdit: function () {
            this._set_childs();
        },
    });

    field_registry.add("child_selector", FieldChildSelector);
    return FieldChildSelector;
});
