/* global QUnit */
/* Copyright 2016 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define('web_responsive.test', function(require) {
    "use strict";

    var core = require('web.core');
    var responsive = require('web_responsive');

    QUnit.module('web_responsive', {
        beforeEach: function() {
            var $el = $(
                '<div class="drawer drawer--left">' +
                    '<header role="banner">' +
                        '<button class="drawer-toggle">' +
                            '<span class="drawer-hamburger-icon"/>' +
                        '</button>' +
                        '<nav class="drawer-nav">' +
                            '<ul class="drawer-menu">' +
                                '<li class="drawer-menu-item"/>' +
                            '</ul>' +
                        '</nav>' +
                        '<div class="panel-title" id="appDrawerAppPanelHead"></div>' +
                    '</header>' +
                    '<main role="main"></main>' +
                    '<a class="oe_menu_leaf"/>' +
                    '<div>' +
                        '<div class="o_sub_menu_content"></div>' +
                    '</div>' +
                    '<div class="dropdown-scrollable"></div>' +
                '</div>'
            );

            this.$clickZone = $el.find('a.oe_menu_leaf');
            this.$secondaryMenu = $el.find('div.o_sub_menu_content').parent();
            this.$dropdown = $el.find('div.dropdown-scrollable');

            this.document = $("#qunit-fixture");
            this.document.append($el);

            this.drawer = new responsive.AppDrawer();
        },

        linkGrid: function() {
            for(var i = 0; i < 3; i++){
                this.drawer.$el.append(
                    $('<div class="row">').append(
                        $('<a class="col-md-6" id="a_' + i + '"><span class="app-drawer-icon-app /></a>' +
                          '<a class="col-md-6" id="b_' + i + '"><span class="app-drawer-icon-app /></a>'
                          )
                    )
                );
                this.drawer.$appLinks = this.drawer.$el.find('a.col-md-6');
            }
        }
    });

    QUnit.test('It should set initialized after success init',
        function(assert) {
            assert.expect(1);

            assert.ok(this.drawer.initialized);
        }
    );

    QUnit.test('It should close drawer after click on clickZone',
        function(assert) {
            assert.expect(1);

            this.$clickZone.click();

            var self = this;
            var d = $.Deferred();
            setTimeout(function() {
                assert.ok(self.drawer.$el.hasClass('drawer-close'));
                d.resolve();
            }, 100);

            return d;
        }
    );

    QUnit.test('It should collapse open secondary menus during handleClickZones',
        function(assert) {
            assert.expect(1);

            this.$clickZone.click();

            var self = this;
            var d = $.Deferred();
            setTimeout(function() {
                assert.equal(self.$secondaryMenu.attr('aria-expanded'), 'false');
                d.resolve();
            }, 200);

            return d;
        }
    );

    QUnit.test('It should update max-height on scrollable dropdowns',
        function(assert) {
            assert.expect(1);

            this.drawer.handleWindowResize();

            var height = $(window).height() * this.drawer.dropdownHeightFactor;
            var actual = parseFloat(this.$dropdown.css('max-height'));

            var pass = Math.abs(actual - height) < 0.001;

            assert.pushResult({
                result: pass,
                actual: actual,
                expect: height,
                message: ''
            });
        }
    );

    QUnit.test('It should trigger core bus event for drawer close',
        function(assert) {
            assert.expect(1);

            this.drawer.onDrawerOpen();
            var d = $.Deferred();
            core.bus.on('drawer.closed', this, function() {
                assert.ok(true);
                d.resolve();
            });

            this.drawer.$el.trigger({type: 'drawer.closed'});
            return d;
        }
    );

    QUnit.test('It should set isOpen to false when closing',
        function(assert) {
            assert.expect(1);

            this.drawer.onDrawerOpen();

            var self = this;
            var d = $.Deferred();
            setTimeout(function() {
                assert.equal(self.drawer.isOpen, false);
                d.resolve();
            }, 100);

            this.drawer.$el.trigger({type: 'drawer.closed'});

            return d;
        }
    );

    QUnit.test('It should set isOpen to true when opening',
        function(assert) {
            assert.expect(1);

            this.drawer.$el.trigger({type: 'drawer.opened'});

            var self = this;
            var d = $.Deferred();
            setTimeout(function() {
                assert.ok(self.drawer.isOpen);
                d.resolve();
            }, 100);

            return d;
        }
    );

    QUnit.test('It should trigger core bus event for drawer open',
        function(assert) {
            assert.expect(1);

            this.drawer.onDrawerOpen();
            var d = $.Deferred();

            core.bus.on('drawer.opened', this, function() {
                assert.ok(true);
                d.resolve();
            });

            this.drawer.$el.trigger({type: 'drawer.opened'});
            return d;
        }
    );

    QUnit.test('It should choose link to right',
        function(assert) {
            assert.expect(1);

            this.linkGrid();

            var $appLink = $('#a_1'),
                $expect = $('#a_2'),
                $res = this.drawer.findAdjacentLink(
                    $appLink, this.drawer.RIGHT
                );

            assert.equal($res[0].id, $expect[0].id);
        }
    );

    QUnit.test('It should choose link to left',
        function(assert) {
            assert.expect(1);

            this.linkGrid();
            var $appLink = $('#a_2'),
                $expect = $('#a_1'),
                $res = this.drawer.findAdjacentLink(
                    $appLink, this.drawer.LEFT
                );
            assert.equal($res[0].id, $expect[0].id);
        }
    );

    QUnit.test('It should choose link above',
        function(assert) {
            assert.expect(1);

            this.linkGrid();
            var $appLink = $('#a_1'),
                $expect = $('#a_0'),
                $res = this.drawer.findAdjacentLink(
                    $appLink, this.drawer.UP
                );
            assert.equal($res[0].id, $expect[0].id);
        }
    );

    QUnit.test('It should choose link below',
        function(assert) {
            assert.expect(1);

            this.linkGrid();
            var $appLink = $('#a_1'),
                $expect = $('#a_2'),
                $res = this.drawer.findAdjacentLink(
                    $appLink, this.drawer.DOWN
                );
            assert.equal($res[0].id, $expect[0].id);
        }
    );

    QUnit.test('It should choose first link if next on last',
        function(assert) {
            assert.expect(1);

            this.linkGrid();
            var $appLink = $('#b_2'),
                $expect = $('#a_0'),
                $res = this.drawer.findAdjacentLink(
                    $appLink, this.drawer.RIGHT
                );
            assert.equal($res[0].id, $expect[0].id);
        }
    );

    QUnit.test('It should choose bottom link if up on top',
        function(assert) {
            assert.expect(1);

            this.linkGrid();
            var $appLink = $('#a_0'),
                $expect = $('#a_2'),
                $res = this.drawer.findAdjacentLink(
                    $appLink, this.drawer.UP
                );
            assert.equal($res[0].id, $expect[0].id);
        }
    );

    QUnit.test('It should choose top link if down on bottom',
        function(assert) {
            assert.expect(1);

            this.linkGrid();
            var $appLink = $('#a_2'),
                $expect = $('#a_0'),
                $res = this.drawer.findAdjacentLink(
                    $appLink, this.drawer.DOWN
                );
            assert.equal($res[0].id, $expect[0].id);
        }
    );

});
