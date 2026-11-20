/* Copyright 2026 Quartile (https://www.quartile.co)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("web_view_monetary_format_tour", {
    test: true,
    steps: () => [
        {
            trigger: ".o_pivot_view",
            run() {
                const values = [
                    ...document.querySelectorAll(".o_pivot_cell_value div"),
                ].map((el) => el.textContent.trim());
                if (!values.some((v) => v === "3,000")) {
                    throw new Error(
                        `Expected JPY value "3,000" (0 decimals) not found in: ${values.join(", ")}`
                    );
                }
                if (values.some((v) => v === "3,000.00")) {
                    throw new Error(
                        'JPY value should not have decimal places, but found "3,000.00"'
                    );
                }
                if (!values.some((v) => v === "50.50")) {
                    throw new Error(
                        `Expected USD value "50.50" (2 decimals) not found in: ${values.join(", ")}`
                    );
                }
            },
        },
    ],
});
