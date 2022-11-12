// Copyright 2020 Lorenzo Battistini @ TAKOBI
// Copyright 2020 Andrea Piovesana @ Openindustry.it
odoo.define("web_widget_model_viewer.FieldBinaryModelViewer", function (require) {
    "use strict";

    var BasicFields = require("web.basic_fields");
    var core = require("web.core");
    var registry = require("web.field_registry");
    var session = require("web.session");
    var utils = require("web.utils");
    var _t = core._t;
    var qweb = core.qweb;

    var FieldBinaryModelViewer = BasicFields.FieldBinaryFile.extend({
        template: "FieldBinaryModelViewer",
        events: _.extend({}, BasicFields.FieldBinaryFile.prototype.events, {
            click: function () {
                if (this.mode === "readonly") {
                    this.trigger_up("bounce_edit");
                }
            },
            "click #model-viewer-fullscreen": "fullscreen",
        }),
        supportedFieldTypes: ["binary"],
        init: function () {
            this._super.apply(this, arguments);
            var max_upload_size = this.attrs.max_upload_size;
            if (max_upload_size) {
                this.max_upload_size = parseInt(max_upload_size, 10) * 1024 * 1024;
            } else {
                // 250M
                this.max_upload_size = 250 * 1024 * 1024;
            }
        },
        _render: function () {
            var self = this;
            var url = "";
            if (this.value) {
                if (utils.is_bin_size(this.value)) {
                    url = session.url("/web/content", {
                        model: this.model,
                        id: JSON.stringify(this.res_id),
                        field: this.name,
                    });
                } else {
                    url = "data:model/gltf-binary;base64," + this.value;
                }
            }
            var $glb = $(
                qweb.render("FieldBinaryModelViewer-glb", {widget: this, url: url})
            );
            var style = this.attrs.style;
            if (style) {
                $glb.attr("style", style);
            }
            this.$("> model-viewer").remove();
            this.$el.prepend($glb);
            $glb.on("error", function () {
                self._clearFile();
                $glb.attr("src", "");
                self.do_warn(
                    _t("3D model"),
                    _t("Could not display the selected model.")
                );
            });
        },
        /* eslint-disable complexity */
        fullscreen: function (ev) {
            var isFullscreenAvailable =
                document.fullscreenEnabled ||
                document.mozFullScreenEnabled ||
                document.webkitFullscreenEnabled ||
                document.msFullscreenEnabled ||
                false;
            var modelViewerElem = ev.target.parentElement.parentElement.parentElement;
            if (isFullscreenAvailable) {
                var fullscreenElement =
                    document.fullscreenElement ||
                    document.mozFullScreenElement ||
                    document.webkitFullscreenElement ||
                    document.msFullscreenElement;
                if (fullscreenElement) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        /* Firefox */
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        /* Chrome, Safari and Opera */
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        /* IE/Edge */
                        document.msExitFullscreen();
                    }
                } else if (modelViewerElem.requestFullscreen) {
                    modelViewerElem.requestFullscreen();
                } else if (modelViewerElem.mozRequestFullScreen) {
                    /* Firefox */
                    modelViewerElem.mozRequestFullScreen();
                } else if (modelViewerElem.webkitRequestFullscreen) {
                    /* Chrome, Safari and Opera */
                    modelViewerElem.webkitRequestFullscreen();
                } else if (modelViewerElem.msRequestFullscreen) {
                    /* IE/Edge */
                    modelViewerElem.msRequestFullscreen();
                }
            } else {
                console.error("ERROR : full screen not supported by web browser");
            }
        },
    });

    registry.add("model_viewer", FieldBinaryModelViewer);
});
