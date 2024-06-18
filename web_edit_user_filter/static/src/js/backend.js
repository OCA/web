/*
 * Copyright 2019 Onestein
 * Copyright 2021 Level Prime Srl - Roberto Fichera <roberto.fichera@levelprime.com>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

odoo.define("web_edit_user_filter/static/src/js/backend.js", function (require) {
    "use strict";

    var core = require("web.core");
    var qweb = core.qweb;
    var _t = core._t;
    const {patch} = require("web.utils");
    const components = {
        SearchBar: require("web.SearchBar"),
        CustomFavoriteItem: require("web.CustomFavoriteItem"),
        ControlPanelModelExtension: require("web/static/src/js/control_panel/control_panel_model_extension.js"),
    };

    patch(
        components.ControlPanelModelExtension,
        "web_edit_user_filter/static/src/js/backend.js",
        {
            _favoriteToIrFilter(favorite) {
                var irFilter = this._super(...arguments);
                if ("facet" in favorite) {
                    irFilter.facet = favorite.facet;
                }
                return irFilter;
            },

            /**
             * Returns a filter of type 'favorite' starting from an ir_filter comming from db.
             * @private
             * @param {Object} irFilter
             * @returns {Object}
             */
            _irFilterToFavorite(irFilter) {
                var favorite = this._super(...arguments);
                if (irFilter.facet) {
                    favorite.facet = irFilter.facet;
                }
                return favorite;
            },
        }
    );

    patch(
        components.CustomFavoriteItem,
        "web_edit_user_filter/static/src/js/backend.js",
        {
            // ---------------------------------------------------------------------
            // Private
            // ---------------------------------------------------------------------

            /**
             * @private
             */
            _saveFavorite() {
                if (!this.state.description.length) {
                    this.env.services.notification.notify({
                        message: this.env._t(
                            "A name for your favorite filter is required."
                        ),
                        type: "danger",
                    });
                    return this.descriptionRef.el.focus();
                }
                const favorites = this.model.get(
                    "filters",
                    (f) => f.type === "favorite"
                );
                if (favorites.some((f) => f.description === this.state.description)) {
                    this.env.services.notification.notify({
                        message: this.env._t("Filter with same name already exists."),
                        type: "danger",
                    });
                    return this.descriptionRef.el.focus();
                }
                var facets = this.model.get("facets");
                this.model.dispatch("createNewFavorite", {
                    type: "favorite",
                    description: this.state.description,
                    isDefault: this.state.isDefault,
                    isShared: this.state.isShared,
                    facet: JSON.stringify(facets),
                });
                // Reset state
                Object.assign(this.state, {
                    description: this.env.action.name || "",
                    isDefault: false,
                    isShared: false,
                    open: false,
                });
            },
        }
    );

    patch(components.SearchBar, "web_edit_user_filter/static/src/js/backend.js", {
        mounted() {
            var self = this;
            this._super(...arguments);
            $(".o_searchview").on("click", ".o_searchview_facet", function () {
                $(this).popover("dispose");
                if ($(this).hasClass("o_facet_remove")) {
                    return;
                }
                var facet_type = $(this).attr("data-type");
                var facetId = $(this).attr("data-gp");
                self._process_filters($(this), facet_type, facetId);
            });

            return this;
        },

        _process_filters($el, facet_type, facetId) {
            var self = this;
            var selectedFacet = self.model.get("filters").filter(function (facet) {
                return (
                    facet.type === facet_type &&
                    facet.groupId == facetId &&
                    facet.isActive === true
                );
            });
            if (!selectedFacet.length) {
                return;
            }
            if (facet_type === "favorite") {
                var FavFacets = [];
                var currentFacet = self.model.get(
                    "filters",
                    (f) => f.type === "favorite" && f.groupId == facetId
                );
                if (currentFacet[0].groupBys.length) {
                    _.each(currentFacet[0].groupBys, function (description) {
                        FavFacets.push(
                            self.model.get(
                                "filters",
                                (f) =>
                                    f.type === "groupBy" && f.fieldName === description
                            )[0]
                        );
                    });
                }
            }
            if (facet_type == "field" && selectedFacet.length) {
                for (let i = 0; i < selectedFacet.length; i++) {
                    for (const [key, value] of Object.entries(selectedFacet[i])) {
                        if (key === "autoCompleteValues") {
                            const new_description = [];
                            for (const [, desc] of Object.entries(value)) {
                                new_description.push(desc.label);
                            }
                            selectedFacet[i].description = new_description;
                        }
                    }
                }
            }
            var $facet = $($el);
            var $content = $(
                qweb.render("web_edit_user_filter.Popover", {
                    values: selectedFacet,
                })
            );
            $content.find(".list-group-item").on("click", function () {
                var PopOverContainer = $(".o_searchview");
                var type = $(this).data("type");
                var facetIdEl = $(this).data("id");
                if (type === "filter") {
                    var FacetSelected = self.model.get(
                        "filters",
                        (f) => f.id === facetIdEl && f.type === "filter"
                    );
                    if (FacetSelected[0].hasOptions) {
                        var OptionSelected = FacetSelected[0].options.filter(function (
                            option
                        ) {
                            return option.isActive === true;
                        });
                        _.each(OptionSelected, function (option) {
                            self.model.dispatch(
                                "toggleFilterWithOptions",
                                facetIdEl,
                                option.id
                            );
                        });
                    } else {
                        self.model.dispatch("toggleFilter", facetIdEl);
                    }
                } else if (type === "groupBy" || type === "field") {
                    self.model.dispatch("toggleFilter", facetIdEl);
                } else if (type === "favorite") {
                    event.stopImmediatePropagation();
                    var facet = self.model.get(
                        "filters",
                        (f) => f.type === type && f.groupId === facetIdEl
                    );
                    if (facet.length) {
                        self._unpackFilter(facet[0]);
                    } else {
                        self.env.services.notification.notify({
                            message: self.env._t(
                                "In order to edit newly added 'Favorite filters, you need to refresh the page first. \n Kindly refresh the page and try again."
                            ),
                            type: "warning",
                        });
                    }
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
            var self = this;
            self.model.dispatch("toggleFilter", filter.id);
            var facets = JSON.parse(filter.facet);
            var convFacets = [];
            _.each(facets, function (facet) {
                if (facet.type === "filter") {
                    _.each(facet.values, function (fc) {
                        var fetchedFilter = self.model.get(
                            "filters",
                            (f) => f.description === fc && f.type === "filter"
                        );
                        if (fetchedFilter.length) {
                            convFacets.push(
                                self.model.get(
                                    "filters",
                                    (f) => f.description === fc && f.type === "filter"
                                )
                            );
                        } else {
                            var tentativeFilter = self.model.get(
                                "filters",
                                (f) =>
                                    f.description === facet.title && f.type === "filter"
                            );
                            if (tentativeFilter.length) {
                                _.each(tentativeFilter, function (f) {
                                    if (f.hasOptions) {
                                        var trueOption = "";
                                        _.each(f.options, function (option) {
                                            var str = fc
                                                .split(": ")
                                                .pop()
                                                .split(" ")[0];
                                            if (str === option.description) {
                                                trueOption = option.id;
                                            }
                                        });
                                        if (trueOption !== "") {
                                            self.model.dispatch(
                                                "toggleFilterWithOptions",
                                                f.id,
                                                trueOption
                                            );
                                        }
                                    }
                                });
                            } else {
                                const preFilter = {
                                    description: facet.title,
                                    domain: filter.domain,
                                    type: "filter",
                                };
                                self.model.dispatch("createNewFilters", [preFilter]);
                            }
                        }
                    });
                } else if (facet.type === "groupBy") {
                    _.each(facet.values, function (fc) {
                        var fetchedGroup = self.model.get(
                            "filters",
                            (f) => f.description === fc && f.type === "groupBy"
                        );
                        if (fetchedGroup.length) {
                            convFacets.push(
                                self.model.get(
                                    "filters",
                                    (f) => f.description === fc && f.type === "groupBy"
                                )
                            );
                        } else {
                            var tentativeFilter = self.model.get(
                                "filters",
                                (f) =>
                                    f.description === facet.title &&
                                    f.type === "groupBy"
                            );
                            if (tentativeFilter.length) {
                                _.each(tentativeFilter, function (f) {
                                    if (f.hasOptions) {
                                        var trueOption = "";
                                        _.each(f.options, function (option) {
                                            var str = fc
                                                .split(": ")
                                                .pop()
                                                .split(" ")[0];
                                            if (str === option.description) {
                                                trueOption = option.id;
                                            }
                                        });
                                        if (trueOption !== "") {
                                            self.model.dispatch(
                                                "toggleFilterWithOptions",
                                                f.id,
                                                trueOption
                                            );
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
            if (convFacets.length) {
                _.each(convFacets, function (facet) {
                    self.model.dispatch("toggleFilter", facet[0].id);
                });
            }
        },
    });
    $(document).on("click", ".popover .close", function () {
        $(this).parents(".popover").popover("hide");
    });
});
