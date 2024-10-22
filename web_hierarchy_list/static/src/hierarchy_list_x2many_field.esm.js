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
            hooks: {},
        };
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

    get pagerProps() {
        let list = this.list;
        if (this.parentRecord) {
            list = this.childrenModel.root;
        }
        return {
            offset: list.offset,
            limit: list.limit,
            total: list.count,
            onUpdate: async ({offset, limit}) => {
                const initialLimit = this.list.limit;
                const leaved = await list.leaveEditMode();
                if (leaved) {
                    let adjustment_due_to_limit = 0;
                    if (
                        initialLimit === limit &&
                        initialLimit === this.list.limit + 1
                    ) {
                        // Unselecting the edited record might have abandonned it. If the page
                        // size was reached before that record was created, the limit was temporarily
                        // increased to keep that new record in the current page, and abandonning it
                        // decreased this limit back to it's initial value, so we keep this into
                        // account in the offset/limit update we're about to do.
                        adjustment_due_to_limit -= 1;
                    }
                    await list.load({
                        limit: limit + adjustment_due_to_limit,
                        offset: offset + adjustment_due_to_limit,
                    });
                }
            },
            withAccessKey: false,
        };
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
            limit:
                (this.childrenModel.root && this.childrenModel.root.limit) ||
                this.archInfo.limit,
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
