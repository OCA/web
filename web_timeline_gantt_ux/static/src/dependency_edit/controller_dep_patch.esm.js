/** @odoo-module **/

import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {TimelineController} from "@web_timeline/views/timeline/timeline_controller.esm";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

const UNDO_TOAST_MS = 8000;

patch(TimelineController.prototype, {
    setup() {
        super.setup(...arguments);
        this.tlgNotification = useService("notification");
    },

    get rendererProps() {
        const props = super.rendererProps;
        if (this.props.modelParams.gantt_ux) {
            props.onCreateDependency = this._onCreateDependency.bind(this);
            props.onRemoveDependency = this._onRemoveDependency.bind(this);
        }
        return props;
    },

    _tlgDisplayName(id) {
        const record = (this.model.data || []).find((rec) => rec.id === id);
        return record?.display_name || `#${id}`;
    },

    /**
     * Create "successor is blocked by predecessor" and offer an immediate
     * Undo in the success toast — arrows can be unreachable under bars, so
     * the toast is the guaranteed recovery path for a misdrop.
     *
     * @param {Object} ids
     * @param {Number} ids.predecessorId
     * @param {Number} ids.successorId
     * @returns {Promise<Boolean>} true when the write landed
     */
    async _onCreateDependency({predecessorId, successorId}) {
        const successorName = this._tlgDisplayName(successorId);
        const predecessorName = this._tlgDisplayName(predecessorId);
        const created = await this._tlgWriteDependency(successorId, [
            [4, predecessorId],
        ]);
        if (created) {
            const close = this.tlgNotification.add(
                _t('"%s" is now blocked by "%s".', successorName, predecessorName),
                {
                    type: "success",
                    sticky: true,
                    buttons: [
                        {
                            name: _t("Undo"),
                            onClick: async () => {
                                close();
                                await this._tlgWriteDependency(successorId, [
                                    [3, predecessorId],
                                ]);
                            },
                        },
                    ],
                }
            );
            setTimeout(close, UNDO_TOAST_MS);
        }
        return created;
    },

    _onRemoveDependency({predecessorId, successorId}) {
        const successorName = this._tlgDisplayName(successorId);
        const predecessorName = this._tlgDisplayName(predecessorId);
        this.dialogService.add(ConfirmationDialog, {
            title: _t("Remove dependency"),
            body: _t(
                '"%s" is blocked by "%s". Remove this dependency?',
                successorName,
                predecessorName
            ),
            confirmLabel: _t("Remove"),
            cancelLabel: _t("Discard"),
            confirm: () => this._tlgWriteDependency(successorId, [[3, predecessorId]]),
            cancel: () => {
                return;
            },
        });
    },

    /**
     * Single write path for dependency link/unlink. User-facing server
     * rejections (cycles are enforced by
     * project.task._check_no_cyclic_dependencies) surface as a danger toast
     * without a reload; unexpected errors go to the crash handler.
     *
     * @param {Number} successorId record owning the m2m
     * @param {Array} commands ORM commands ([[4, id]] / [[3, id]])
     * @returns {Promise<Boolean>} true when the write landed
     */
    async _tlgWriteDependency(successorId, commands) {
        const depField = this.model.params.dependency_arrow;
        try {
            await this.model.write_completed(successorId, {
                [depField]: commands,
            });
        } catch (error) {
            const exceptionName = error?.exceptionName || error?.data?.name || "";
            const isUserFacing = [
                "odoo.exceptions.ValidationError",
                "odoo.exceptions.UserError",
            ].includes(exceptionName);
            if (!isUserFacing) {
                throw error;
            }
            this.tlgNotification.add(error.data?.message || error.message, {
                title: _t("Dependency not saved"),
                type: "danger",
            });
            return false;
        }
        // The gantt renderer suppresses the stock auto-fit, so this reload
        // does not move the window.
        await this.model.load(this.getSearchProps());
        this.render();
        return true;
    },
});
