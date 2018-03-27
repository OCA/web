odoo.define('web_timeline.TimelineController', function (require) {
"use strict";

var AbstractController = require('web.AbstractController');
var QuickCreate = require('web.CalendarQuickCreate');
var dialogs = require('web.view_dialogs');
var Dialog = require('web.Dialog');
var core = require('web.core');

var _t = core._t;
var QWeb = core.qweb;

var CalendarController = AbstractController.extend({
    custom_events: _.extend({}, AbstractController.prototype.custom_events, {
        onUpdate: '_onUpdate',
    }),
    /**
     * @override
     * @param {Widget} parent
     * @param {AbstractModel} model
     * @param {AbstractRenderer} renderer
     * @param {Object} params
     */
    init: function (parent, model, renderer, params) {
        this._super.apply(this, arguments);
        this.open_popup_action = params.open_popup_action;
    },

    _onUpdate: function(event) {
        var self = this;
        this.renderer = event.data.renderer;
        var rights = event.data.rights;
        var item = event.data.item;
        var callback = event.data.callback;
        var id = item.evt.id;
        var title = item.evt.__name;
        if (!this.open_popup_action) {
            mode = 'readonly';
            if (rights.write) {
                mode = 'edit';
            }
            this.trigger_up('switch_view', {
                view_type: 'form',
                res_id: parseInt(id).toString() == id ? parseInt(id) : id,
                mode: mode,
                model: this.model.modelName,
            });
        }
        else {
            var dialog = new dialogs.FormViewDialog(this, {
                res_model: this.model.modelName,
                res_id: parseInt(id).toString() == id ? parseInt(id) : id,
                context: this.getSession().user_context,
                title: title,
                view_id: +this.open_popup_action,
            }).open();
            dialog.on('write_completed', this, this.write_completed);
        }
    },

    write_completed: function (id) {
        this.reload();
    },
});

return CalendarController;
});

