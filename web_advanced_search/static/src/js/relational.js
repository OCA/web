odoo.define("web_advanced_search.RelationalOwl", function (require) {
    "use strict";

    const BasicModel = require("web.BasicModel");
    const patchMixin = require("web.patchMixin");
    const {ComponentAdapter} = require("web.OwlCompatibility");
    const relationalFields = require("web.relational_fields");
    const FieldMany2One = relationalFields.FieldMany2One;
    const FieldManagerMixin = require("web.FieldManagerMixin");
    const {useListener} = require("web.custom_hooks");
    const {Component} = owl;
    const {xml} = owl.tags;

    const AdvancedSearchWidget = FieldMany2One.extend(FieldManagerMixin, {
        init: function (parent) {
            const field = parent.__owl__.parent.field;
            const model = new BasicModel(field.relation);
            // Create dummy record with only the field the user is searching
            const params = {
                fieldNames: [field.name],
                modelName: field.relation,
                context: field.context,
                type: "record",
                viewType: "default",
                fieldsInfo: {
                    default: {},
                },
                fields: {
                    [field.name]: _.omit(
                        field,
                        // User needs all records, to actually produce a new domain
                        "domain",
                        // Onchanges make no sense in this context, there's no record
                        "onChange"
                    ),
                },
            };
            if (field.type.endsWith("2many")) {
                // X2many fields behave like m2o in the search context
                params.fields[field.name].type = "many2one";
            }
            params.fieldsInfo.default[field.name] = {};
            // Emulate `model.load()`, without RPC-calling `default_get()`
            this.dataPointID = model._makeDataPoint(params).id;
            model.generateDefaultValues(this.dataPointID, {});
            this._super(parent, field.name, this._get_record(model), {
                mode: "edit",
                attrs: {
                    options: {
                        no_create_edit: true,
                        no_create: true,
                        no_open: true,
                        no_quick_create: true,
                    },
                },
            });
            FieldManagerMixin.init.call(this, model);
        },
        _get_record: function (model) {
            return model.get(this.dataPointID);
        },
        /**
         * @override
         */
        _confirmChange: function (id, fields, event) {
            this.trigger_up("m2xchange", {
                data: event.data,
                changes: event.data.changes[fields[0]],
                field: fields[0],
            });
            this.dataPointID = id;
            return this.reset(this._get_record(this.model), event);
        },
    });
    /**
     * A search field for relational fields.
     *
     * It implements and extends the `FieldManagerMixin`, and acts as if it
     * were a reduced dummy controller. Some actions "mock" the underlying
     * model, since sometimes we use a char widget to fill related fields
     * (which is not supported by that widget), and fields need an underlying
     * model implementation, which can only hold fake data, given a search view
     * has no data on it by definition.
     */
    class Relational extends Component {
        // eslint-disable-next-line no-unused-vars
        constructor(parent, component, props) {
            super(...arguments);
            this.field = parent.state.field;
            this.operator = parent.state.operator;
            this.FieldWidget = false;
            this.set_widget();
            useListener("operatorChange", this.set_widget);
        }

        /**
         * @override
         */
        set_widget() {
            this.FieldWidget = AdvancedSearchWidget;
        }
    }

    Relational.template = xml`
        <div>
            <ComponentAdapter Component="FieldWidget" />
        </div>`;
    Relational.components = {ComponentAdapter};
    return patchMixin(Relational);
});
