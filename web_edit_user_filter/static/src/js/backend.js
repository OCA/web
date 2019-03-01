/* Copyright 2019 Onestein
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_edit_user_filter', function (require) {
    "use strict";

    var FavoriteMenu = require('web.FavoriteMenu'),
        core = require('web.core'),
        SearchView = require('web.SearchView');
    var qweb = core.qweb;
    var _t = core._t;


    FavoriteMenu.include({

        /**
         * Adds the facets data to the filter.
         *
         * @override
         * @private
         */
        _createFilter: function (filter) {
            var facets = [];

            this.query.each(function (facet) {
                var json_facet = facet.attributes;
                json_facet.values = facet.get('values');

                _.each(json_facet.values, function (value, i) {
                    if (typeof value.value === 'object' &&
                        'attrs' in value.value) {
                        json_facet.values[i] = {
                            attrs: value.value.attrs,
                        };
                    }
                });

                if ('field' in json_facet) {
                    json_facet.field = {
                        attrs: json_facet.field.attrs,
                    };
                }

                facets.push(json_facet);
            });

            filter.facet = JSON.stringify(facets);
            return this._super(filter);
        },

        /**
         * Adds the edit button to the favourite filter menu item.
         *
         * @override
         * @private
         */
        append_filter: function (filter) {
            var self = this;
            var res = this._super(filter);
            var key = this.key_for(filter);
            this.$filters[key].append($('<span>', {
                class: 'fa fa-pencil o-edit-user-filter',
                on: {
                    click: function (event) {
                        event.stopImmediatePropagation();
                        self._unpackFilter(filter);
                    },
                },
            }));
            return res;
        },

        /**
         * Unpacks a saved filter and updates the search view's facets.
         *
         * @private
         */
        _unpackFilter: function (filter) {
            var self = this;
            var facets = JSON.parse(filter.facet);

            var new_facets = [];
            this.query.reset([]);

            _.each(facets, function (segment) {
                if (segment.cat === 'groupByCategory') {
                    _.each(segment.values, function (value) {
                        var groupBy = _.find(
                            self.searchview.groupbysMapping,
                            function (mapping) {
                                return mapping.groupby.attrs.context === value.attrs.context;
                            }
                        );
                        var eventData = {
                            category: 'groupByCategory',
                            itemId: groupBy.groupbyId,
                            isActive: true,
                            groupId: groupBy.groupId,
                        };
                        self.trigger_up('menu_item_toggled', eventData);
                    });
                } else if (segment.cat === 'filterCategory') {
                    var new_filters = [];
                    _.each(segment.values, function (value) {
                        if (value.attrs.name) {
                            var filterDomain = _.find(
                                self.searchview.filtersMapping,
                                function (mapping) {
                                    return mapping.filter.attrs.name === value.attrs.name;
                                }
                            );
                            var eventData = {
                                category: 'filterCategory',
                                itemId: filterDomain.filterId,
                                isActive: true,
                                groupId: filterDomain.groupId,
                            };

                            self.trigger_up('menu_item_toggled', eventData);
                        } else {
                            new_filters.push({
                                groupId: null,
                                filter: {
                                    tag: 'filter',
                                    attrs: value.attrs
                                },
                                itemId: _.uniqueId('__filter__')
                            });
                        }
                    });
                    self.trigger_up('new_filters', new_filters);
                } else {
                    var search_widget = _.find(
                        self.searchview.search_fields, function (f) {
                            return f.attrs.name === segment.field.attrs.name;
                        }
                    );
                    new_facets.push({
                        category: segment.category,
                        field: search_widget,
                        values: segment.values,
                    });
                }
            });

            this.query.add(new_facets);
        },
    });

    SearchView.include({

        /**
         * Removes a value from a facet.
         *
         * @private
         * @param {Backbone.Model} model
         * @param {Integer|Object} value The value to remove
         */
        _removeValue: function (model, value) {
            var toRemove = model.values.filter(function (v) {
                if (typeof v.attributes.value === 'object') {
                    return v.attributes.value.attrs.domain === value;
                }

                return v.attributes.value.toString() === value;
            });
            model.values.remove(toRemove);
        },

        /**
         * Renders a popover for a facet.
         *
         * @private
         * @param {jQuery} $facet Element of the facet
         * @param {Backbone.Model} model
         */
        _renderPopover: function ($facet, model) {
            var self = this;
            var $content = $(qweb.render('web_edit_user_filter.Popover', {
                values: model.get('values'),
            }));
            // Cannot use Widget.events here because renderFacets is
            // triggered apart from renderElement
            $content.find('.list-group-item').click(function () {
                self._removeValue(model, $(this).attr('data-value'));
            });

            $facet.popover({
                title: _t('Edit Facet'),
                template: qweb.render('web_edit_user_filter.PopoverTemplate'),
                content: $content,
                container: this.$el,
                html: true,
                trigger: 'manual',
                placement: 'bottom',
                animation: false,
            });
        },

        /**
         * Hides all popovers.
         *
         * @private
         */
        _hidePopovers: function () {
            this.$el.find('.popover').popover('hide');
        },

        /**
         * @override
         */
        renderFacets: function () {
            var self = this;
            var res = this._super.apply(this, arguments);

            this.$el.find('.o-edit-user-filter-popover').remove();

            _.each(this.input_subviews, function (input_subview) {
                if (!input_subview.model ||
                    input_subview.model.attributes.is_custom_filter) {
                    return;
                }

                input_subview.$el.addClass('o-edit-user-filter-editable');
                self._renderPopover(input_subview.$el, input_subview.model);

                input_subview.$el.click(function () {
                    self._hidePopovers();
                    input_subview.$el.popover('show');
                });
            });
            return res;
        },

        /**
         * @override
         */
        start: function () {
            var self = this;
            var res = this._super.apply(this, arguments);
            this._proxyHidePopovers = this.proxy('_hidePopovers');
            $(document).click(this._proxyHidePopovers);
            return res;
        },

        /**
         * @override
         */
        destroy: function () {
            var res = this._super.apply(this, arguments);
            $(document).unbind('click', this._proxyHidePopovers);
            return res;
        }
    });
});
