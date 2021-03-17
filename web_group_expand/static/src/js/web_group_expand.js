odoo.define("web.web_group_expand", function(require) {
    "use strict";

    var qweb = require("web.core").qweb;

    require("web.ListController").include({
        start: function() {
            this.$expandGroupButtons = $(qweb.render("web_group_expand.Buttons"));
            this.$expandGroupButtons
                .find("#oe_group_by_expand")
                .on("click", this.expandAllGroups.bind(this));
            this.$expandGroupButtons
                .find("#oe_group_by_collapse")
                .on("click", this.collapseAllGroups.bind(this));
            return this._super.apply(this, arguments);
        },

        renderPager: function($node) {
            this._super.apply(this, arguments);
            this.$expandGroupButtons.toggleClass("o_hidden", !this.renderer.isGrouped);
            $node.append(this.$expandGroupButtons);
        },

        expandAllGroups: function() {
            // We expand layer by layer. So first we need to find the highest
            // layer that's not already fully expanded.
            var layer = this.renderer.state.data;
            while (layer.length) {
                var closed = layer.filter(function(group) {
                    return !group.isOpen;
                });
                if (closed.length) {
                    // This layer is not completely expanded, expand it
                    this._toggleGroups(closed);
                    break;
                }
                // This layer is completely expanded, move to the next
                layer = _.flatten(
                    layer.map(function(group) {
                        return group.data;
                    }),
                    true
                );
            }
        },

        collapseAllGroups: function() {
            // We collapse layer by layer. So first we need to find the deepest
            // layer that's not already fully collapsed.
            var layer = this.renderer.state.data.filter(function(group) {
                return group.isOpen;
            });
            while (layer.length) {
                var next = _.flatten(
                    layer.map(function(group) {
                        return group.data;
                    }),
                    true
                ).filter(function(group) {
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

        _toggleGroups: function(groups) {
            var self = this;
            var defs = groups.map(function(group) {
                return self.model.toggleGroup(group.id);
            });
            $.when(...defs).then(
                this.update.bind(this, {}, {keepSelection: true, reload: false})
            );
        },
    });

    require("web.ListRenderer").include({
        updateState: function() {
            var res = this._super.apply(this, arguments);
            $("nav.oe_group_by_expand_buttons").toggleClass(
                "o_hidden",
                !this.isGrouped
            );
            return res;
        },
    });
});
