// Dropzone Configuration
// eslint-disable-next-line no-undef
Dropzone.autoDiscover = false;

// eslint-disable-next-line no-undef
lightbox.option({
    resizeDuration: 200,
    wrapAround: true,
    fitImagesInViewport: true,
    albumLabel: 'info@sunflowerweb.nl',
});

openerp.web_drag_drop = function (instance) {
    "use strict";
    var _t = instance.web._t;
    instance.web.FormView.include({
        events: _.extend({}, instance.web.FormView.prototype.events, {
            'click button.oe_download_attachment': 'download_attachment',
            'click button.oe_delete_attachment': 'delete_attachment',
            'click div.oe_delete_all_attachments': 'delete_all_attachments',
            'focus button.oe_view_image_attachment': 'view_image_attachment',
        }),

        /*
        * Added the main initialization here so that each time the form
        * state is changed we initialize dropzone and allow drag drop
        * functionality to be enable. This is more of an injected code ;-p
        * Leaving it to OCA members to discuss be implementation otherwise the
        * code works.
        *  */
        do_push_state: function () {
            this._super.apply(this, arguments);
            this.attachments_main = this.$el.find('.oe_attached');
            this.attachments_container = this.$el.find('.oe_attached_files');
            this.drag_drop_data = {
                model: arguments[0].model || this.model,
                res_id: arguments[0].id || this.datarecord.id,
            };
            var model = this.drag_drop_data.model;
            var res_id = this.drag_drop_data.res_id;
            // Check if dropzone is already attached.
            if (!this.$('.dz-button').is(':visible') &&
                (this.dataset || arguments.length)) {
                this.initialize_drag_drop(model, res_id);
            }
            this.get_attached_files(res_id, model);
        },
        initialize_drag_drop: function (model, res_id) {
            var self = this;
            return this.$el.find('.oe_drag_drop').dropzone({
                paramName: 'ufile',
                url: '/web/binary/upload_attachment',
                params: {
                    session_id: openerp.session.override_session,
                    callback: '',
                    model: model,
                    id: res_id,
                },
                success: function () {
                    var file_name = this.files[0].name;
                    self.do_notify(_t("Success"),
                        _t("file " + file_name + " was added successfully!"));
                    location.reload();
                },
                error: function () {
                    var file_name = this.files[0].name;
                    self.do_notify(_t("Error"),
                        _t("An error occurred while uploading file " +
                            file_name + "."));
                },
            });

        },
        get_attached_files: function (res_id, model) {
            var self = this;
            this.attachments_container.empty();
            return new instance.web.Model("ir.attachment")
                .get_func("search_read")([
                    ['res_id', '=', res_id], ['res_model', '=', model]], [])
                .pipe(function (attachments) {
                    if (attachments.length) {
                        var list = '';
                        _.each(attachments, function (attachment) {
                            list += String('<li class="col-md-3 ' +
                                'list-group-item list-group-item-action" ' +
                                'id="' + attachment.id + '">' +
                                attachment.name) + '<button id="' +
                                attachment.id + '" class="btn fa fa-download ' +
                                'oe_download_attachment"/>' +
                                '<button id="' + attachment.id + '" ' +
                                'class="btn fa fa-trash ' +
                                'oe_delete_attachment"/>';
                            var is_image = new RegExp(
                                /\.(jpg|jpeg|png|gif)$/g).test(
                                attachment.datas_fname);
                            if (is_image) {
                                list += '<button id="'+attachment.id+'" ' +
                                    'class="btn fa ' +
                                    'fa-eye oe_view_image_attachment" ' +
                                    'data-id="'+ attachment.datas+'"/>';
                            }
                            list += '</li>';
                        });
                        self.attachments_container.append(list);
                        if (self.attachments_main.is(':hidden')) {
                            self.attachments_main.css({'display': 'block'});
                        }
                    } else {
                        if (self.attachments_main.is(':visible'))
                        { self.attachments_main.css({'display': 'none'}); }
                    }
                });

        },
        view_image_attachment: function (ev) {
            var image_container = this.$(ev.target);
            var img = ev.target.dataset.id;
            var file_name = ev.target.parentElement.textContent || 'file';
            var ext = file_name.split('.')[1] || 'png';
            var image = 'data:image/'+ext+';base64,';
            image += img;
            var $content = '<div class="container"><a href="'+image+'" ' +
                'data-lightbox="image-1" data-title="'+file_name+'" ' +
                'data-alt="image">' +
                '<img style="height: 150px; width: 150px;" src="'+image+'" ' +
                'alt="image"/></a></div>';
            image_container.popover({
                placement: 'top',
                trigger: 'click',
                title: file_name,
                html: true,
                // eslint-disable-next-line max-len
                content: $content,
                container: this.$(ev.target),
            });
        },
        delete_all_attachments: function () {
            var self = this;
            var model = this.drag_drop_data.model;
            var res_id = this.drag_drop_data.res_id;
            return new instance.web.Model("ir.attachment")
                .get_func("search_read")([
                    ['res_id', '=', res_id], ['res_model', '=', model]], [])
                .pipe(function (attachments) {
                    if (attachments.length) {
                        var _ids = attachments.map(attachment => attachment.id);
                        new instance.web.Model('ir.attachment')
                            .call('unlink', [_ids]).then(function () {
                                self.do_notify(_t('Success'),
                                    _t('All attachments have been removed'));
                                location.reload();
                            });
                    }
                });
        },
        delete_attachment: function (ev) {
            var self = this;
            var id = parseInt(ev.target.id, 10) || false;
            var file_name = ev.target.parentElement.textContent || 'file';
            return new instance.web.Model('ir.attachment')
                .call('unlink', [id]).then(function () {
                    self.do_notify(_t('Success'),
                        _t(file_name + ' has been removed'));
                    location.reload();
                });
        },
        download_attachment: function (ev) {
            var id = parseInt(ev.target.id, 10) || false;
            var file_name = ev.target.parentElement.textContent || 'Save file';
            if (id) {
                var download_url = instance.session.url('/web/binary/saveas', {
                    model: 'ir.attachment',
                    field: 'datas',
                    filename_field: 'datas_fname',
                    id: id,
                });
                if (download_url) {
                    var content = '<i class="fa fa-save" ' +
                        'style="font-size:20px;"/> <a href="' + download_url +
                        '">' + file_name + '</a>';
                }
                return new instance.web.Dialog(this,
                    {
                        title: 'Download Attachment',
                        buttons: [
                            {
                                text: _t("Close"),
                                click: function () {
                                    this.parents('.modal').modal('hide');
                                },
                            },
                        ],
                    },
                    $('<div>').html(content)).open();
            }
            return this.do_notify(_t("Download not possible, try refreshing"));
        },
    });

};
