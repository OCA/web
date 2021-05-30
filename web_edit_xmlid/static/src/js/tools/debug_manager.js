odoo.define('web_edit_xmlid.DebugManager', function (require) {
"use strict";

var dialogs = require('web.view_dialogs');
var core = require('web.core');
var Dialog = require('web.Dialog');
var field_utils = require('web.field_utils');
var session = require('web.session');

var DebugManager = require('web.DebugManager');

var QWeb = core.qweb;
var _t = core._t;

/**
 * Rewrite of the method "get_metadata".
 * Two buttons are added, one to create an XML ID if it does not already exist,
 * and another to edit this XML ID using a classic Form.
 */
DebugManager.include({
    get_metadata: function () {
        var self = this;
        var selectedIDs = this._controller.getSelectedIds();
        if (!selectedIDs.length) {
            console.warn(_t("No metadata available"));
            return;
        }
        this._rpc({
            model: this._action.res_model,
            method: 'get_metadata',
            args: [selectedIDs],
        }).done(function (result) {
            var metadata = result[0];
            metadata.creator = field_utils.format.many2one(metadata.create_uid);
            metadata.lastModifiedBy = field_utils.format.many2one(metadata.write_uid);
            var createDate = field_utils.parse.datetime(metadata.create_date);
            metadata.create_date = field_utils.format.datetime(createDate);
            var modificationDate = field_utils.parse.datetime(metadata.write_date);
            metadata.write_date = field_utils.format.datetime(modificationDate);
            var dialog = new Dialog(this, {
                title: _.str.sprintf(_t("Metadata (%s)"), self._action.res_model),
                size: 'medium',
                $content: QWeb.render('WebClient.DebugViewLog', {
                    perm: metadata,
                })
            });
            dialog.open().opened(function () {
                dialog.$el.on('click', 'a[data-action="toggle_noupdate"]', function (ev) {
                    ev.preventDefault();
                    self._rpc({
                        model: 'ir.model.data',
                        method: 'toggle_noupdate',
                        args: [self._action.res_model, metadata.id]
                    }).then(function (res) {
                        dialog.close();
                        self.get_metadata();
                    })
                });
                dialog.$el.on('click', 'a[data-action="edit_xmlid"]', function (ev) {
                    ev.preventDefault();
                    var domain = [
                        ['model', '=', self._action.res_model],
                        ['res_id', '=', metadata.id]
                    ];
                    self._rpc({
                        model: 'ir.model.data',
                        method: 'search',
                        args: [domain],
                        limit: 1,
                    }).then(function (res) {
                        var xmlid_id = Number(res[0])
                        self._rpc({
                            model: 'ir.model.data',
                            method: 'get_formview_id',
                            args: [[xmlid_id]],
                        }).then(function (viewId) {
                            new dialogs.FormViewDialog(self, {
                                res_model: 'ir.model.data',
                                res_id: xmlid_id,
                                context: session.user_context,
                                title: _t("Edit XML ID"),
                                view_id: viewId,
                                on_saved: function () {
                                    dialog.close();
                                    self.get_metadata();
                                },
                            }).open().on('closed', self, function () {
                                //
                            });
                        })
                    })
                });
                dialog.$el.on('click', 'a[data-action="create_xmlid"]', function (ev) {
                    ev.preventDefault();
                    self._rpc({
                        model: self._action.res_model,
                        method: 'ensure_xml_id',
                        args: [metadata.id]
                    }).then(function (res) {
                        dialog.close();
                        self.get_metadata();
                    })
                });
            })
        });
    },
});

});
