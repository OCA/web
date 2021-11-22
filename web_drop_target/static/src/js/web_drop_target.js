/* global Uint8Array, base64js */
// Copyright 2018 Therp BV <https://therp.nl>
// Copyright 2021 Tecnativa - Alexandre D. Díaz
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

odoo.define("web_drop_target", function (require) {
    "use strict";
    const ActionManager = require("web.ActionManager");
    const FormController = require("web.FormController");
    const core = require("web.core");
    const qweb = core.qweb;

    // This is the main contribution of this addon: A mixin you can use
    // To make some widget a drop target. Read on how to use this yourself
    const DropTargetMixin = {
        // Add the mime types you want to support here, leave empty for
        // All types. For more control, override _get_drop_items in your class
        _drop_allowed_types: [],
        // Determine the zone where can drop files, if not defined, we use the element
        _drop_zone_selector: undefined,

        /**
         * @override
         */
        start: function () {
            const $body = $("body");
            this._dropZoneNS = _.uniqueId("o_dz_"); // For event namespace used when multiple chat window is open
            $body.on(
                "dragleave." + this._dropZoneNS,
                this._onBodyFileDragLeave.bind(this)
            );
            $body.on(
                "dragover." + this._dropZoneNS,
                this._onBodyFileDragover.bind(this)
            );
            $body.on("drop." + this._dropZoneNS, this._onBodyFileDrop.bind(this));
            return this._super.apply(this, arguments).then((result) => {
                _.defer(this._add_overlay.bind(this));
                return result;
            });
        },

        /**
         * @override
         */
        destroy: function () {
            this._super.apply(this, arguments);
            const $body = $("body");
            $body.off("dragleave." + this._dropZoneNS);
            $body.off("dragover." + this._dropZoneNS);
            $body.off("drop." + this._dropZoneNS);
            this._remove_overlay();
        },
        /**
         * @override
         Necessary for creation of attachment
         */
        _updateAndDisable: function () {
            return this._super.apply(this, arguments).then((result) => {
                this._update_overlay();
                return result;
            });
        },
        /**
         * @override
         Necessary for change of views and Next and Previous buttons
         */
        _update: function () {
            return this._super.apply(this, arguments).then((result) => {
                this._update_overlay();
                return result;
            });
        },
        _update_overlay: function () {
            this._remove_overlay();
            _.defer(this._add_overlay.bind(this));
        },
        /**
         * TODO: Change the name to follow the standard in new versions
         *
         * @private
         * @returns {Number}
         */
        _get_record_id: function () {
            // Implement when including this mixin. Return the record ID.
            console.log("'_get_record_id': Not Implemented");
            return false;
        },

        /**
         * TODO: Change the name to follow the standard in new versions
         *
         * @private
         */
        _add_overlay: function () {
            if (!this._drop_overlay || this._drop_overlay.length === 0) {
                if (this._drop_zone_selector)
                    this.$drop_zone = this.$(this._drop_zone_selector).last();
                else this.$drop_zone = this.$el;
                // Element that represents the zone where you can drop files
                // TODO: This name is preserved for not breaking the compatibility with other modules,
                // but should be changed in new versions to follow the standard ($name)
                this._drop_overlay = $(
                    qweb.render("web_drop_target.drop_overlay", {
                        id: this._get_record_id(),
                    })
                );
                this.$drop_zone.append(this._drop_overlay);

                this._drop_overlay.on("drop", this._on_drop.bind(this));
            }
        },

        /**
         * TODO: Change the name to follow the standard in new versions
         *
         * @private
         */
        _remove_overlay: function () {
            if (this._drop_overlay && this._drop_overlay.length) {
                this._drop_overlay.off("drop");
                this._drop_overlay.remove();
                this._drop_overlay = null;
            }
        },

        /** ********************
         * HANDLE EVENTS
         **********************/

        /**
         * @private
         * @param {MouseEvent} ev
         */
        _onBodyFileDragLeave: function (ev) {
            // On every dragenter chain created with parent child element
            // That's why dragleave is fired every time when a child elemnt is hovered
            // so here we hide dropzone based on mouse position
            if (
                ev.originalEvent.clientX <= 0 ||
                ev.originalEvent.clientY <= 0 ||
                ev.originalEvent.clientX >= window.innerWidth ||
                ev.originalEvent.clientY >= window.innerHeight
            ) {
                this._drop_overlay.addClass("d-none");
            }
        },

        /**
         * @private
         * @param {MouseEvent} ev
         */
        _onBodyFileDragover: function (ev) {
            ev.preventDefault();
            const actionManager = this.findAncestor(function (ancestor) {
                return ancestor instanceof ActionManager;
            });
            const controller = actionManager.currentDialogController;
            if (
                _.isEmpty(this._get_drop_items(ev)) &&
                this._checkDragOver() &&
                (controller == undefined || controller.jsID === this.controllerID)
            ) {
                const drop_zone_offset = this.$drop_zone.offset();
                const overlay_css = {
                    top: drop_zone_offset.top,
                    left: drop_zone_offset.left,
                    width: this.$drop_zone.width(),
                    height: this.$drop_zone.height(),
                };
                if (!this._get_record_id()) {
                    overlay_css.background = "#FF000020";
                }
                this._drop_overlay.css(overlay_css);
                this._drop_overlay.removeClass("d-none");
            }
        },

        _checkDragOver: function () {
            return true;
        },

        /**
         * @private
         * @param {MouseEvent} ev
         */
        _onBodyFileDrop: function (ev) {
            ev.preventDefault();
            this._drop_overlay.addClass("d-none");
        },

        /**
         * TODO: Change the name to follow the standard in new versions
         *
         * @private
         * @param {MouseEvent} ev
         */
        _on_drop: function (ev) {
            if (!this._drop_overlay || this._drop_overlay.length === 0) {
                return;
            }
            ev.preventDefault();
            const drop_items = this._get_drop_items(ev);
            if (_.isEmpty(drop_items)) {
                return;
            }
            this._handle_drop_items(drop_items, ev);
        },

        /**
         * TODO: Change the name to follow the standard in new versions
         *
         * @private
         * @param {MouseEvent} ev
         */
        _get_drop_items: function (ev) {
            let drop_items = [];
            if (this._get_record_id()) {
                const dataTransfer = ev.originalEvent.dataTransfer;
                drop_items = _.filter(
                    dataTransfer.files,
                    (item) =>
                        _.isEmpty(this._drop_allowed_types) ||
                        _.contains(this._drop_allowed_types, item.type)
                );
            }
            return drop_items;
        },

        /**
         * TODO: Change the name to follow the standard in new versions
         *
         * @private
         * @param {Array} drop_items
         * @param {MouseEvent} ev
         */
        // eslint-disable-next-line no-unused-vars
        _handle_drop_items: function (drop_items, ev) {
            // Do something here, for example call the helper function below
            // e is the on_load_end handler for the FileReader above,
            // so e.target.result contains an ArrayBuffer of the data
        },

        /**
         * TODO: Change the name to follow the standard in new versions
         *
         * @private
         * @param {Object} file
         * @param {FileReader} reader
         * @param {String} res_model
         * @param {Number} res_id
         * @param {Object} extra_data
         */
        _create_attachment: function (file, reader, res_model, res_id, extra_data) {
            // Helper to upload an attachment and update the sidebar
            var self = this;
            return this._rpc({
                model: "ir.attachment",
                method: "create",
                args: [
                    _.extend(
                        {
                            name: file.name,
                            datas: base64js.fromByteArray(
                                new Uint8Array(reader.result)
                            ),
                            res_model: res_model,
                            res_id: res_id,
                        },
                        extra_data
                    ),
                ],
            }).then(() => {
                // Find the chatter among the children, there should be only
                // one
                self.trigger_up("reload", {
                    keepChanges: true,
                    onSuccess: this._update_overlay.bind(this),
                });
            });
        },

        /**
         * TODO: Change the name to follow the standard in new versions
         *
         * @private
         * @param {ErrorEvent} ev
         */
        _file_reader_error_handler: function (ev) {
            console.error(ev);
        },

        /**
         * TODO: Change the name to follow the standard in new versions
         *
         * @private
         * @param {Object} item
         */
        _handle_file_drop_attach: function (item) {
            if (!item || !(item instanceof Blob)) {
                return;
            }
            const res_model = this.renderer.state.model;
            const res_id = this.renderer.state.res_id;
            const reader = new FileReader();
            reader.onloadend = this._create_attachment.bind(
                this,
                item,
                reader,
                res_model,
                res_id,
                undefined
            );
            reader.onerror = this._file_reader_error_handler.bind(this);
            reader.readAsArrayBuffer(item);
        },
    };

    // And here we apply the mixin to form views, allowing any files and
    // adding them as attachment
    FormController.include(
        _.extend({}, DropTargetMixin, {
            // Using multi-selector to ensure that is displayed in forms without "sheet"
            // NOTE: Only the inner element would be selected
            _drop_zone_selector: ".o_form_sheet_bg,.o_form_view",
            _handle_drop_items: function (drop_items) {
                _.each(drop_items, this._handle_file_drop_attach, this);
            },
            _get_record_id: function () {
                return this.renderer.state.res_id;
            },
            _checkDragOver: function () {
                return this.renderer._chatterContainerComponent;
            },
        })
    );

    return {
        DropTargetMixin: DropTargetMixin,
    };
});
