openerp.web_export_streamed = function(instance) {
var QWeb = instance.web.qweb,
      _t = instance.web._t;
instance.web.DataExport = instance.web.DataExport.extend({
    on_click_export_data: function() {
        var self = this;
        var exported_fields = this.$el.find('#fields_list option').map(function () {
            // DOM property is textContent, but IE8 only knows innerText
            return {name: self.records[this.value] || this.value,
                    label: this.textContent || this.innerText};
        }).get();

        if (_.isEmpty(exported_fields)) {
            alert(_t("Please select fields to export..."));
            return;
        }
        exported_fields.unshift({name: 'id', label: 'External ID'});

        var export_format = this.$el.find("#export_format").val();

        var export_all = '';
        if (!this.ids_to_export && (export_format === "csv" || export_format === "xls")) {
            export_all = "_all";
        }

        instance.web.blockUI();
        this.session.get_file({
            url: '/web/export/' + export_format + export_all,
            data: {data: JSON.stringify({
                model: this.dataset.model,
                fields: exported_fields,
                ids: this.ids_to_export,
                domain: this.domain,
                context: this.dataset.context,
                import_compat: !!this.$el.find("#import_compat").val(),
            })},
            complete: instance.web.unblockUI,
        });
    }
});

};
