/** @odoo-module **/

import BasicModel from "web.BasicModel";
import {ComponentAdapter} from "web.OwlCompatibility";
import {FieldMany2One} from "web.relational_fields";
import FieldManagerMixin from "web.FieldManagerMixin";
import {SelectCreateDialog} from "web.view_dialogs";

const {Component} = owl;
const {xml} = owl.tags;

export const FakeMany2oneFieldWidget = FieldMany2One.extend(FieldManagerMixin, {
    /**
     * @override
     */
    init: function (parent) {
        this.componentAdapter = parent;
        const options = this.componentAdapter.props.attrs;
        // Create a dummy record with only a dummy m2o field to search on
        const model = new BasicModel("dummy");
        const params = {
            fieldNames: ["dummy"],
            modelName: "dummy",
            context: {},
            type: "record",
            viewType: "default",
            fieldsInfo: {default: {dummy: {}}},
            fields: {
                dummy: {
                    string: options.string,
                    relation: options.model,
                    context: options.context,
                    domain: options.domain,
                    type: "many2one",
                },
            },
        };
        // Emulate `model.load()`, without RPC-calling `default_get()`
        this.dataPointID = model._makeDataPoint(params).id;
        model.generateDefaultValues(this.dataPointID, {});
        this._super(this.componentAdapter, "dummy", this._get_record(model), {
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
    /**
     * Get record
     *
     * @param {BasicModel} model
     */
    _get_record: function (model) {
        return model.get(this.dataPointID);
    },
    /**
     * @override
     */
    _confirmChange: function (id, fields, event) {
        this.componentAdapter.trigger("change", event.data.changes[fields[0]]);
        this.dataPointID = id;
        return this.reset(this._get_record(this.model), event);
    },
    /**
     * Stop propagation of the autocompleteselect event.
     * Otherwise, the filter's dropdown will be closed after a selection.
     *
     * @override to stop propagating autocompleteselect event
     */
    start: function () {
        this._super(...arguments);
        this.$input.on("autocompleteselect", (event) => event.stopPropagation());
    },
    /**
     * Stop propagation of the 'Search more..' dialog click event.
     * Otherwise, the filter's dropdown will be closed after a selection.
     *
     * @override
     */
    _searchCreatePopup: function (view, ids, context, dynamicFilters) {
        const options = this._getSearchCreatePopupOptions(
            view,
            ids,
            context,
            dynamicFilters
        );
        const dialog = new SelectCreateDialog(
            this,
            _.extend({}, this.nodeOptions, options)
        );
        // Hack to stop click event propagation
        dialog._opened.then(() =>
            dialog.$el
                .get(0)
                .addEventListener("click", (event) => event.stopPropagation())
        );
        return dialog.open();
    },
});

export class FakeMany2oneFieldWidgetAdapter extends ComponentAdapter {
    async updateWidget() {
        /* eslint-disable no-empty-function */
    }
    async renderWidget() {
        /* eslint-disable no-empty-function */
    }
}

/**
 * A record selector widget.
 *
 * Underneath, it implements and extends the `FieldManagerMixin`, and acts as if it
 * were a reduced dummy controller. Some actions "mock" the underlying model, since
 * sometimes we use a char widget to fill related fields (which is not supported by
 * that widget), and fields need an underlying model implementation, which can only
 * hold fake data, given a search view has no data on it by definition.
 *
 * @extends Component
 */
export class RecordPicker extends Component {
    setup() {
        this.attrs = {
            string: this.props.string,
            model: this.props.model,
            domain: this.props.domain,
            context: this.props.context,
        };
        this.FakeMany2oneFieldWidget = FakeMany2oneFieldWidget;
    }
}

RecordPicker.template = xml`
    <div>
        <FakeMany2oneFieldWidgetAdapter
            Component="FakeMany2oneFieldWidget"
            class="d-block"
            attrs="attrs"
        />
    </div>`;
RecordPicker.components = {FakeMany2oneFieldWidgetAdapter};
