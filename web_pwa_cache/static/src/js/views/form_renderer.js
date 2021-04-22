odoo.define("web_pwa_cache.FormRenderer", function(require) {
    "use strict";

    var FormRenderer = require("web.FormRenderer");
    var WebClientObj = require("web.web_client");

    FormRenderer.include({
        /**
         * Check if the tag needs to be omitted
         *
         * @param {Object} node
         * @returns {Boolean}
         */
        _isPWAOmittedTag: function(node) {
            if (typeof node === "object" && "attrs" in node && node.attrs.class) {
                const node_classes = node.attrs.class.split(" ");
                return (
                    (node_classes.indexOf("oe_pwa_online_only") !== -1 &&
                        WebClientObj.pwa_manager.isOfflineMode()) ||
                    (node_classes.indexOf("oe_pwa_offline_only") !== -1 &&
                        !WebClientObj.pwa_manager.isOfflineMode())
                );
            }

            return false;
        },

        /**
         * @override
         */
        _renderHeaderButton: function(node) {
            if (this._isPWAOmittedTag(node)) {
                return false;
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagButton: function(node) {
            if (this._isPWAOmittedTag(node)) {
                return false;
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagField: function(node) {
            if (this._isPWAOmittedTag(node)) {
                return false;
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagGroup: function(node) {
            if (this._isPWAOmittedTag(node)) {
                return false;
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagLabel: function(node) {
            if (this._isPWAOmittedTag(node)) {
                return false;
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagWidget: function(node) {
            if (this._isPWAOmittedTag(node)) {
                return false;
            }
            return this._super.apply(this, arguments);
        },
    });
});
