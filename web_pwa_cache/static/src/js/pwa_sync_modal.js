odoo.define("web_pwa_cache.PWASyncModal", function (require) {
    "use strict";

    var core = require("web.core");
    var Dialog = require("web.Dialog");
    var Widget = require("web.Widget");
    var time = require("web.time");

    var QWeb = core.qweb;
    var _t = core._t;

    var PWASyncModal = Widget.extend({
        /**
         * @override
         */
        init: function (records, options) {
            this._super.apply(this, arguments);
            this.records = records;
            this.options = options;
        },

        show: function () {
            var self = this;
            var $content = $(
                QWeb.render("web_pwa_cache.PWASyncModal", {
                    records: this.records,
                    moment: moment,
                    langDateTimeFormat: time.getLangDatetimeFormat(),
                })
            );
            var buttons = [];
            var title = "";
            if (this.options.forced_sync) {
                title = _t("Synchronizing offline records...");
            } else {
                title = _t("PWA Transactions to Synchronize");
                if (this.records.length) {
                    buttons.push({
                        text: _t("Synchronize Now"),
                        classes: "btn-primary",
                        click: function () {
                            if (self.options.sync) {
                                self.options.sync.call();
                            }
                        },
                        close: true,
                    });
                } else {
                    buttons.push({
                        text: _t("Close"),
                        close: true,
                    });
                }
            }
            this.dialog = new Dialog(this, {
                title: title,
                $content: $content,
                buttons: buttons,
                fullscreen: true,
            });
            this.dialog.open();
            this.setElement(this.dialog.$el);
        },

        close: function () {
            if (this.dialog) {
                this.dialog.close();
                this.setElement(null);
            }
        },

        isOpen: function () {
            return this.dialog && this.dialog.opened();
        },
    });

    return PWASyncModal;
});
