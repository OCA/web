/* Copyright 2026 Escodoo
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {session} from "@web/session";

/**
 * Holds the `x2many.delete.confirm.rule` records the current user is subject
 * to, pushed once by `ir.http.session_info()`, and asks the question they
 * configured on behalf of the view patches.
 */
export const x2manyDeleteConfirmService = {
    dependencies: ["dialog"],

    start(env, {dialog}) {
        const rules = session.x2many_delete_confirm_rules || {};

        /**
         * A rule bound to this exact parent is more specific than a rule that
         * applies to every form showing the line model. Within each group the
         * server already ordered the rules by sequence.
         */
        function getRule(resModel, parentModel) {
            const candidates = rules[resModel] || [];
            return (
                candidates.find((rule) => rule.parent_model === parentModel) ||
                candidates.find((rule) => !rule.parent_model) ||
                null
            );
        }

        return {
            /**
             * @param {Object} params
             * @param {String} params.resModel model of the line being deleted
             * @param {String} [params.parentModel] model of the form holding
             *      the x2many field, when it can be determined
             * @returns {Promise<Boolean>} whether the deletion may go on, which
             *      is immediately true when no rule covers this line model
             */
            async check({resModel, parentModel}) {
                const rule = getRule(resModel, parentModel);
                if (!rule) {
                    return true;
                }
                return new Promise((resolve) => {
                    dialog.add(
                        ConfirmationDialog,
                        {
                            title: rule.title || _t("Confirm deletion"),
                            body:
                                rule.message ||
                                _t("Do you really want to delete this line?"),
                            confirmLabel: _t("Delete"),
                            confirm: () => resolve(true),
                            cancel: () => resolve(false),
                        },
                        // Closing the dialog any other way (Escape, the cross)
                        // must not delete anything either.
                        {onClose: () => resolve(false)}
                    );
                });
            },
        };
    },
};

registry.category("services").add("x2many_delete_confirm", x2manyDeleteConfirmService);
