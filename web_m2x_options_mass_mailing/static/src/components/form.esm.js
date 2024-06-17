/** @odoo-module **/

import {FieldMany2OneMailingFilter} from "@mass_mailing/js/mailing_m2o_filter";

/**
 * Override mailing_m2o_filter
 * Since extracted/added props: nodeOptions and searchMore into Many2OneField props
 * and this component inherited props from Many2OneField
 * So, must override props here to avoid constraint validateProps (props schema) in owl core
 */
FieldMany2OneMailingFilter.props = {
    ...FieldMany2OneMailingFilter.props,
    searchMore: {type: Boolean, optional: true},
    nodeOptions: {type: Object, optional: true},
};
