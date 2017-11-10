odoo.define('web_paste_image.FieldBinaryImage', function(require) {
    "use strict";

    var core = require('web.core');
    var FieldBinaryImage = core.form_widget_registry.get('image');

    FieldBinaryImage.include({
        initialize_content: function() {
            var self = this;
            this._super();

            function handlePaste(event) {
                var items = (event.clipboardData || event.originalEvent.clipboardData).items;
                if (items) {
                    var blob = null;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") === 0) {
                            blob = items[i].getAsFile();
                            break;
                        };
                    };
                    if (blob !== null) {
                        var filereader = new FileReader();
                        filereader.readAsDataURL(blob);
                        filereader.onloadend = function(upload) {
                            var data = upload.target.result;
                            data = data.split(',')[1];
                            self.on_file_uploaded(blob.size, 'paste_image', blob.type, data);
                        };
                    };
                };
            };
            this.$('.o_paste_image').on("paste", handlePaste);
        }
    });

});
