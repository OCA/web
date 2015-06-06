openerp.extended_binary_field = function(instance) {
    instance.web.list.Binary.include({
        _format: function (row_data, options) {
            // Relevant changes to the original _format method:
            //  change the 'field' name in the download_url to remove the delay_dummy_ prefix
            var text = _t("Download");
            var value = row_data[this.id].value;
            var download_url;
            download_url = instance.session.url('/web/binary/saveas', {model: options.model, field: this.id.replace('delay_dummy_', ''), id: options.id});
            if (this.filename) {
                download_url += '&filename_field=' + this.filename;
            }
            if (this.filename && row_data[this.filename]) {
                text = _.str.sprintf(_t("Download \"%s\""), instance.web.format_value(
                        row_data[this.filename].value, {type: 'char'}));
            }
            return _.template('<a href="<%-href%>"><%-text%></a>', {
                text: text,
                href: download_url
            });
        }
    });
};


