openerp.web_exportall = function(openerp) {
var QWeb = openerp.web.qweb,
      _t = openerp.web._t;
openerp.web.DataExport = openerp.web.DataExport.extend({
    on_click_export_data: function() {
        var self = this;
        var exported_fields = this.$element.find('#fields_list option').map(function () {
            // DOM property is textContent, but IE8 only knows innerText
            return {name: self.records[this.value] || this.value,
                    label: this.textContent || this.innerText};
        }).get();

        if (_.isEmpty(exported_fields)) {
            alert(_t("Please select fields to export..."));
            return;
        }

        exported_fields.unshift({name: 'id', label: 'External ID'});
        var export_format = this.$element.find("#export_format").val();
        var export_all = this.$element.find("#export_all_data").val();
        if (export_all === "_all" && !(export_format === "csv" || export_format === "xls")) {
            alert(_t("Exporting all records is only supported for CSV and Excel format currently."));
            return;
        }
        $.blockUI();
        this.session.get_file({
            url: '/web/export/' + export_format + export_all,
            data: {data: JSON.stringify({
                model: this.dataset.model,
                fields: exported_fields,
                ids: this.widget_parent.get_selected_ids().length === 0 ? this.dataset.ids : this.widget_parent.get_selected_ids(),
                domain: this.dataset.domain,
                import_compat: Boolean(
                    this.$element.find("#import_compat").val()),
                context: self.dataset.get_context(),
            })},
            complete: $.unblockUI
        });
    }
});

};