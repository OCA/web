openerp.web_list_html_widget = function(instance){
    instance.web.list.columns.map['field.html'] = 'instance.web.list.HtmlColumn';

    instance.web.list.HtmlColumn = instance.web.list.Column.extend({
        _format: function (row_data, options) {
            return instance.web.format_value(
                row_data[this.id].value, this, options.value_if_empty);
        }
    });
};
