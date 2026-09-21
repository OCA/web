/** @odoo-module **/

import {SearchBar} from "@web/search/search_bar/search_bar";
import {patch} from "@web/core/utils/patch";
import {qweb} from "web.core";
import {_t} from "@web/core/l10n/translation";
import {useService} from "@web/core/utils/hooks";

patch(SearchBar.prototype, "web_edit_user_filter.SearchBar", {
    setup() {
        this.notificationService = useService("notification");
        var self = this;
        this._super(...arguments);
        $("body").on("click", ".o_searchview_facet", function (ev) {
            $(ev.currentTarget).popover("dispose");
            if ($(ev.currentTarget).hasClass("o_facet_remove")) {
                return;
            }
            var facet_type = $(this).attr("data-type");
            var facetId = $(this).attr("data-gp");
            self._process_filters($(this), facet_type, facetId);
        });
    },

    _process_filters($el, facet_type, facetId) {
        var searchItems = this.env.searchModel.getSearchItems(
            (facet) => facet.type === facet_type
        );

        var selectedFacet = searchItems.filter(
            (f) =>
                f.groupId == facetId &&
                f.isActive === true &&
                // Does not allow user to unpack favorite
                // whose facet was not defined when favorite was created
                (f.type !== "favorite" || f.facet !== undefined)
        );

        if (!selectedFacet.length) {
            return;
        }
        if (facet_type === "favorite") {
            var FavFacets = [];
            var currentFacet = searchItems.filter((f) => f.groupId == facetId);
            if (currentFacet[0].groupBys.length) {
                _.each(currentFacet[0].groupBys, (description) => {
                    FavFacets.push(
                        this.env.searchModel.getSearchItems(
                            (f) => f.type === "groupBy" && f.fieldName === description
                        )[0]
                    );
                });
            }
        }

        if (facet_type == "field" && selectedFacet.length) {
            for (let i = 0; i < selectedFacet.length; i++) {
                const new_description = [];
                for (const [, desc] of Object.entries(
                    selectedFacet[i].autocompleteValues
                )) {
                    new_description.push(desc.label);
                }
                selectedFacet[i].description = new_description;
            }
        }

        var $facet = $($el);
        var $content = $(
            qweb.render("web_edit_user_filter.Popover", {
                values: selectedFacet,
            })
        );
        $content.find(".list-group-item").on("click", (ev) => {
            var self = this;
            var PopOverContainer = $(".o_searchview");
            var type = $(ev.currentTarget).data("type");
            var facetIdEl = $(ev.currentTarget).data("id");
            var facet = this.env.searchModel.getSearchItems(
                (f) => f.type === type && f.id == facetIdEl
            );
            if (type === "filter") {
                if (facet[0].hasOptions) {
                    var OptionSelected = facet[0].options.filter(function (option) {
                        return option.isActive === true;
                    });
                    _.each(OptionSelected, (option) => {
                        this.env.searchModel.toggleDateFilter(facetIdEl, option.id);
                    });
                } else {
                    this.env.searchModel.toggleSearchItem(facetIdEl);
                }
            } else if (type === "groupBy" || type === "field") {
                this.env.searchModel.toggleSearchItem(facetIdEl);
            } else if (type === "favorite") {
                ev.stopImmediatePropagation();
                self._unpackFilter(facet[0]);
            }
            $(this).remove();
            $(PopOverContainer).find(".popover").popover("hide");
        });
        var $container = $(".o_searchview");
        $facet.popover({
            title: _t(
                'Edit Filters <a href="#" class="close" data-dismiss="alert">&times;</a>'
            ),
            template: qweb.render("web_edit_user_filter.PopoverTemplate"),
            content: $content,
            container: $container,
            html: true,
            trigger: "manual",
            placement: "bottom",
            animation: false,
        });
        var PopOverContainer = $(".o_searchview");
        $(PopOverContainer).find(".popover").popover("hide");
        $facet.popover("show");
    },

    _unpackFilter(filter) {
        this.env.searchModel.toggleSearchItem(filter.id);
        var facets = JSON.parse(filter.facet);
        var convFacets = [];
        _.each(facets, (facet) => {
            if (facet.type === "filter") {
                _.each(facet.values, (fc) => {
                    var fetchedFilter = this.env.searchModel.getSearchItems(
                        (f) => f.type === "filter" && f.description == fc
                    );
                    if (fetchedFilter.length) {
                        convFacets.push(fetchedFilter);
                    }
                });
            } else if (facet.type === "groupBy") {
                _.each(facet.values, (fc) => {
                    var fetchedGroup = this.env.searchModel.getSearchItems(
                        (f) => f.description === fc && f.type === "groupBy"
                    );
                    if (fetchedGroup.length) {
                        convFacets.push(fetchedGroup);
                    }
                });
            }
        });
        if (convFacets.length) {
            _.each(convFacets, (facet) => {
                this.env.searchModel.toggleSearchItem(facet[0].id);
            });
        }
    },
});
$(document).on("click", ".popover .close", function () {
    $(this).parents(".popover").popover("hide");
});

export default SearchBar;
