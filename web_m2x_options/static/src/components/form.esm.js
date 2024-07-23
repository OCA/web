/** @odoo-module **/

import {
    Many2ManyTagsField,
    Many2ManyTagsFieldColorEditable,
    many2ManyTagsField,
} from "@web/views/fields/many2many_tags/many2many_tags_field";
import {Many2OneField, many2OneField} from "@web/views/fields/many2one/many2one_field";
import {X2ManyField, x2ManyField} from "@web/views/fields/x2many/x2many_field";

import {Dialog} from "@web/core/dialog/dialog";
import {FormController} from "@web/views/form/form_controller";
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import {Many2OneAvatarField} from "@web/views/fields/many2one_avatar/many2one_avatar_field";
import {Many2OneBarcodeField} from "@web/views/fields/many2one_barcode/many2one_barcode_field";
import {Many2XAutocomplete} from "@web/views/fields/relational_utils";
import {ReferenceField} from "@web/views/fields/reference/reference_field";
import {_t} from "@web/core/l10n/translation";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {isX2Many} from "@web/views/utils";
import {is_option_set} from "@web_m2x_options/components/relational_utils.esm";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";
import {sprintf} from "@web/core/utils/strings";
import {useService} from "@web/core/utils/hooks";

const {Component} = owl;

/**
 *  Patch Many2ManyTagsField
 **/
patch(Many2ManyTagsField.prototype, {
    setup() {
        super.setup();
        this.actionService = useService("action");
    },
    /**
     * @override
     */
    getTagProps(record) {
        const props = super.getTagProps(record);
        props.onClick = (ev) => this.onMany2ManyBadgeClick(ev, record);
        return props;
    },
    async onMany2ManyBadgeClick(event, record) {
        var self = this;
        if (self.props.open) {
            var context = self.context;
            var id = record.resId;
            if (self.props.readonly) {
                event.preventDefault();
                event.stopPropagation();
                const action = await self.orm.call(
                    record.resModel,
                    "get_formview_action",
                    [[id]],
                    {context: context}
                );
                self.actionService.doAction(action);
            } else {
                const view_id = await self.orm.call(
                    record.resModel,
                    "get_formview_id",
                    [[id]],
                    {context: context}
                );

                const write_access = await self.orm.call(
                    record.resModel,
                    "check_access_rights",
                    [],
                    {operation: "write", raise_exception: false}
                );
                var can_write = self.props.canWrite;
                self.dialog.add(FormViewDialog, {
                    resModel: record.resModel,
                    resId: id,
                    context: context,
                    title: _t("Open: ") + self.string,
                    viewId: view_id,
                    mode: !can_write || !write_access ? "readonly" : "edit",
                    onRecordSaved: () => record.model.load(),
                });
            }
        }
    },
});

Many2ManyTagsField.props = {
    ...Many2ManyTagsField.props,
    open: {type: Boolean, optional: true},
    canWrite: {type: Boolean, optional: true},
    nodeOptions: {type: Object, optional: true},
};

const Many2ManyTagsFieldExtractProps = many2ManyTagsField.extractProps;
many2ManyTagsField.extractProps = ({attrs, options, string}, dynamicInfo) => {
    const canOpen = Boolean(options.open);
    const canWrite = attrs.can_write && evaluateBooleanExpr(attrs.can_write);
    return Object.assign(
        Many2ManyTagsFieldExtractProps({attrs, options, string}, dynamicInfo),
        {
            open: canOpen,
            canWrite: canWrite,
            nodeOptions: options,
        }
    );
};

/**
 *  Many2ManyTagsFieldColorEditable
 **/
patch(Many2ManyTagsFieldColorEditable.prototype, {
    async onBadgeClick(event, record) {
        if (this.props.canEditColor && !this.props.open) {
            super.onBadgeClick(event, record);
        }
        if (this.props.open) {
            Many2ManyTagsField.prototype.onMany2ManyBadgeClick.bind(this)(
                event,
                record
            );
        }
    },
});

Many2ManyTagsFieldColorEditable.props = {
    ...Many2ManyTagsFieldColorEditable.props,
    open: {type: Boolean, optional: true},
    canWrite: {type: Boolean, optional: true},
    nodeOptions: {type: Object, optional: true},
};

/**
 *  CreateConfirmationDialog
 *  New customized component for Many2One Field
 **/

class CreateConfirmationDialog extends Component {
    get title() {
        return sprintf(_t("New: %s"), this.props.name);
    }

    async onCreate() {
        await this.props.create();
        this.props.close();
    }
    async onCreateEdit() {
        await this.props.createEdit();
        this.props.close();
    }
}
CreateConfirmationDialog.components = {Dialog};
CreateConfirmationDialog.template =
    "web_m2x_options.Many2OneField.CreateConfirmationDialog";

/**
 *  Many2OneField
 **/

patch(Many2OneField.prototype, {
    setup() {
        super.setup();
        this.ir_options = session.web_m2x_options;
    },

    /**
     * @override
     */
    get Many2XAutocompleteProps() {
        const props = super.Many2XAutocompleteProps;
        return {
            ...props,
            searchLimit: this.props.searchLimit,
            searchMore: this.props.searchMore,
            canCreate: this.props.canCreate,
            nodeOptions: this.props.nodeOptions,
        };
    },

    async openConfirmationDialog(request) {
        var m2o_dialog_opt =
            is_option_set(this.props.nodeOptions.m2o_dialog) ||
            (this.props.nodeOptions.m2o_dialog === undefined &&
                is_option_set(this.ir_options["web_m2x_options.m2o_dialog"])) ||
            (this.props.nodeOptions.m2o_dialog === undefined &&
                this.ir_options["web_m2x_options.m2o_dialog"] === undefined);
        if (this.props.canCreate && this.state.isFloating && m2o_dialog_opt) {
            return new Promise((resolve, reject) => {
                this.addDialog(CreateConfirmationDialog, {
                    value: request,
                    name: this.props.string,
                    create: async () => {
                        try {
                            await this.quickCreate(request);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    },
                    createEdit: async () => {
                        try {
                            await this.quickCreate(request);
                            await this.props.record.model.load();
                            this.openMany2X({
                                resId: this.props.value[0],
                                context: this.user_context,
                            });
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    },
                });
            });
        }
    },
});

const Many2OneFieldExtractProps = many2OneField.extractProps;
many2OneField.extractProps = (
    {attrs, context, decorations, options, string},
    dynamicInfo
) => {
    return Object.assign(
        Many2OneFieldExtractProps(
            {attrs, context, decorations, options, string},
            dynamicInfo
        ),
        {
            searchLimit: options.limit,
            searchMore: options.search_more,
            nodeOptions: options,
        }
    );
};

Many2OneField.props = {
    ...Many2OneField.props,
    searchMore: {type: Boolean, optional: true},
    nodeOptions: {type: Object, optional: true},
};

/**
 * FIXME: find better way to extend props in Many2OneField
 * Override ReferenceField
 * Since extracted/added props: nodeOptions and searchMore into Many2OneField props
 * and this component inherited props from Many2OneField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 */

ReferenceField.props = {
    ...ReferenceField.props,
    searchMore: {type: Boolean, optional: true},
    nodeOptions: {type: Object, optional: true},
};

/**
 * FIXME: find better way to extend props in Many2OneField
 * Override Many2OneBarcodeField
 * Since extracted/added props: nodeOptions and searchMore into Many2OneField props
 * and this component inherited props from Many2OneField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 */

Many2OneBarcodeField.props = {
    ...Many2OneBarcodeField.props,
    searchMore: {type: Boolean, optional: true},
    nodeOptions: {type: Object, optional: true},
};

/**
 * FIXME: find better way to extend props in Many2OneField
 * Override Many2OneAvatarField
 * Since extracted/added props: nodeOptions and searchMore into Many2OneField props
 * and this component inherited props from Many2OneField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 */
Many2OneAvatarField.props = {
    ...Many2OneAvatarField.props,
    searchMore: {type: Boolean, optional: true},
    nodeOptions: {type: Object, optional: true},
};

/**
 * FIXME: find better way to extend props in Many2OneField
 * Override Many2XAutocomplete
 * Since extracted/added props: nodeOptions and searchMore into Many2OneField props
 * and this component inherited props from Many2OneField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 */
Many2XAutocomplete.props = {
    ...Many2XAutocomplete.props,
    canCreate: {type: Boolean, optional: true},
    searchMore: {type: Boolean, optional: true},
    nodeOptions: {type: Object, optional: true},
};

/**
 * FIXME: find better way to extend props in Many2OneField
 * Override mailing_m2o_filter
 * Since extracted/added props: nodeOptions and searchMore into Many2OneField props
 * and this component inherited props from Many2OneField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 * This component is in module mass_mailing as optional module,
 * So need to import dynamic way
 */
try {
    (async () => {
        // Make sure component mailing_m2o_filter in mass mailing module loaded
        const installed_mass_mailing = await odoo.loader.modules.get(
            "@mass_mailing/js/mailing_m2o_filter"
        );
        if (installed_mass_mailing) {
            installed_mass_mailing.FieldMany2OneMailingFilter.props = {
                ...installed_mass_mailing.FieldMany2OneMailingFilter.props,
                searchMore: {type: Boolean, optional: true},
                nodeOptions: {type: Object, optional: true},
            };
        }
    })();
} catch {
    console.log(
        "Ignore overriding props of component mailing_m2o_filter since the module is not installed"
    );
}

/**
 * FIXME: find better way to extend props in Many2OneField
 * Override partner_autocomplete_many2one
 * Since extracted/added props: nodeOptions and searchMore into Many2OneField props
 * and this component inherited props from Many2OneField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 * This component is in module partner_autocomplete as optional module,
 * So need to import dynamic way
 */
try {
    (async () => {
        // Make sure component partner_autocomplete_many2one in partner_autocomplete module loaded
        const installed_partner_autocomplete = await odoo.loader.modules.get(
            "@partner_autocomplete/js/partner_autocomplete_many2one"
        );
        if (installed_partner_autocomplete) {
            installed_partner_autocomplete.PartnerMany2XAutocomplete.props = {
                ...installed_partner_autocomplete.PartnerMany2XAutocomplete.props,
                searchMore: {type: Boolean, optional: true},
                nodeOptions: {type: Object, optional: true},
            };
            const PartnerAutoCompleteMany2oneExtractProps =
                installed_partner_autocomplete.partnerAutoCompleteMany2one.extractProps;
            installed_partner_autocomplete.partnerAutoCompleteMany2one.extractProps = (
                {attrs, context, decorations, options, string},
                dynamicInfo
            ) => {
                return Object.assign(
                    PartnerAutoCompleteMany2oneExtractProps(
                        {attrs, context, decorations, options, string},
                        dynamicInfo
                    ),
                    {
                        searchLimit: options.limit,
                        searchMore: options.search_more,
                        nodeOptions: options,
                    }
                );
            };
        }
    })();
} catch {
    console.log(
        "Ignore overriding props of component partner_autocomplete_many2one since the module is not installed"
    );
}

/**
 * FIXME: find better way to extend props in Many2OneField
 * Override sale_product_field
 * Since extracted/added props: nodeOptions and searchMore into Many2OneField props
 * and this component inherited props from Many2OneField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 * This component is in module sale as optional module,
 * So need to import dynamic way
 */
try {
    (async () => {
        // Make sure component sale_product_field in sale module loaded
        const installed_sale = await odoo.loader.modules.get(
            "@sale/js/sale_product_field"
        );
        if (installed_sale) {
            installed_sale.SaleOrderLineProductField.props = {
                ...installed_sale.SaleOrderLineProductField.props,
                searchMore: {type: Boolean, optional: true},
                nodeOptions: {type: Object, optional: true},
            };
        }
    })();
} catch {
    console.log(
        "Ignore overriding props of component sale_product_field since the module is not installed"
    );
}

/**
 * FIXME: find better way to extend props in Many2OneField
 * Override many2one_avatar_user_field
 * Since extracted/added props: nodeOptions and searchMore into Many2OneField props
 * and this component inherited props from Many2OneField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 * This component is in module sale as optional module,
 * So need to import dynamic way
 */
try {
    (async () => {
        // Make sure component many2one_avatar_user_field in mail module loaded
        const installed_mail = await odoo.loader.modules.get(
            "@mail/views/web/fields/many2one_avatar_user_field/many2one_avatar_user_field"
        );
        if (installed_mail) {
            installed_mail.Many2OneAvatarUserField.props = {
                ...installed_mail.Many2OneAvatarUserField.props,
                searchMore: {type: Boolean, optional: true},
                nodeOptions: {type: Object, optional: true},
            };
            const Many2OneAvatarUserFieldExtractProps =
                installed_mail.many2OneAvatarUserField.extractProps;
            installed_mail.many2OneAvatarUserField.extractProps = (
                fieldInfo,
                dynamicInfo
            ) => {
                const canWrite =
                    fieldInfo.attrs.can_write &&
                    evaluateBooleanExpr(fieldInfo.attrs.can_write);
                return Object.assign(
                    Many2OneAvatarUserFieldExtractProps(fieldInfo, dynamicInfo),
                    {
                        canWrite: canWrite,
                        nodeOptions: fieldInfo.options,
                    }
                );
            };
            installed_mail.KanbanMany2OneAvatarUserField.props = {
                ...installed_mail.KanbanMany2OneAvatarUserField.props,
                searchMore: {type: Boolean, optional: true},
                nodeOptions: {type: Object, optional: true},
            };
            const KanbanMany2OneAvatarUserFieldExtractProps =
                installed_mail.kanbanMany2OneAvatarUserField.extractProps;
            installed_mail.kanbanMany2OneAvatarUserField.extractProps = (
                fieldInfo,
                dynamicInfo
            ) => {
                const canWrite =
                    fieldInfo.attrs.can_write &&
                    evaluateBooleanExpr(fieldInfo.attrs.can_write);
                return Object.assign(
                    KanbanMany2OneAvatarUserFieldExtractProps(fieldInfo, dynamicInfo),
                    {
                        canWrite: canWrite,
                        nodeOptions: fieldInfo.options,
                    }
                );
            };
        }
    })();
} catch {
    console.log(
        "Ignore overriding props of component many2one_avatar_user_field since the module is not installed"
    );
}

/**
 * FIXME: find better way to extend props in Many2ManyField
 * Override many2manyattendee
 * Since extracted/added props: nodeOptions and searchMore into Many2ManyField props
 * and this component inherited props from Many2ManyField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 * This component is in module calendar as optional module,
 * So need to import dynamic way
 */
try {
    (async () => {
        // Make sure component sale_product_field in sale module loaded
        const installed_calendar = await odoo.loader.modules.get(
            "@calendar/views/fields/many2many_attendee"
        );
        if (installed_calendar) {
            installed_calendar.Many2ManyAttendee.props = {
                ...installed_calendar.Many2ManyAttendee.props,
                open: {type: Boolean, optional: true},
                canWrite: {type: Boolean, optional: true},
                searchMore: {type: Boolean, optional: true},
                nodeOptions: {type: Object, optional: true},
            };
            const Many2ManyAttendeeExtractProps =
                installed_calendar.many2ManyAttendee.extractProps;
            installed_calendar.many2ManyAttendee.extractProps = (
                fieldInfo,
                dynamicInfo
            ) => {
                const canWrite =
                    fieldInfo.attrs.can_write &&
                    evaluateBooleanExpr(fieldInfo.attrs.can_write);
                return Object.assign(
                    Many2ManyAttendeeExtractProps(fieldInfo, dynamicInfo),
                    {
                        open: Boolean(fieldInfo.options.open),
                        canWrite: canWrite,
                        searchMore: fieldInfo.options.search_more,
                        nodeOptions: fieldInfo.options,
                    }
                );
            };
        }
    })();
} catch {
    console.log(
        "Ignore overriding props of component installed_calendar since the module is not installed"
    );
}

/**
 * FIXME: find better way to extend props in Many2ManyField
 * Override many2many_avatar_user_field
 * Since extracted/added props: nodeOptions and searchMore into Many2ManyField props
 * and this component inherited props from Many2ManyField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 * This component is in module sale as optional module,
 * So need to import dynamic way
 */
try {
    (async () => {
        // Make sure component many2one_avatar_user_field in mail module loaded
        const installed_mail = await odoo.loader.modules.get(
            "@mail/views/web/fields/many2many_avatar_user_field/many2many_avatar_user_field"
        );
        if (installed_mail) {
            installed_mail.ListMany2ManyTagsAvatarUserField.props = {
                ...installed_mail.ListMany2ManyTagsAvatarUserField.props,
                open: {type: Boolean, optional: true},
                canWrite: {type: Boolean, optional: true},
                searchMore: {type: Boolean, optional: true},
                nodeOptions: {type: Object, optional: true},
            };
            const ListMany2ManyTagsAvatarUserFieldExtractProps =
                installed_mail.listMany2ManyTagsAvatarUserField.extractProps;
            installed_mail.listMany2ManyTagsAvatarUserField.extractProps = (
                fieldInfo,
                dynamicInfo
            ) => {
                const canWrite =
                    fieldInfo.attrs.can_write &&
                    evaluateBooleanExpr(fieldInfo.attrs.can_write);
                return Object.assign(
                    ListMany2ManyTagsAvatarUserFieldExtractProps(
                        fieldInfo,
                        dynamicInfo
                    ),
                    {
                        canWrite: canWrite,
                        nodeOptions: fieldInfo.options,
                    }
                );
            };
            installed_mail.KanbanMany2ManyTagsAvatarUserField.props = {
                ...installed_mail.KanbanMany2ManyTagsAvatarUserField.props,
                open: {type: Boolean, optional: true},
                canWrite: {type: Boolean, optional: true},
                searchMore: {type: Boolean, optional: true},
                nodeOptions: {type: Object, optional: true},
            };
            const KanbanMany2ManyTagsAvatarUserFieldExtractProps =
                installed_mail.kanbanMany2ManyTagsAvatarUserField.extractProps;
            installed_mail.kanbanMany2ManyTagsAvatarUserField.extractProps = (
                fieldInfo,
                dynamicInfo
            ) => {
                const canWrite =
                    fieldInfo.attrs.can_write &&
                    evaluateBooleanExpr(fieldInfo.attrs.can_write);
                return Object.assign(
                    KanbanMany2ManyTagsAvatarUserFieldExtractProps(
                        fieldInfo,
                        dynamicInfo
                    ),
                    {
                        canWrite: canWrite,
                        nodeOptions: fieldInfo.options,
                    }
                );
            };
            installed_mail.Many2ManyTagsAvatarUserField.props = {
                ...installed_mail.Many2ManyTagsAvatarUserField.props,
                open: {type: Boolean, optional: true},
                canWrite: {type: Boolean, optional: true},
                searchMore: {type: Boolean, optional: true},
                nodeOptions: {type: Object, optional: true},
            };
            const Many2ManyTagsAvatarUserFieldExtractProps =
                installed_mail.many2ManyTagsAvatarUserField.extractProps;
            installed_mail.many2ManyTagsAvatarUserField.extractProps = (
                fieldInfo,
                dynamicInfo
            ) => {
                const canWrite =
                    fieldInfo.attrs.can_write &&
                    evaluateBooleanExpr(fieldInfo.attrs.can_write);
                return Object.assign(
                    Many2ManyTagsAvatarUserFieldExtractProps(fieldInfo, dynamicInfo),
                    {
                        canWrite: canWrite,
                        nodeOptions: fieldInfo.options,
                    }
                );
            };
        }
    })();
} catch {
    console.log(
        "Ignore overriding props of component many2many_avatar_user_field since the module is not installed"
    );
}

/**
 *  X2ManyField
 **/
patch(X2ManyField.prototype, {
    /**
     * @override
     */
    async openRecord(record) {
        var self = this;
        var open = this.props.open;
        if (open && self.props.readonly) {
            var res_id = record.data.id;
            const action = await self.env.model.orm.call(
                self.props.value.resModel,
                "get_formview_action",
                [[res_id]]
            );
            return self.env.model.actionService.doAction(action);
        }
        return super.openRecord(record);
    },
});

const X2ManyFieldExtractProps = x2ManyField.extractProps;
x2ManyField.extractProps = (
    {attrs, relatedFields, viewMode, views, widget, options, string},
    dynamicInfo
) => {
    const canOpen = Boolean(options.open);
    return Object.assign(
        X2ManyFieldExtractProps(
            {attrs, relatedFields, viewMode, views, widget, options, string},
            dynamicInfo
        ),
        {
            open: canOpen,
        }
    );
};

X2ManyField.props = {
    ...X2ManyField.props,
    open: {type: Boolean, optional: true},
};

/**
 *  FormController
 **/
patch(FormController.prototype, {
    /**
     * @override
     */
    setup() {
        var self = this;
        super.setup();

        /**  Due to problem of 2 onWillStart in native web core
         * (see: https://github.com/odoo/odoo/blob/16.0/addons/web/static/src/views/model.js#L142)
         * do the trick to override beforeLoadResolver here to customize viewLimit
         */
        this.superBeforeLoadResolver = this.beforeLoadResolver;
        this.beforeLoadResolver = async () => {
            await self._setSubViewLimit();
            self.superBeforeLoadResolver();
        };
    },
    /**
     * @override
     * add more method to add subview limit on formview
     */
    async _setSubViewLimit() {
        const ir_options = Component.env.session.web_m2x_options;

        const activeFields = this.archInfo.activeFields,
            fields = this.props.fields,
            isSmall = this.user;

        var limit = ir_options["web_m2x_options.field_limit_entries"];
        if (!(limit === undefined)) {
            limit = parseInt(limit, 10);
        }

        for (const fieldName in activeFields) {
            const field = fields[fieldName];
            if (!isX2Many(field)) {
                // What follows only concerns x2many fields
                continue;
            }
            const fieldInfo = activeFields[fieldName];
            if (fieldInfo.modifiers.invisible === true) {
                // No need to fetch the sub view if the field is always invisible
                continue;
            }

            if (!fieldInfo.FieldComponent.useSubView) {
                // The FieldComponent used to render the field doesn't need a sub view
                continue;
            }

            let viewType = fieldInfo.viewMode || "list,kanban";
            viewType = viewType.replace("tree", "list");
            if (viewType.includes(",")) {
                viewType = isSmall ? "kanban" : "list";
            }
            fieldInfo.viewMode = viewType;
            if (fieldInfo.views[viewType] && limit) {
                fieldInfo.views[viewType].limit = limit;
            }
        }
    },
});
