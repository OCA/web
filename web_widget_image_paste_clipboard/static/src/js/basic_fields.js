odoo.define('web_widget_image_paste_clipboard.FieldBinaryImage', function(require) {
    "use strict";

    var basicFields = require('web.basic_fields');

    basicFields.FieldBinaryImage.include({
        _render: function() {
            this._super.apply(this, arguments);
            var self = this;

            function handlePaste(event) {
                if (self.mode == 'edit') {
                    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
                    var blob = null;
                    if (items) {
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].type.indexOf("image") === 0) {
                                blob = items[i].getAsFile();
                                break;
                            }
                        }
                        if (blob != null) {
                            var filereader = new FileReader();
                            filereader.readAsDataURL(blob);
                            filereader.onloadend = function(upload) {
                                var data = upload.target.result;
                                data = data.split(',')[1];
                                self.on_file_uploaded(blob.size, 'paste_image', blob.type, data);
                            };
                        }
                    }
                }
            }

            this.$('.o_paste_image').on("paste", handlePaste);

        },
    });

});
