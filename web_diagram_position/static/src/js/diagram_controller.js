// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).
odoo.define('web_diagram_position.DiagramController', function (require) {
"use strict";

var core = require('web.core');
var Dialog = require('web.Dialog');
var dialogs = require('web.view_dialogs');

var _t = core._t;

require('web_diagram.DiagramController').include({

    custom_events: {
        add_edge: '_onAddEdge',
        edit_edge: '_onEditEdge',
        edit_node: '_onEditNode',
        remove_edge: '_onRemoveEdge',
        remove_node: '_onRemoveNode',
    },

    is_readonly: function () {
        var context = this.context;
        return context ? context.edit != undefined && !context.edit : false;
    },

    _addNode: function () {
        if (this.model.modelName != 'project.workflow')
            return this._super();

        var state = this.model.get();
        var pop = new dialogs.FormViewDialog(this, {
            res_model: state.node_model,
            domain: this.domain,
            context: this.context,
            title: _.str.sprintf("%s %s", _t("Create:"), _t('State')),
            disable_multiple_selection: true,
            on_saved: this.reload.bind(this),
        }).open();

        // manually trigger a 'field_changed' on the dialog's form_view to set
        // the default value of the parent_id field
        pop.opened().then(function () {
            var changes = {};
            changes[state.parent_field] = { id: state.res_id };

            pop.form_view.trigger_up('field_changed', {
                dataPointID: pop.form_view.handle,
                changes: changes,
            });

            let fields_to_disable = [state.parent_field];
            let renderer = pop.form_view.renderer;
            _.each(renderer.allFieldWidgets[renderer.state.id], function (widget) {
                if (fields_to_disable.includes(widget.name)) {
                    if (widget.$input) widget.$input.prop('disabled', true);
                    if (widget.$dropdown) widget.$dropdown.unbind();
                }
            });
        });
    },

    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

    /**
     * Custom event handler that opens a popup to add an edge from given source
     * and dest nodes.
     *
     * @private
     * @param {OdooEvent} event
     */
    _onAddEdge: function (event) {
        var self = this;
        var state = this.model.get();
        var pop = new dialogs.FormViewDialog(self, {
            res_model: state.connector_model,
            domain: this.domain,
            context: this.context,
            title: _.str.sprintf("%s %s", _t("Create:"), _t('Transition')),
            disable_multiple_selection: true,
        }).open();

        // manually trigger a 'field_changed' on the dialog's form_view to set
        // the default source and destination values
        pop.opened().then(function () {
            var changes = {};
            changes[state.connectors.attrs.source] = { id: event.data.source_id };
            changes[state.connectors.attrs.destination] = { id: event.data.dest_id };
            changes[state.parent_field] = { id: state.res_id };

            pop.form_view.trigger_up('field_changed', {
                dataPointID: pop.form_view.handle,
                changes: changes,
            });

            let fields_to_disable = [state.parent_field];
            let renderer = pop.form_view.renderer;
            _.each(renderer.allFieldWidgets[renderer.state.id], function (widget) {
                if (fields_to_disable.includes(widget.name)) {
                    if (widget.$input)  widget.$input.prop('disabled', true);
                    if (widget.$dropdown) widget.$dropdown.unbind();
                }
            });

        });
        pop.on('closed', this, this.reload.bind(this));
    },
    /**
     * Custom event handler that opens a popup to edit an edge given its id
     *
     * @private
     * @param {OdooEvent} event
     */
    _onEditEdge: function (event) {
        var state = this.model.get();
        let pop = new dialogs.FormViewDialog(this, {
            res_model: state.connector_model,
            res_id: parseInt(event.data.id, 10),
            context: this.context,
            title: _.str.sprintf("%s %s", _t("Open:"), _t('Transition')),
            on_saved: this.reload.bind(this),
        }).open();

        pop.opened().then(function(){
            let fields_to_disable = [state.parent_field];
            let renderer = pop.form_view.renderer;
            _.each(renderer.allFieldWidgets[renderer.state.id], function (widget) {
                if (fields_to_disable.includes(widget.name)) {
                    if (widget.$input)  widget.$input.prop('disabled', true);
                    if (widget.$dropdown) widget.$dropdown.unbind();
                }
            });
        });
    },
    /**
     * Custom event handler that opens a popup to edit the content of a node
     * given its id
     *
     * @private
     * @param {OdooEvent} event
     */
    _onEditNode: function (event) {
        var state = this.model.get();
        let pop = new dialogs.FormViewDialog(this, {
            res_model: state.node_model,
            res_id: event.data.id,
            context: this.context,
            title: _.str.sprintf("%s %s", _t("Open:"), _t('Activity')),
            on_saved: this.reload.bind(this),
        }).open();

        pop.opened().then(function(){
            let fields_to_disable = [state.parent_field];
            let renderer = pop.form_view.renderer;
            _.each(renderer.allFieldWidgets[renderer.state.id], function (widget) {
                if (fields_to_disable.includes(widget.name)) {
                    if (widget.$input)  widget.$input.prop('disabled', true);
                    if (widget.$dropdown) widget.$dropdown.unbind();
                }
            });
        });
    },
    /**
     * Custom event handler that removes an edge given its id
     *
     * @private
     * @param {OdooEvent} event
     */
    _onRemoveEdge: function (event) {
        var self = this;
        Dialog.confirm(this, (_t("Are you sure you want to remove this transition?")), {
            confirm_callback: function () {
                var state = self.model.get();
                self._rpc({
                        model: state.connector_model,
                        method: 'unlink',
                        args: [event.data.id],
                    })
                    .then(self.reload.bind(self));
            },
        });
    },
    /**
     * Custom event handler that removes a node given its id
     *
     * @private
     * @param {OdooEvent} event
     */
    _onRemoveNode: function (event) {
        var self = this;
        var msg = _t("Are you sure you want to remove this node ? This will remove its connected transitions as well.");
        Dialog.confirm(this, (msg), {
            confirm_callback: function () {
                var state = self.model.get();
                self._rpc({
                        model: state.node_model,
                        method: 'unlink',
                        args: [event.data.id],
                    })
                    .then(self.reload.bind(self));
            },
        });
    },
});

});
