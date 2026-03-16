/**
 * @odoo-module
 */

import {FieldOne2Many} from "@web/views/fields/field_one2many";
import {registry} from "@web/core/registry";

// eslint-disable-next-line no-unused-vars
const ignored = "This variable is intentionally unused";

registry.category("fields").add("field_one2many", FieldOne2Many);
