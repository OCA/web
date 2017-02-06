/* Copyright 2017 Onestein
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_chatter_paste', function (require) {
"use strict";
    var core = require('web.core'),
        composer = require('mail.composer');

    composer.BasicComposer.include({
        start: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            this.$('.o_composer_text_field').bind('drop', function(e) {
                e.stopPropagation();
                e.preventDefault();
                var files = e.originalEvent.dataTransfer.files;
                var i = 0;

                var next = function() {
                    $(window).off(self.fileupload_id, next);
                    i++;
                    upload();
                }

                var upload = function() {
                    if (files.length <= i) return;
                    var reader = new FileReader();
                    reader.onload = function() {
                        $(window).on(self.fileupload_id, next);
                        self.add_as_attachment(reader.result, files[i].name);
                    }
                    reader.readAsDataURL(files[i]);
                }
                upload();
            });
            this.$('.o_composer_text_field').bind('paste', function(e) {
                if (!e.originalEvent.clipboardData.items) return;
                var items = e.originalEvent.clipboardData.items;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.type != 'image/png') continue;
                    var reader = new FileReader();
                    reader.onload = function() {
                        self.add_as_attachment(reader.result, _.uniqueId('pasted_file') + '.png');
                    }
                    reader.readAsDataURL(item.getAsFile());
                }
            });
            return res;
        },
        add_as_attachment: function(data, filename, cb) {
            //Fetch mimetype and base64
            var mimetype = data.substring(5, data.indexOf(';'));
            var base64_data = data.substr(data.indexOf(',') + 1, data.length);

            //Change and submit form
            this.prepare_form();
            this.$('form.o_form_binary_form input.filename').val(filename);
            this.$('form.o_form_binary_form input.content').val(base64_data);
            this.$('form.o_form_binary_form input.mimetype').val(mimetype);

            this.$('form.o_form_binary_form').submit();
            this.reverse_form();

            var attachments = this.get('attachment_ids');
            this.$attachment_button.prop('disabled', true);
            attachments.push({
                'id': 0,
                'name': _.uniqueId('attachment_name'),
                'filename': filename,
                'url': filename,
                'upload': true,
                'mimetype': '',
            });
        },
        prepare_form: function() {
            //Change action
            this.$('form.o_form_binary_form').attr('action', '/web_chatter_paste/upload_attachment');

            //Remove ufile
            this.$('form.o_form_binary_form input.o_form_input_file').remove();

            //Add hidden input content
            var $content = $('<input type="hidden" name="content" class="content" />');
            this.$('form.o_form_binary_form').append($content);

            //Add hidden input filename
            var $filename = $('<input type="hidden" name="filename" class="filename" />');
            this.$('form.o_form_binary_form').append($filename);

            //Add hidden input filename
            var $mimetype = $('<input type="hidden" name="mimetype" class="mimetype" />');
            this.$('form.o_form_binary_form').append($mimetype);
        },
        reverse_form: function() {
            //Change action
            this.$('form.o_form_binary_form').attr('action', '/web/binary/upload_attachment');

            //Remove new input
            this.$('form.o_form_binary_form input.content').remove();
            this.$('form.o_form_binary_form input.filename').remove();
            this.$('form.o_form_binary_form input.mimetype').remove();

            //Restore old input
            var $ufile = $('<input class="o_form_input_file" name="ufile" type="file" />');
            this.$('form.o_form_binary_form').append($ufile);

        }
    });
});
