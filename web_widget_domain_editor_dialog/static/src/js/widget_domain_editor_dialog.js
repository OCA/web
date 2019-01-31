/* Copyright 2019 Tecnativa - David Vidal
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_widget_domain_editor_dialog.DomainEditorDialog", function (require) {
    "use strict";

    var core = require("web.core");
    var view_dialogs = require('web.view_dialogs');
    var SearchView = require('web.SearchView');
    var _t = core._t;

    var DomainEditorDialog = view_dialogs.SelectCreateDialog.extend({
        init: function () {
            this._super.apply(this, arguments);
            var _this = this;
            this.options = _.defaults(this.options, {
                initial_facet: {
                    category: _t("Custom Filter"),
                    icon: 'fa-circle',
                    field: {
                        get_context: function () {
                            return _this.options.context;
                        },
                        get_groupby: function () {
                            return [];
                        },
                        get_domain: function () {
                            return _this.options.default_domain;
                        },
                    },
                    values: [{label: _t("Selected domain"), value: null}],
                },
            });
        },

        start: function () {
            var search_view = _.find(
                this.getChildren(), function (x) {
                    return x instanceof SearchView;
                });
            if (this.options.initial_facet && search_view) {
                search_view.query.reset([this.options.initial_facet], {
                    preventSearch: true,
                });
                search_view.do_search();
            }
            this._super.apply(this, arguments);
        },

        get_domain: function (selected_ids) {
            var group_domain = [];
            var search_data = this.list_controller.renderer.state;
            var domain = search_data.domain;
            if (this.$('.o_list_record_selector input').prop('checked')) {
                if (search_data.groupedBy.length) {
                    group_domain = _.filter(
                        search_data.data, function (x) {
                            return x.res_ids.length;
                        })
                        .map(function (x) {
                            return x.domain;
                        });
                    group_domain = _.flatten(group_domain, true);
                    // Compute domain difference
                    _.each(domain, function (d) {
                        group_domain = _.without(
                            group_domain, _.filter(group_domain, function (x) {
                                return _.isEqual(x, d);
                            })[0]);
                    });
                    // Strip operators to leave just the group domains
                    group_domain = _.without(group_domain, "&");
                    // Add OR operators if there is more than one group
                    group_domain = _.times(
                        group_domain.length - 1,
                        _.constant('|')).concat(group_domain);
                }
            } else {
                var ids = selected_ids.map(function (x) {
                    return x.id;
                });
                domain = domain.concat([["id", "in", ids]]);
            }
            return domain.concat(group_domain);
        },

        on_view_list_loaded: function () {
            this.$('.o_list_record_selector input').prop('checked', true);
            this.$footer.find(".o_selectcreatepopup_search_select")
                .prop('disabled', false);
        },
    });

    return DomainEditorDialog;

});
