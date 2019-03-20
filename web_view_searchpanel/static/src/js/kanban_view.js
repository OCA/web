/**********************************************************************************
*
*    Copyright (c) 2017-2019 MuK IT GmbH.
*
*    This file is part of MuK Search Panel 
*    (see https://mukit.at).
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU Lesser General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU Lesser General Public License for more details.
*
*    You should have received a copy of the GNU Lesser General Public License
*    along with this program. If not, see <http://www.gnu.org/licenses/>.
*
**********************************************************************************/

odoo.define('muk_web_searchpanel.KanbanView', function (require) {
"use strict";

var core = require('web.core');
var config = require('web.config');
var pyUtils = require('web.py_utils');
var utils = require('web.utils');

var KanbanView = require('web.KanbanView');
var SearchPanel = require('web.SearchPanel');

var _t = core._t;
var QWeb = core.qweb;

KanbanView.include({
	config: _.extend({}, KanbanView.prototype.config, {
		SearchPanel: SearchPanel,
    }),
    init: function (viewInfo, params) {
    	this.searchPanelSections = Object.create(null);
    	this._super.apply(this, arguments);
    	this.hasSearchPanel = !_.isEmpty(this.searchPanelSections);

    },
    getController: function (parent) {
    	var self = this;
    	var def = undefined;
    	if (this.hasSearchPanel) {
            def = this._createSearchPanel(parent);
        }
        var _super = this._super.bind(this);
    	return $.when(def).then(function (searchPanel) {
            return _super(parent).done(function (controller) {
                if (self.hasSearchPanel) {
                	self.controllerParams.searchPanel.setParent(controller);
                }
                return controller
            });
        });
    },
    _createSearchPanel: function (parent) {
        var self = this;
        var defaultCategoryValues = {};
        Object.keys(this.loadParams.context).forEach(function (key) {
            var match = /^searchpanel_default_(.*)$/.exec(key);
            if (match) {
                defaultCategoryValues[match[1]] = self.loadParams.context[key];
            }
        });
        var controlPanelDomain = this.loadParams.domain;
        var searchPanel = new this.config.SearchPanel(parent, {
            defaultCategoryValues: defaultCategoryValues,
            fields: this.fields,
            model: this.loadParams.modelName,
            searchDomain: controlPanelDomain,
            sections: this.searchPanelSections,
        });
        this.controllerParams.searchPanel = searchPanel;
        this.controllerParams.controlPanelDomain = controlPanelDomain;
        return searchPanel.appendTo(document.createDocumentFragment()).then(function () {
            var searchPanelDomain = searchPanel.getDomain();
            self.loadParams.domain = controlPanelDomain.concat(searchPanelDomain);
        });
    },
    _processNode: function (node, fv) {
        if (node.tag === 'searchpanel') {
//            if (!config.device.isMobile) {
//                this._processSearchPanelNode(node, fv);
//            }
        	this._processSearchPanelNode(node, fv);
            return false;
        }
        return this._super.apply(this, arguments);
    },
    _processSearchPanelNode: function (node, fv) {
        var self = this;
        node.children.forEach(function (childNode, index) {
            if (childNode.tag !== 'field') {
                return;
            }
            if (childNode.attrs.invisible === "1") {
                return;
            }
            var fieldName = childNode.attrs.name;
            var type = childNode.attrs.select === 'multi' ? 'filter' : 'category';

            var sectionId = _.uniqueId('section_');
            var section = {
                color: childNode.attrs.color,
                description: childNode.attrs.string || fv.fields[fieldName].string,
                fieldName: fieldName,
                icon: childNode.attrs.icon,
                id: sectionId,
                index: index,
                type: type,
            };
            if (section.type === 'category') {
                section.icon = section.icon || 'fa-folder';
            } else if (section.type === 'filter') {
                section.disableCounters = !!pyUtils.py_eval(childNode.attrs.disable_counters || '0');
                section.domain = childNode.attrs.domain || '[]';
                section.groupBy = childNode.attrs.groupby;
                section.icon = section.icon || 'fa-filter';
            }
            self.searchPanelSections[sectionId] = section;
        });
    },
});


});
