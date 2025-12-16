/** @odoo-module */

import {PivotController} from "@web/views/pivot/pivot_controller";
import {SEARCH_KEYS} from "@web/search/with_search/with_search";
import {pivotView} from "@web/views/pivot/pivot_view";
import {registry} from "@web/core/registry";
import {useRecordStream} from "../../hooks/use_record_stream.esm";

/**
 * SEE: /workspaces/nexe/custom/src/odoo/addons/web/static/src/model/model.js
 * @param {Object} props
 * @returns {SearchParams}
 */
export const getSearchParams = (props) => {
    const params = {};
    for (const key of SEARCH_KEYS) {
        params[key] = props[key];
    }
    return params;
};

export class BusPivotController extends PivotController {
    setup() {
        super.setup();

        useRecordStream(this.props.resModel, {
            onReload: async () => {
                const searchParams = getSearchParams(this.props);
                await this.model.load(searchParams);
                this.model.bus.trigger("update");
            },
        });
    }
}

export const busPivotView = {
    ...pivotView,
    Controller: BusPivotController,
};

registry.category("views").add("bus_record_event_pivot", busPivotView);
