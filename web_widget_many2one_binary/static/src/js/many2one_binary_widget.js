odoo.define('web_widget_many2one_binary.many2one_binary_widget', function (require) {
"use strict";

var ControlPanel = require('web.ControlPanel');
var core = require('web.core');
var data = require('web.data');
var Dialog = require('web.Dialog');
var common = require('web.form_common');
var ListView = require('web.ListView');
//var require('web.ListEditor'); // one must be sure that the include of ListView are done (for eg: add start_edition methods)
var Model = require('web.DataModel');
var session = require('web.session');
var utils = require('web.utils');
var ViewManager = require('web.ViewManager');
var form = require('web.form_relational');

var _t = core._t;
var QWeb = core.qweb;
var COMMANDS = common.commands;
var list_widget_registry = core.list_widget_registry;
var FieldManytoOneBinary = core.form_widget_registry.get('many2one_binary');

/**
 * Widget for (many2one field) to upload one file at a time and display in list.
 * The user can delete his files.
 * Options on attribute ; "blockui" {Boolean} block the UI or not during the file is uploading
 */
var FieldMany2OneBinarySingleFiles = common.AbstractField.extend(common.CompletionFieldMixin, common.ReinitializeFieldMixin, {
    template: "FieldBinaryFileUploaderSingle",
    events: {
        'click .o_attach': function(e) {
            this.$('.o_form_input_file').click();
        },
        'change .o_form_input_file': function(e) {
            e.stopPropagation();

            var $target = $(e.target);
            var value = $target.val();

            if(value !== '') {
                if(this.data[0] && this.data[0].upload) { // don't upload more of one file in same time
                    return false;
                }

                var filename = value.replace(/.*[\\\/]/, '');
                for(var id in this.get('value')) {
                    // if the files exits, delete the file before upload (if it's a new file)
                    if(this.data[id] && (this.data[id].filename || this.data[id].name) == filename && !this.data[id].no_unlink) {
                        this.ds_file.unlink([id]);
                    }
                }

                if(this.node.attrs.blockui > 0) { // block UI or not
                    framework.blockUI();
                }

                // TODO : unactivate send on wizard and form

                // submit file
                this.$('form.o_form_binary_form').submit();
                this.$(".oe_fileupload").hide();
                // add file on data result
                this.data[0] = {
                    id: 0,
                    name: filename,
                    filename: filename,
                    url: '',
                    upload: true,
                };
            }
        },
        'click .oe_delete': function(e) {
            e.preventDefault();
            e.stopPropagation();

            var file_id = $(e.currentTarget).data("id");
            if(file_id) {
                //var files = _.without(this.get('value'), file_id);
                var files;
                if(this.data[file_id].no_unlink) {
                    this.ds_file.unlink([file_id]);
                }
                this.$el.find('.oe_attachment').remove();
                this.set({'value': undefined});
            }
        },
    },
    init: function(field_manager, node) {
        this._super.apply(this, arguments);
        this.session = session;
        if(this.field.type != "many2one" || this.field.relation != 'ir.attachment') {
            throw _.str.sprintf(_t("The type of the field '%s' must be a many2one field with a relation to 'ir.attachment' model."), this.field.string);
        }
        this.data = {};
        this.set_value([]);
        this.ds_file = new data.DataSetSearch(this, 'ir.attachment');
        this.fileupload_id = _.uniqueId('oe_fileupload_temp');
        $(window).on(this.fileupload_id, _.bind(this.on_file_loaded, this));
    },
    get_file_url: function(attachment) {
        return '/web/content/' + attachment.id + '?download=true';
    },
    read_name_values : function() {
        var self = this;
        var values;
        var record_id = this.get('value') && this.get('value')[0];
        if (!record_id)
            var record_id = this.get('value') || parseInt(Object.keys(self.data)[0]);

        if(record_id) {
            return this.ds_file.call(
                'read', [record_id, ['id', 'name', 'datas_fname', 'mimetype']])
                .then(function (datas) {
                     _.each(datas, function(data) {
                        data.no_unlink = true;
                        data.url = self.get_file_url(data);
                        self.data[data.id] = data;
                        values = data;
                    });
                    return values;
                });
        } else {
            return $.when(values);
        }
    },
    render_value: function() {
        var self = this;
        this.read_name_values().then(function (ids) {
            self.$('.oe_placeholder_files, .oe_attachments')
                .replaceWith($(QWeb.render('FieldBinaryFileUploaderSingle.files', {'widget': self, 'values': [ids]})));

            // reinit input type file
            var $input = self.$('.o_form_input_file');
            $input.after($input.clone(true)).remove();
            self.$(".oe_fileupload").show();

            // display image thumbnail
            self.$(".o_image[data-mimetype^='image']").each(function () {
                var $img = $(this);
                if (/gif|jpe|jpg|png/.test($img.data('mimetype')) && $img.data('src')) {
                    $img.css('background-image', "url('" + $img.data('src') + "')");
                }
            });
            if (self.$el.find('.oe_attachments .oe_attachment').length > 0)
                self.$el.find('.oe_add').hide();
            else
                self.$el.find('.oe_add').show();
        });
    },
    on_file_loaded: function(e, result) {
        if(this.node.attrs.blockui > 0) { // unblock UI
            framework.unblockUI();
        }

        if(result.error || !result.id) {
            this.do_warn(_t('Uploading Error'), result.error);
            delete this.data[0];
        } else {
            if(this.data[0] && this.data[0].filename === result.filename && this.data[0].upload) {
                delete this.data[0];
            }
            result.url = this.get_file_url(result);
            this.data[result.id] = result;
            this.set({value: result.id});
        }
        this.render_value();
    },
});
core.form_widget_registry
    .add('many2one_binary', FieldMany2OneBinarySingleFiles)
});
