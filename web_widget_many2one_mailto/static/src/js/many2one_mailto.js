odoo.define("web_widget_many2one_mailto.FieldMany2OneMailto", function (require) {
    "use strict";

    const core = require("web.core");
    const relational_fields = require("web.relational_fields");
    const FieldMany2One = relational_fields.FieldMany2One;
    const field_registry = require("web.field_registry");

    const _lt = core._lt;
    const qweb = core.qweb;

    const FieldMany2OneMailto = FieldMany2One.extend({
        description: _lt("Many2one Mailto"),
        _template: "FieldMany2OneMailto",
        events: _.extend({}, FieldMany2One.prototype.events, {
            "click .o_field_link": "_onClickField",
        }),

        /**
         * @override
         */
        init() {
            this._super.apply(this, arguments);
            if (this.mode === "readonly") {
                this.template = null;
                this.tagName = "div";
                this.className = "o_field_many2one_mailto";
                this.mailto_value = false;
                this.noMailtoOpen = this.noOpen;
                // Disable the redirection to the related record on click, in readonly
                this.noOpen = true;
            }
        },
        /**
         * @override
         */
        _renderReadonly: async function () {
            this.$el.empty();

            if (this.nodeOptions.mailto_field && this.value) {
                const record = await this._rpc({
                    model: this.value.model,
                    method: "read",
                    args: [this.value.data.id, [this.nodeOptions.mailto_field]],
                });
                if (record[0][this.nodeOptions.mailto_field]) {
                    this.mailto_value = record[0][this.nodeOptions.mailto_field];
                }
            }
            if (this.value) {
                this.$el.html(
                    qweb.render(this._template, {
                        value: this.m2o_value,
                        url: _.str.sprintf(
                            "#id=%s&model=%s",
                            this.value.res_id,
                            this.field.relation
                        ),
                        email: this.mailto_value,
                        noMailtoOpen: this.noMailtoOpen,
                    })
                );
            }
        },
        // --------------------------------------------------------------------------
        // Handlers
        // --------------------------------------------------------------------------
        /**
         * @private
         * @param {MouseEvent} event
         */
        _onClickField: function (event) {
            var self = this;
            if (this.mode === "readonly" && !this.noMailtoOpen) {
                event.preventDefault();
                event.stopPropagation();
                this._rpc({
                    model: this.field.relation,
                    method: "get_formview_action",
                    args: [[this.value.res_id]],
                    context: this.record.getContext(this.recordParams),
                }).then(function (action) {
                    self.trigger_up("do_action", {action: action});
                });
            }
        },
    });

    field_registry.add("many2one_mailto", FieldMany2OneMailto);

    return FieldMany2OneMailto;
});
