// Copyright 2018 Therp BV <https://therp.nl>
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
/* global Uint8Array base64js*/

odoo.define("web_drop_target", function (require) {
    "use strict";

    var FormController = require("web.FormController");
    var core = require("web.core");
    var qweb = core.qweb;

    // This is the main contribution of this addon: A mixin you can use
    // To make some widget a drop target. Read on how to use this yourself
    var DropTargetMixin = {
        // Add the mime types you want to support here, leave empty for
        // All types. For more control, override _get_drop_items in your class
        _drop_allowed_types: [],

        _drop_overlay: null,

        start: function () {
            var result = this._super.apply(this, arguments);
            this.$el.on("drop.widget_events", this.proxy("_on_drop"));
            this.$el.on("dragenter.widget_events", this.proxy("_on_dragenter"));
            this.$el.on("dragover.widget_events", this.proxy("_on_dragenter"));
            this.$el.on("dragleave.widget_events", this.proxy("_on_dragleave"));
            return result;
        },

        _on_drop: function (e) {
            if (!this._drop_overlay) {
                return;
            }
            var drop_items = this._get_drop_items(e);
            e.preventDefault();
            this._remove_overlay();
            if (!drop_items) {
                return;
            }
            this._handle_drop_items(drop_items, e);
        },

        _on_dragenter: function (e) {
            e.preventDefault();
            this._add_overlay();
            return false;
        },

        _on_dragleave: function (e) {
            this._remove_overlay();
            e.preventDefault();
        },

        _get_drop_items: function (e) {
            if (this._get_record_id()) {
                var self = this,
                    dataTransfer = e.originalEvent.dataTransfer,
                    drop_items = [];
                _.each(dataTransfer.files, function (item) {
                    if (
                        _.contains(self._drop_allowed_types, item.type) ||
                        _.isEmpty(self._drop_allowed_types)
                    ) {
                        drop_items.push(item);
                    }
                });
                return drop_items;
            }
            return null;
        },

        // eslint-disable-next-line no-unused-vars
        _handle_drop_items: function (drop_items, e) {
            // Do something here, for example call the helper function below
            // e is the on_load_end handler for the FileReader above,
            // so e.target.result contains an ArrayBuffer of the data
        },

        _create_attachment: function (file, reader, e, res_model, res_id, extra_data) {
            // Helper to upload an attachment and update the sidebar
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
                        extra_data || {}
                    ),
                ],
            });
        },

        _file_reader_error_handler: function (e) {
            console.error(e);
        },

        _handle_file_drop_attach: function (item, e, res_model, res_id, extra_data) {
            var self = this;
            var file = item;
            if (!file || !(file instanceof Blob)) {
                return;
            }
            var reader = new FileReader();
            reader.onloadend = self.proxy(
                _.partial(
                    self._create_attachment,
                    file,
                    reader,
                    e,
                    res_model,
                    res_id,
                    extra_data
                )
            );
            reader.onerror = self.proxy("_file_reader_error_handler");
            reader.readAsArrayBuffer(file);
        },

        _get_record_id: function () {
            // Implement when including this mixin. Return the record ID.
            console.log("'_get_record_id': Not Implemented");
            return false;
        },

        _add_overlay: function () {
            var self = this;
            if (!this._drop_overlay) {
                var o_content = jQuery(".o_content"),
                    view_manager = jQuery(".o_view_manager_content");
                this._drop_overlay = jQuery(
                    qweb.render("web_drop_target.drop_overlay", {
                        id: self._get_record_id(),
                    })
                );
                var o_content_position = o_content.position();
                this._drop_overlay.css({
                    top: o_content_position.top,
                    left: o_content_position.left,
                    width: view_manager.width(),
                    height: view_manager.height(),
                });
                if (!this._get_record_id()) {
                    this._drop_overlay.css("background", "#FF000020");
                }
                o_content.append(this._drop_overlay);
            }
        },

        _remove_overlay: function () {
            if (this._drop_overlay) {
                this._drop_overlay.remove();
                this._drop_overlay = null;
            }
        },
    };

    // And here we apply the mixin to form views, allowing any files and
    // adding them as attachment
    FormController.include(
        _.extend(DropTargetMixin, {
            // eslint-disable-next-line no-unused-vars
            _handle_drop_items: function (drop_items, e) {
                var self = this;
                _.each(drop_items, function (item, e) {
                    return self._handle_file_drop_attach(
                        item,
                        e,
                        self.renderer.state.model,
                        self.renderer.state.res_id
                    );
                });
            },
            _get_record_id: function () {
                return this.renderer.state.res_id;
            },
        })
    );

    return {
        DropTargetMixin: DropTargetMixin,
    };
});
