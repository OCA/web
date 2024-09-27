/** @odoo-module **/

import {PivotModelHideTotal} from "./pivot_model_hide_total.esm";
import {pivotView} from "@web/views/pivot/pivot_view";
import {registry} from "@web/core/registry";

const viewRegistry = registry.category("views");

const PivotViewHideTotal = {...pivotView, Model: PivotModelHideTotal};
viewRegistry.add("web_pivot_hide_total", PivotViewHideTotal);
