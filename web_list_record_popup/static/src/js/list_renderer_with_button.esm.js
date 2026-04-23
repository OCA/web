/* @odoo-module */
/* eslint-disable sort-imports */
// Copyright 2026-TODAY Akretion - Raphael Valyi <raphael.valyi@akretion.com>
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

import {patch} from "@web/core/utils/patch";
import {ViewButton} from "@web/views/view_button/view_button";
import {ListRenderer} from "@web/views/list/list_renderer";
import {X2ManyField} from "@web/views/fields/x2many/x2many_field";
import {useBus} from "@web/core/utils/hooks";
import {EventBus} from "@odoo/owl";

// Create a dedicated bus for this module
export const listPopupBus = new EventBus();

// 1. Intercept the custom popup button click
patch(ViewButton.prototype, {
    onClick(ev) {
        const isPopupButton =
            (this.clickParams && this.clickParams.name === "dummy_button_for_js") ||
            (this.props.className && this.props.className.includes("edit-line-popup"));

        if (isPopupButton) {
            ev.preventDefault();
            ev.stopPropagation();
            if (this.props.record) {
                listPopupBus.trigger("OPEN_LINE_IN_POPUP", {record: this.props.record});
            }
            return;
        }
        return super.onClick(ev);
    },
});

// 2. Catch the event and open the record in dialog
patch(ListRenderer.prototype, {
    setup() {
        super.setup();
        useBus(listPopupBus, "OPEN_LINE_IN_POPUP", (ev) => {
            const payload = ev.detail || ev;
            const recordId = payload?.record?.id;

            if (recordId) {
                // Find the record in the list by ID (safer than reference comparison)
                const localRecord = this.props.list.records.find(
                    (r) => r.id === recordId
                );
                if (localRecord) {
                    // Leave edit mode first to ensure clean state
                    this.props.list.leaveEditMode().then(() => {
                        // Call openRecord which will be handled by X2ManyField
                        if (this.props.openRecord) {
                            this.props.openRecord(localRecord);
                        }
                    });
                }
            }
        });
    },
});

// 3. Override X2ManyField to allow opening records even when editable
patch(X2ManyField.prototype, {
    async openRecord(record) {
        // Always allow opening the record, bypassing canOpenRecord check
        // This is triggered by our custom button
        return this._openRecord({
            record,
            context: this.props.context,
            mode: this.props.readonly ? "readonly" : "edit",
        });
    },
});
