/* Copyright 2017 Jairo Llopis <jairo.llopis@tecnativa.com>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

// Many code copied from Odoo, but with modifications https://github.com/odoo/odoo/blob/68176d80ad6053f52ed1c7bcf294ab3664986c46/addons/web/static/src/js/views/form_widgets.js#L396-L528

odoo.define('web_widget_domain_v11.field', function(require){
"use strict";
var core = require('web.core');
var DomainSelector = require("web.DomainSelector");
var DomainSelectorDialog = require("web.DomainSelectorDialog");
var common = require('web.form_common');
var Model = require('web.DataModel');
var pyeval = require('web.pyeval');
var session = require('web.session');
var _t = core._t;

/// The "Domain" field allows the user to construct a technical-prefix domain thanks to
/// a tree-like interface and see the selected records in real time.
/// In debug mode, an input is also there to be able to enter the prefix char domain
/// directly (or to build advanced domains the tree-like interface does not allow to).
var FieldDomain = common.AbstractField.extend(common.ReinitializeFieldMixin).extend({
    template: "FieldDomain",
    events: {
        "click .o_domain_show_selection_button": function (e) {
            e.preventDefault();
            this._showSelection();
        },
        "click .o_form_field_domain_dialog_button": function (e) {
            e.preventDefault();
            this.openDomainDialog();
        },
    },
    custom_events: {
        "domain_changed": function (e) {
            if (this.options.in_dialog) return;
            this.set_value(this.domainSelector.getDomain(), true);
        },
        "domain_selected": function (e) {
            this.set_value(e.data.domain);
        },
    },
    init: function () {
        this._super.apply(this, arguments);

        this.valid = true;
        this.debug = session.debug;
        this.options = _.defaults(this.options || {}, {
            in_dialog: false,
            model: undefined, // this option is mandatory !
            fs_filters: {}, // Field selector filters (to only show a subset of available fields @see FieldSelector)
        });
        if (this.options.model_field && !this.options.model) {
            this.options.model = this.options.model_field;
        }
    },
    start: function() {
        this.model = _get_model.call(this); // TODO get the model another way ?
        this.field_manager.on("view_content_has_changed", this, function () {
            var currentModel = this.model;
            this.model = _get_model.call(this);
            if (currentModel !== this.model) {
                this.render_value();
            }
        });

        return this._super.apply(this, arguments);

        function _get_model() {
            if (this.field_manager.fields[this.options.model]) {
                return this.field_manager.get_field_value(this.options.model);
            }
            return this.options.model;
        }
    },
    initialize_content: function () {
        this._super.apply(this, arguments);
        this.$panel = this.$(".o_form_field_domain_panel");
        this.$showSelectionButton = this.$panel.find(".o_domain_show_selection_button");
        this.$recordsCountDisplay = this.$showSelectionButton.find(".o_domain_records_count");
        this.$errorMessage = this.$panel.find(".o_domain_error_message");
        this.$modelMissing = this.$(".o_domain_model_missing");
    },
    set_value: function (value, noDomainSelectorRender) {
        this._noDomainSelectorRender = !!noDomainSelectorRender;
        this._super.apply(this, arguments);
        this._noDomainSelectorRender = false;
    },
    render_value: function() {
        this._super.apply(this, arguments);

        // If there is no set model, the field should only display the corresponding error message
        this.$panel.toggleClass("o_hidden", !this.model);
        this.$modelMissing.toggleClass("o_hidden", !!this.model);
        if (!this.model) {
            if (this.domainSelector) {
                this.domainSelector.destroy();
                this.domainSelector = undefined;
            }
            return;
        }

        var domain = pyeval.eval("domain", this.get("value") || "[]");

        // Recreate domain widget with new domain value
        if (!this._noDomainSelectorRender) {
            if (this.domainSelector) {
                this.domainSelector.destroy();
            }
            this.domainSelector = new DomainSelector(this, this.model, domain, {
                readonly: this.get("effective_readonly") || this.options.in_dialog,
                fs_filters: this.options.fs_filters,
                debugMode: session.debug,
            });
            this.domainSelector.prependTo(this.$el);
        }

        // Show number of selected records
        new Model(this.model).call("search_count", [domain], {
            context: this.build_context(),
        }).then((function (data) {
            this.valid = true;
            return data;
        }).bind(this), (function (error, e) {
            e.preventDefault();
            this.valid = false;
        }).bind(this)).always((function (data) {
            this.$recordsCountDisplay.text(data || 0);
            this.$showSelectionButton.toggleClass("hidden", !this.valid);
            this.$errorMessage.toggleClass("hidden", this.valid);
        }).bind(this));
    },
    is_syntax_valid: function() {
        return this.field_manager.get("actual_mode") === "view" || this.valid;
    },
    _showSelection: function() {
        return new common.SelectCreateDialog(this, {
            title: _t("Selected records"),
            res_model: this.model,
            domain: this.get("value") || "[]",
            no_create: true,
            readonly: true,
            disable_multiple_selection: true,
        }).open();
    },
    openDomainDialog: function () {
        new DomainSelectorDialog(this, this.model, this.get("value") || "[]", {
            readonly: this.get("effective_readonly"),
            fs_filters: this.options.fs_filters,
            debugMode: session.debug,
        }).open();
    },
});

// Replace char_domain widget
core.form_widget_registry.add('char_domain', FieldDomain);
});
