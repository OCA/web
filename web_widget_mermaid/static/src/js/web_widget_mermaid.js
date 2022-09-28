odoo.define('web.web_widget_mermaid', function(require) {
    "use strict";

    var core = require('web.core');
    var basic_fields = require('web.basic_fields');
    var field_registry = require('web.field_registry');

    // Calling mermaid.initialize() multiple times is ok.
    // But there's a catch: it will keep the config of previous calls unless
    // explicitly overridden, instead of reverting to the default settings.
    // Therefore we make the default config explicit. This is taken from
    // https://mermaidjs.github.io/#/mermaidAPI?id=mermaidapi-configuration-defaults
    // so try copying from there if you update to a new version of mermaid
    // with new options/defaults.
    // Changes to the original default are marked with comments.

    var defaultConfig = {
        theme: null,  // We define a custom Odoo theme in a stylesheet
        logLevel: 'fatal',
        securityLevel: 'strict',
        startOnLoad: false,  // Rendering is initiated manually
        arrowMarkerAbsolute: false,

        flowchart: {
            htmlLabels: true,
            curve: 'linear',
        },

        sequence: {
            diagramMarginX: 50,
            diagramMarginY: 10,
            actorMargin: 50,
            width: 150,
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
            mirrorActors: true,
            bottomMarginAdj: 1,
            useMaxWidth: true,
            rightAngles: false,
            showSequenceNumbers: false,
        },

        gantt: {
            titleTopMargin: 25,
            barHeight: 20,
            barGap: 4,
            topPadding: 50,
            leftPadding: 75,
            gridLineStartPadding: 35,
            fontSize: 11,
            fontFamily: '"Lucida Grande", Helvetica, Verdana, Arial, '
                        + 'sans-serif',  // Match Odoo's font choices
            numberSectionStyles: 4,
            // Match configured date format
            axisFormat: core._t.database.parameters.date_format,
        }
    };

    var MermaidField = basic_fields.FieldText.extend({
        init: function() {
            this._super.apply(this, arguments);
            this.chartId = _.uniqueId('mermaid_chart_');
        },
        className: 'o_form_field_mermaid',
        _renderReadonly: function() {
            if (!this.value) {
                return;
            }
            var config = _.extend(
                {},
                defaultConfig,
                this.attrs.options
            );
            mermaid.mermaidAPI.initialize(config);
            try {
                mermaid.mermaidAPI.render(
                    this.chartId,
                    this.value,
                    this.$el.html.bind(this.$el)
                );
            } catch (e) {
                this.$el.html($('<pre/>').text(e.message || e.str));
            }
            // Mermaid uses a temporary div for rendering. It doesn't remove
            // it if an error occurs, and perhaps in other cases too, so get
            // rid of it if it's still around. The id is based on the chartId.
            $('#d' + this.chartId).remove();
        },
        _parseValue: function(value) {
            if (this.errorMessage) {
                this.errorMessage.remove();
            }
            try {
                mermaid.parse(value);
            } catch (e) {
                this.errorMessage = $('<pre/>').text(e.message || e.str);
                this.$el.after(this.errorMessage);
                throw e;
            }
            return value;
        },
    });

    field_registry.add('mermaid', MermaidField);

    return {
        MermaidField: MermaidField,
        defaultConfig: defaultConfig,
    };
});
