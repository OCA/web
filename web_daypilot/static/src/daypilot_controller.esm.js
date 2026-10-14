/**
 * DayPilot Controller
 *
 * This controller follows the same pattern as CalendarController from web.calendar:
 * - https://github.com/odoo/odoo/blob/19.0/addons/web/static/src/views/calendar/calendar_controller.js
 *
 * Reactivity Pattern:
 * 1. onWillUpdateProps: Detects when search parameters change (groupby, filters, etc.)
 * 2. Reloads model with new search parameters
 * 3. Model calls this.notify() to signal data change
 * 4. Renderer's onPatched hook is triggered
 * 5. Renderer updates the library instance with new data
 *
 * This ensures the calendar updates automatically when the user changes
 * groupby selections in the search panel, similar to Kanban and Gantt views.
 */

import {Component, onWillUnmount, onWillUpdateProps, useRef} from "@odoo/owl";
import {
    ConfirmationDialog,
    deleteConfirmationMessage,
} from "@web/core/confirmation_dialog/confirmation_dialog";
import {ActionHelper} from "@web/views/action_helper";
import {CogMenu} from "@web/search/cog_menu/cog_menu";
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import {Layout} from "@web/search/layout";
import {SearchBar} from "@web/search/search_bar/search_bar";
import {_t} from "@web/core/l10n/translation";
import {standardViewProps} from "@web/views/standard_view_props";
import {useModelWithSampleData} from "@web/model/model";
import {useSearchBarToggler} from "@web/search/search_bar/search_bar_toggler";
import {useService} from "@web/core/utils/hooks";
import {useSetupAction} from "@web/search/action_hook";

export class DayPilotController extends Component {
    static components = {
        CogMenu,
        Layout,
        SearchBar,
        ActionHelper,
    };
    static props = {
        ...standardViewProps,
        Model: Function,
        Renderer: Function,
        buttonTemplate: String,
        modelParams: Object,
    };
    static template = "web_daypilot.DayPilotController";

    setup() {
        this.actionService = useService("action");
        this.dialogService = useService("dialog");
        this.orm = useService("orm");

        const rootRef = useRef("root");

        this.model = useModelWithSampleData(this.props.Model, this.props.modelParams);
        useSetupAction({
            rootRef,
            getLocalState: () => ({
                metaData: this.model.metaData,
            }),
        });

        onWillUnmount(() => this.closeDialog?.());
        this.searchBarToggler = useSearchBarToggler();

        // Reactivity: Reload model when search parameters change
        // This is triggered when the user changes groupby, filters, or other search options
        // The model will call this.notify() after loading, which triggers the renderer's onPatched hook
        onWillUpdateProps(async (nextProps) => {
            if (this.model) {
                const searchParams = {
                    context: nextProps.context,
                    domain: nextProps.domain,
                    groupBy: nextProps.groupBy,
                    orderBy: nextProps.orderBy,
                };
                await this.model.load(searchParams);
            }
        });
    }

    get className() {
        if (this.env.isSmall) {
            const classList = (this.props.className || "").split(" ");
            classList.push("o_action_delegate_scroll");
            return classList.join(" ");
        }
        return this.props.className;
    }

    get showNoContentHelp() {
        return this.model.useSampleModel;
    }

    /**
     * @param {Record<string, any>} [context]
     */
    create(context) {
        const {createAction} = this.model.metaData;
        if (createAction) {
            this.actionService.doAction(createAction, {
                additionalContext: context,
                onClose: () => {
                    this.model.fetchData();
                },
            });
        } else {
            this.openDialog({context});
        }
    }

    _getDialogProps(props) {
        const {canDelete, canEdit, resModel, formViewId: viewId} = this.model.metaData;

        const dialogProps = {
            title: props.resId ? _t("Open") : _t("Create"),
            resModel,
            viewId,
            resId: props.resId,
            readonly: !canEdit,
            context: props.context,
        };

        if (canDelete && props.resId) {
            dialogProps.removeRecord = () =>
                new Promise((resolve) => {
                    this.dialogService.add(ConfirmationDialog, {
                        title: _t("Bye-bye, record!"),
                        body: deleteConfirmationMessage,
                        confirmLabel: _t("Delete"),
                        confirm: async () => {
                            await this.orm.unlink(resModel, [props.resId]);
                            resolve();
                        },
                        // eslint-disable-next-line no-empty-function -- cancel is intentionally empty for dialog cancellation
                        cancel: () => {},
                        cancelLabel: _t("No, keep it"),
                    });
                });
        }

        return dialogProps;
    }

    /**
     * Opens a FormViewDialog to add/edit/view a record.
     *
     * @param {Record<string, any>} props dialog props ({resId, context})
     */
    openDialog(props) {
        this.closeDialog = this.dialogService.add(
            FormViewDialog,
            this._getDialogProps(props),
            {
                onClose: () => {
                    this.closeDialog = null;
                    this.model.fetchData();
                },
            }
        );
    }

    // --------------------------------------------------------------------------
    // Handlers
    // --------------------------------------------------------------------------

    async onNewClicked() {
        const context = await this.getAdditionalContext();
        this.create(context);
    }

    async getAdditionalContext() {
        const {businessHoursStart, businessHoursEnd} = this.model.metaData;

        // Call server method to get default time based on business hours
        let defaultTime = null;
        try {
            const result = await this.orm.call("base", "get_daypilot_default_time", [
                businessHoursStart,
                businessHoursEnd,
            ]);
            defaultTime = result;
        } catch (error) {
            console.error("Failed to get default time from server:", error);
            // Fallback to current time if server call fails
            const now = luxon.DateTime.local();
            defaultTime = {
                start: now.toFormat("yyyy-MM-dd HH:mm:ss"),
                stop: now.plus({hours: 1}).toFormat("yyyy-MM-dd HH:mm:ss"),
            };
        }

        return this.model.getDialogContext({
            start: defaultTime.start,
            stop: defaultTime.stop,
        });
    }
}
