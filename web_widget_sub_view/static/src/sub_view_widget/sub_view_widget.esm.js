import {
    Component,
    onMounted,
    onWillUnmount,
    useRef,
    useState,
    useSubEnv,
} from "@odoo/owl";
import {Domain} from "@web/core/domain";
import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";
import {View} from "@web/views/view";
import {_t} from "@web/core/l10n/translation";
import {kanbanView} from "@web/views/kanban/kanban_view";
import {listView} from "@web/views/list/list_view";
import {makeContext} from "@web/core/context";
import {registry} from "@web/core/registry";
import {standardWidgetProps} from "@web/views/widgets/standard_widget_props";
import {useService} from "@web/core/utils/hooks";

export class SubViewWidget extends Component {
    static template = "web_widget_sub_view.SubViewWidget";
    static components = {View};
    static props = {
        ...standardWidgetProps,
        resModel: String,
        recordAction: String,
        createAction: {type: String, optional: true},
        context: String,
        domain: String,
        viewType: {type: String, optional: true},
        filter: Boolean,
        groupBy: Boolean,
        favorite: Boolean,
        lazy: Boolean,
        linkButton: Boolean,
        linkDomain: String,
        newButton: Boolean,
    };

    setup() {
        this.action = useService("action");
        this.orm = useService("orm");
        this.dialog = useService("dialog");
        this.notification = useService("notification");
        this.viewContainer = useRef("viewContainer");
        this.state = useState({viewLoaded: !this.props.lazy, viewKey: 0});
        this.intersectionObserver = null;
        useSubEnv({config: {}});

        onMounted(() => {
            if (this.state.viewLoaded || typeof IntersectionObserver === "undefined") {
                this.state.viewLoaded = true;
                return;
            }
            this.intersectionObserver = new IntersectionObserver((entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    this.state.viewLoaded = true;
                    this.intersectionObserver.disconnect();
                    this.intersectionObserver = null;
                }
            });
            this.intersectionObserver.observe(this.viewContainer.el);
        });

        onWillUnmount(() => this.intersectionObserver?.disconnect());
    }

    get context() {
        return makeContext(
            [this.props.context],
            this.props.record.evalContextWithVirtualIds
        );
    }

    get viewProps() {
        const {record} = this.props;
        const searchMenuTypes = [];
        if (this.props.filter) {
            searchMenuTypes.push("filter");
        }
        if (this.props.groupBy) {
            searchMenuTypes.push("groupBy");
        }
        if (this.props.favorite) {
            searchMenuTypes.push("favorite");
        }

        const type = this.props.viewType || (this.env.isSmall ? "kanban" : "list");
        const isSupportedType = ["kanban", "list"].includes(type);
        return {
            display: {
                controlPanel: {
                    "top-left": false,
                    "bottom-left": true,
                },
            },
            searchMenuTypes,
            resModel: this.props.resModel,
            searchViewId: false,
            domain: new Domain(this.props.domain).toList(
                record.evalContextWithVirtualIds
            ),
            context: this.context,
            noBreadcrumbs: true,
            showButtons: true,
            selectRecord: this.selectRecord.bind(this),
            createRecord: this.createRecord.bind(this),
            type,
            ...(isSupportedType
                ? {
                      jsClass: `web_widget_sub_view_${type}`,
                      linkButton: this.props.linkButton,
                      newButton: this.props.newButton,
                  }
                : {}),
            ...(type === "list" ? {allowSelectors: false} : {}),
        };
    }

    async createRecord(options = {}) {
        if (options.linkExisting) {
            return this.openLinkDialog();
        }
        if (this.props.createAction) {
            return this.action.doActionButton({
                name: this.props.createAction,
                type: "action",
                resModel: this.props.record.resModel,
                resId: this.props.record.resId,
                resIds: this.props.record.resIds,
                context: this.context,
                onClose: async () => {
                    await this.props.record.model.root.load();
                    this.props.record.model.notify();
                    this.state.viewKey++;
                },
            });
        }
        return this.action.doActionButton({
            name: "get_formview_action",
            type: "object",
            resModel: this.props.resModel,
            resIds: [],
            context: this.context,
        });
    }

    openLinkDialog() {
        const parentRecord = this.props.record;
        if (!parentRecord.resId) {
            this.notification.add(
                _t("Save this record before linking existing records."),
                {
                    type: "warning",
                }
            );
            return;
        }

        this.dialog.add(SelectCreateDialog, {
            title: _t("Link existing records"),
            resModel: this.props.resModel,
            context: this.context,
            domain: new Domain(this.props.linkDomain).toList(
                parentRecord.evalContextWithVirtualIds
            ),
            multiSelect: true,
            noCreate: true,
            onSelected: (resIds) => this.linkRecords(resIds),
        });
    }

    async linkRecords(resIds) {
        const values = Object.fromEntries(
            Object.entries(this.context)
                .filter(([key]) => key.startsWith("default_"))
                .map(([key, value]) => [key.slice("default_".length), value])
        );
        if (!resIds.length) {
            return;
        }
        if (!Object.keys(values).length) {
            this.notification.add(
                _t(
                    "Set at least one default_* value in the widget context to link records."
                ),
                {type: "warning"}
            );
            return;
        }

        await this.orm.call(this.props.resModel, "write", [resIds, values], {
            context: this.context,
        });
        await this.props.record.model.root.load();
        this.props.record.model.notify();
        this.state.viewKey++;
    }

    async selectRecord(resId) {
        const action = await this.orm.call(
            this.props.resModel,
            this.props.recordAction,
            [[resId]],
            {context: this.context}
        );
        return this.action.doAction(action);
    }
}

const subViewButtonTemplate = "web_widget_sub_view.SubViewButtons";
function makeSubViewDescriptor(view) {
    return {
        ...view,
        props(genericProps, descriptor, envConfig) {
            const {linkButton, newButton, ...viewProps} = genericProps;
            const props = view.props(viewProps, descriptor, envConfig);
            if (!newButton) {
                props.archInfo.activeActions = {
                    ...props.archInfo.activeActions,
                    create: false,
                };
            }
            props.buttonTemplate = linkButton
                ? subViewButtonTemplate
                : view.buttonTemplate;
            return props;
        },
    };
}

registry
    .category("views")
    .add("web_widget_sub_view_list", makeSubViewDescriptor(listView));
registry
    .category("views")
    .add("web_widget_sub_view_kanban", makeSubViewDescriptor(kanbanView));

export const subViewWidget = {
    component: SubViewWidget,
    extractProps: ({attrs}) => ({
        resModel: attrs.model,
        context: attrs.context || "{}",
        recordAction: attrs["open-action"] || "get_formview_action",
        createAction: attrs["create-action"],
        domain: attrs.domain || "[]",
        viewType: attrs["view-type"],
        filter:
            attrs.filter === undefined || ["1", "true", "True"].includes(attrs.filter),
        groupBy:
            attrs["group-by"] === undefined ||
            ["1", "true", "True"].includes(attrs["group-by"]),
        favorite:
            attrs.favorite === undefined ||
            ["1", "true", "True"].includes(attrs.favorite),
        lazy: ["1", "true", "True"].includes(attrs.lazy),
        linkButton:
            attrs.link === undefined || ["1", "true", "True"].includes(attrs.link),
        linkDomain: attrs["link-domain"] || "[]",
        newButton: attrs.new === undefined || ["1", "true", "True"].includes(attrs.new),
    }),
};

registry.category("view_widgets").add("sub_view_widget", subViewWidget);
