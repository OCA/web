/** @odoo-module */

import ListController from "web.ListController";
import ListRenderer from "web.ListRenderer";
import core from "web.core";

const qweb = core.qweb;

ListController.include({
    start: function () {
        this.$expandGroupButtons = $(qweb.render("web_group_expand.Buttons"));
        this.$expandGroupButtons
            .find("#oe_group_by_expand")
            .on("click", this.expandAllGroups.bind(this));
        this.$expandGroupButtons
            .find("#oe_group_by_collapse")
            .on("click", this.collapseAllGroups.bind(this));
        return this._super.apply(this, arguments);
    },

    renderButtons: function () {
        this._super.apply(this, arguments);
        this.$expandGroupButtons.toggleClass("o_hidden", !this.renderer.isGrouped);
        this.$buttons.append(this.$expandGroupButtons);
    },

    expandAllGroups: function () {
        // We expand layer by layer. So first we need to find the highest
        // layer that's not already fully expanded.
        let layer = this.renderer.state.data;
        while (layer.length) {
            const closed = layer.filter(function (group) {
                return !group.isOpen;
            });
            if (closed.length) {
                // This layer is not completely expanded, expand it
                this._toggleGroups(closed);
                break;
            }
            // This layer is completely expanded, move to the next
            layer = _.flatten(
                layer.map(function (group) {
                    return group.data;
                }),
                true
            );
        }
    },

    collapseAllGroups: function () {
        // We collapse layer by layer. So first we need to find the deepest
        // layer that's not already fully collapsed.
        let layer = this.renderer.state.data.filter(function (group) {
            return group.isOpen;
        });
        while (layer.length) {
            const next = _.flatten(
                layer.map(function (group) {
                    return group.data;
                }),
                true
            ).filter(function (group) {
                return group.isOpen;
            });
            if (!next.length) {
                // Next layer is fully collapsed, so collapse this one
                this._toggleGroups(layer);
                break;
            }
            layer = next;
        }
    },

    _toggleGroups: function (groups) {
        const self = this;
        const defs = groups.map(function (group) {
            return self.model.toggleGroup(group.id);
        });
        $.when(...defs).then(
            this.update.bind(this, {}, {keepSelection: true, reload: false})
        );
    },
});

ListRenderer.include({
    updateState: function () {
        const res = this._super.apply(this, arguments);
        $("nav.oe_group_by_expand_buttons").toggleClass("o_hidden", !this.isGrouped);
        return res;
    },
});
