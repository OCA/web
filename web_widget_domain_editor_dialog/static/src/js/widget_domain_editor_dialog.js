/* Copyright 2019 Tecnativa - David Vidal
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_widget_domain_editor_dialog.DomainEditorDialog", function (require) {
    "use strict";

    const {_t} = require("web.core");
    const {SelectCreateDialog} = require("web.view_dialogs");
    const Domain = require("web.Domain");

    const DomainEditorDialog = SelectCreateDialog.extend({
        init: function () {
            this._super.apply(this, arguments);
            const _this = this;
            let domain = Domain.prototype.stringToArray(_this.options.default_domain);
            // HACK: dynamicFilters don't work fine with booleans as they pass through
            // pyeval as a jason domain. This way, they're full compatible and we avoid
            // making an _rpc call.
            domain = domain.map((tuple) => {
                if (tuple[2] === true) {
                    tuple[2] = 1;
                }
                if (tuple[2] === false) {
                    tuple[2] = 0;
                }
                return tuple;
            });
            this.options = _.defaults(this.options, {
                dynamicFilters: [
                    {
                        description: _t("Selected domain"),
                        domain: domain,
                    },
                ],
            });
        },
        get_domain: function (selected_ids) {
            let group_domain = [];
            const search_data = this.viewController.renderer.state;
            let domain = search_data.domain;
            if (this.$(".o_list_record_selector input").prop("checked")) {
                if (search_data.groupedBy.length) {
                    group_domain = _.filter(search_data.data, (x) => {
                        return x.res_ids.length;
                    }).map((x) => {
                        return x.domain;
                    });
                    group_domain = _.flatten(group_domain, true);
                    // Compute domain difference
                    _.each(domain, (d) => {
                        group_domain = _.without(
                            group_domain,
                            _.filter(group_domain, (x) => {
                                return _.isEqual(x, d);
                            })[0]
                        );
                    });
                    // Strip operators to leave just the group domains
                    group_domain = _.without(group_domain, "&");
                    // Add OR operators if there is more than one group
                    group_domain = _.times(
                        group_domain.length - 1,
                        _.constant("|")
                    ).concat(group_domain);
                }
            } else {
                const ids = selected_ids.map((x) => {
                    return x.id;
                });
                domain = domain.concat([["id", "in", ids]]);
            }
            return domain.concat(group_domain);
        },

        on_view_list_loaded: function () {
            this.$(".o_list_record_selector input").prop("checked", true);
            this.$footer
                .find(".o_selectcreatepopup_search_select")
                .prop("disabled", false);
        },
    });

    return DomainEditorDialog;
});
