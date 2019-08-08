//Copyright 2019 Therp BV <https://therp.nl>
//License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
odoo.define('web_widget_bpmn', function(require) {
    var core = require('web.core');
    var common = require('web.form_common');
    var _t = core._t;

    var FieldBPMN = common.AbstractField.extend(
            common.ReinitializeFieldMixin, {

        
        build_widget: function(options) {
            return new BpmnJS(options)
        },

        initialize_content: function() {
            var self = this;
            options = {container: this.$el}
            this.bpmnjs = this.build_widget(options);
            if (this.get("effective_readonly")) {
                // we are readonly therefore remove any listeners so that the
                // user will not be able to interact with the widget
                Object.getOwnPropertyNames(
                    this.bpmnjs.get('eventBus')._listeners).forEach(function(
                        entry) {
                        if (entry.match(/^element\..*$/)) {
                            delete self.bpmnjs.get('eventBus')._listeners[
                                entry]
                        }
                    })}
            this.bpmnjs.importXML(this.view.datarecord[this.name]);
            this.bpmnjs.get('canvas').zoom(0.5, 'auto');
            // hide non working search for now
            this.$('.djs-search-container').remove();
            this.$el.css('width', '100%');
        },
        
        commit_value: function() {
            if (!this.get("effective_readonly")) {
                this.store_dom_value()
            }
            return this._super();
        },

        store_dom_value: function () {
            var self = this;
            this.bpmnjs.saveXML(null, function (err, xml) {
                if (err && xml !== undefined) {
                    throw new Error(_t("Could not save the BPMN graph."));
                }
                self.internal_set_value(xml);
            });
        }

    });

    core.form_widget_registry.add('bpmn', FieldBPMN);

    return {
        FieldBPMN: FieldBPMN
    };
});
