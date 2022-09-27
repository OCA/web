/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("refresher.Refresher", function(require) {
    "use strict";

    const Widget = require("web.Widget");
    const AbstractController = require("web.AbstractController");
    const BasicController = require("web.BasicController");
    const ControlPanelRenderer = require("web.ControlPanelRenderer");

    const Refresher = Widget.extend({
        template: "web_refresher.Button",
        events: {
            "click .oe_pager_refresh": "_onClickRefresher",
        },

        _onClickRefresher: function() {
            this.trigger("pager_refresh");
        },
    });

    AbstractController.include({
        /**
         * Hook
         *
         * @param {jQuery} $node
         * @returns {Promise}
         */
        // eslint-disable-next-line no-unused-vars
        renderRefresher: function($node) {
            return Promise.resolve();
        },

        /**
         * Adds the 'refresher' to the control panel
         *
         * @override
         */
        _renderControlPanelElements: function() {
            return this._super.apply(this, arguments).then(elements => {
                elements.$refresher = $("<div>");
                return this.renderRefresher(elements.$refresher).then(() => {
                    elements.$refresher = elements.$refresher.contents();
                    return elements;
                });
            });
        },
    });

    BasicController.include({
        /**
         * @param {jQuery} $node
         * @returns {Promise}
         */
        renderRefresher: function($node) {
            this.refresher = new Refresher(this);
            this.refresher.on("pager_refresh", this, () => {
                if (this.pager) {
                    this.pager.trigger("pager_changed", this._getPagerParams());
                }
            });
            return this.refresher.appendTo($node);
        },
    });

    ControlPanelRenderer.include({
        /**
         * @override
         */
        start: function() {
            return this._super.apply(this, arguments).then(() => {
                this.nodes.$refresher = this.$(".oe_cp_refresher");
            });
        },
    });

    return Refresher;
});
