/** @odoo-module **/

import {_t} from "@web/core/l10n/translation";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {registry} from "@web/core/registry";
import {X2ManyField, x2ManyField} from "@web/views/fields/x2many/x2many_field";
import {AutoCompleteListRenderer} from "./list_renderer.esm";

export class M2mInline extends X2ManyField {
    static components = {
        ...x2ManyField.components,
        ListRenderer: AutoCompleteListRenderer,
    };
    static props = {
        ...X2ManyField.props,
        canCreate: {type: Boolean, optional: true},
        canQuickCreate: {type: Boolean, optional: true},
        canCreateEdit: {type: Boolean, optional: true},
        quickUnlink: {type: Boolean, optional: true},
    };
    static defaultProps = {
        canCreate: true,
        canQuickCreate: true,
        canCreateEdit: true,
        quickUnlink: false,
    };

    /**
     * Hack to treat field as one2many
     *
     */
    get isMany2Many() {
        return false;
    }

    get rendererProps() {
        const res = super.rendererProps;
        const newProps = {
            ...res,
            canCreate: this.props.canCreate,
            canQuickCreate: this.props.canQuickCreate,
            canCreateEdit: this.props.canCreateEdit,
            quickUnlink: this.props.quickUnlink,
            createDomain: this.props.createDomain,
            context: this.props.context,
            domain: this.props.domain,
            readonly: this.props.readonly,
        };
        return newProps;
    }
}

export const m2mInline = {
    ...x2ManyField,
    component: M2mInline,
    supportedOptions: [
        {
            label: _t("Disable creation"),
            name: "no_create",
            type: "boolean",
            help: _t(
                "If checked, users won't be able to create records through the autocomplete dropdown at all."
            ),
        },
        {
            label: _t("Disable 'Create' option"),
            name: "no_quick_create",
            type: "boolean",
            help: _t(
                "If checked, users will not be able to create records based on the text input; they will still be able to create records via a popup form."
            ),
        },
        {
            label: _t("Quick Unlink option"),
            name: "quick_unlink",
            type: "boolean",
            help: _t("If checked, users are able to remove records directly."),
        },
    ],
    supportedTypes: ["many2many"],
    extractProps(
        {attrs, relatedFields, viewMode, views, widget, options, string},
        dynamicInfo
    ) {
        const props = x2ManyField.extractProps(
            {attrs, relatedFields, viewMode, views, widget, options, string},
            dynamicInfo
        );
        const hasCreatePermission = attrs.can_create
            ? evaluateBooleanExpr(attrs.can_create)
            : true;
        const noCreate = Boolean(options.no_create);
        const canCreate = noCreate ? false : hasCreatePermission;
        const noQuickCreate = Boolean(options.no_quick_create);
        const quickUnlink = Boolean(options.quick_unlink);
        return {
            ...props,
            canCreate,
            canQuickCreate: canCreate && !noQuickCreate,
            context: dynamicInfo.context,
            domain: dynamicInfo.domain,
            string,
            quickUnlink: quickUnlink,
        };
    },
};
registry.category("fields").add("m2m_inline", m2mInline);
