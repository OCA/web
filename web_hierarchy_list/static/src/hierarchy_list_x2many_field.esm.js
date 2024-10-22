import {X2ManyField, x2ManyField} from "@web/views/fields/x2many/x2many_field";
import {HierarchyListRenderer} from "./hierarchy_list_renderer.esm";
import {RelationalModel} from "@web/model/relational_model/relational_model";
import {evaluateExpr} from "@web/core/py_js/py";
import {extractFieldsFromArchInfo} from "@web/model/relational_model/utils";
import {registry} from "@web/core/registry";
import {treatHierarchyListArch} from "./hierarchy_list_arch_utils.esm";
import {useService} from "@web/core/utils/hooks";
import {useState} from "@odoo/owl";

export class HierarchyListX2manyField extends X2ManyField {
    static components = {
        ...X2ManyField.components,
        HierarchyListRenderer,
    };
    static template = "web_hierarchy_list.X2ManyField";

    setup() {
        super.setup();
        treatHierarchyListArch(
            this.archInfo,
            this.field.relation,
            this.archInfo.fields
        );

        // Creation and deletion of records is not supported (yet?)
        this.archInfo.activeActions.create = false;
        this.archInfo.activeActions.link = false;
        this.archInfo.activeActions.delete = false;

        this.parentRecord = false;

        const services = {};
        for (const key of RelationalModel.services) {
            services[key] = useService(key);
        }
        services.orm = services.orm || useService("orm");
        this.childrenModel = useState(
            new RelationalModel(this.env, this.modelParams, services)
        );
    }

    get modelParams() {
        const {rawExpand} = this.archInfo;
        const {activeFields, fields} = extractFieldsFromArchInfo(
            this.archInfo,
            this.archInfo.fields
        );

        const modelConfig = {
            resModel: this.field.relation,
            orderBy: this.archInfo.defaultOrderBy || [],
            groupBy: false,
            fields,
            activeFields,
            openGroupsByDefault: rawExpand
                ? evaluateExpr(rawExpand, this.props.record.model.context)
                : false,
        };

        return {
            config: modelConfig,
            state: this.props.state?.modelState,
            groupByInfo: {},
            defaultGroupBy: false,
            defaultOrderBy: this.archInfo.defaultOrder,
            limit: this.archInfo.limit || this.props.limit,
            countLimit: this.archInfo.countLimit,
            hooks: {
                onRecordSaved: this.onRecordSaved.bind(this),
                onWillSaveRecord: this.onWillSaveRecord.bind(this),
                onWillSaveMulti: this.onWillSaveMulti.bind(this),
                onWillSetInvalidField: this.onWillSetInvalidField.bind(this),
            },
        };
    }

    onRecordSaved() {
        console.log("To be implemented");
    }

    onWillSaveRecord() {
        console.log("To be implemented");
    }

    onWillSaveMulti() {
        console.log("To be implemented");
    }

    onWillSetInvalidField() {
        console.log("To be implemented");
    }

    get rendererProps() {
        let props = {};
        if (this.parentRecord) {
            props = {
                archInfo: this.archInfo,
                list: this.childrenModel.root,
                openRecord: this.openRecord.bind(this),
                activeActions: this.archInfo.activeActions,
                onOpenFormView: this.switchToForm.bind(this),
            };
        } else {
            props = super.rendererProps;
        }
        props.activeActions = this.archInfo.activeActions;
        return props;
    }

    async onParentRecordUpdate(parentRecord) {
        this.parentRecord = parentRecord;
        const context = {...this.archInfo.context};
        context[`default_${this.archInfo.parentFieldColumn.name}`] =
            this.parentRecord.resId;
        const params = {
            context,
            domain: [
                [this.archInfo.parentFieldColumn.name, "=", this.parentRecord.resId],
            ],
        };
        await this.childrenModel.load(params);
    }

    async onBreadcrumbReset() {
        this.parentRecord = false;
        this.render();
    }
}

export const hierarchyListX2manyField = {
    ...x2ManyField,
    component: HierarchyListX2manyField,
};

registry.category("fields").add("one2many_hierarchy_list", hierarchyListX2manyField);
