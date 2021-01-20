odoo.define("web_pwa_cache.PWAModeSelector", function (require) {
    "use strict";

    var core = require('web.core');
    var Dialog = require('web.Dialog');
    var Widget = require("web.Widget");

    var QWeb = core.qweb;
    var _t = core._t;

    var PWAModeSelector = Widget.extend({

        /**
         * @override
         */
        init: function (options) {
            this._super.apply(this, arguments);
            this.options = options;
            this.shown = false;
        },

        show: function () {
            var self = this;
            var $content = $(QWeb.render("web_pwa_cache.PWAModeSelector"));
            this.dialog = new Dialog(this, {
                title: _t('Set PWA Mode'),
                $content: $content,
                buttons: [],
                fullscreen: true,
            });
            this.dialog.opened().then(function () {
                self.dialog.$modal.find('.modal-header .close').addClass('d-none');
                if (self.options.offline) {
                    $content.find("button[data-mode='offline']").on("click", self.options.offline);
                }
                if (self.options.online) {
                    $content.find("button[data-mode='online']").on("click", self.options.online);
                }
            });
            this.dialog.open();
            this.shown = true;
            this.setElement(this.dialog.$el);
        },

        isOpen: function () {
            return this.dialog && this.dialog.opened();
        },

        close: function () {
            if (this.dialog) {
                this.dialog.close();
                this.setElement(null);
            }
        },

        wasShown: function () {
            return this.shown;
        },
    });

    return PWAModeSelector;
});
