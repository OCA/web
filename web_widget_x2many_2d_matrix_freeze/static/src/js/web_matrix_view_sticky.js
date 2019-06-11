/* global openerp, _, $ */
/* eslint require-jsdoc:0 */

openerp.web_widget_x2many_2d_matrix_freeze = function (instance) {
    "use strict";
    instance.web_widget_x2many_2d_matrix.FieldX2Many2dMatrix.include({

        sticky: false,
        stickyHead: null,
        stickyCol: null,
        stickyInsct: null,
        stickyWrap: null,
        view_manager: null,
        view_header: null,
        view_body: null,

        set_sticky_header_widths: function () {
            var self = this;
            this.stickyTable
                .find("thead th").each(function (i) {
                    self.stickyHead.find("th").eq(i).css(
                        "width", $(this).css("width"));
                })
                .end()
                .find("tr:gt(0)").each(function (i) {
                    var floatrow = self.stickyCol.find("tr").eq(i);
                    floatrow.css('height', $(this).css('height'));
                    floatrow.find("td").css({
                        "vertical-align": "inherit",
                        "border-bottom": "1px solid #dfdfdf",
                    });
                });

            // Set width of sticky table head
            this.stickyHead.width(this.stickyTable.width());

            // Set width of sticky table col
            var head_elms = self.stickyTable.find("thead th, thead td");
            this.stickyCol.find("tr").each(function(j) {
                $(this).find("th, td").slice(0, self.sticky_x).each(function (i) {
                    $(this)
                        .width(head_elms.eq(i).width());
                });
            });
        },

        reposition_sticky_head: function () {
            // Return value of calculated allowance
            var allowance = this.calc_allowance();

            // Check if wrapper parent is overflowing along the y-axis
            if (this.stickyTable.height() > this.stickyWrap.height()) {
                // If it is overflowing (advanced layout)
                // Position sticky header based on wrapper scrollTop()
                if (this.stickyWrap.scrollTop() > 0) {
                    // When top of wrapping parent is out of view
                    stickyHead.add(this.stickyInsct).css({
                        opacity: 1,
                        top: this.stickyWrap.scrollTop(),

                    });
                } else {
                    // When top of wrapping parent is in view
                    this.stickyHead.add(stickyInsct).css({
                        opacity: 0,
                        top: 0,
                    });
                }
            } else {
                // If it is not overflowing (basic layout)
                // Position sticky header based on viewport scrollTop
                var port_top = this.view_manager.offset().top + this.view_header.outerHeight();
                var table_top = this.stickyTable.offset().top;
                var table_left = this.stickyTable.offset().left;
                var table_bottom = table_top + this.stickyTable.outerHeight();
                if (port_top > table_top &&
                        port_top < (table_bottom - allowance)) {

                    // When top of viewport is in the table itself --
                    // For odoo, view port is for .oe_view_manager_body
                    // and not main body
                    this.stickyHead.add(this.stickyInsct).css({
                        opacity: 1,
                        top: port_top - table_top
                    });
                } else {
                    // When top of viewport is above or below table
                    this.stickyHead.add(this.stickyInsct).css({
                        opacity: 0,
                        top: 0,
                    });
                }
            }
        },

        reposition_sticky_col: function () {
            if (this.stickyWrap.scrollLeft() > 0) {
                // When left of wrapping parent is out of view

                this.stickyCol.add(this.stickyInsct).css({
                    opacity: 1,
                    left: this.stickyWrap.scrollLeft(),
                });
            } else {
                // When left of wrapping parent is in view
                this.stickyCol
                    .css({opacity: 0})
                    .add(this.stickyInsct).css({left: 0});
            }
        },

        calc_allowance: function () {
            var a = 0;
            var self = this;
            // Calculate allowance
            this.stickyTable.find("tbody tr:lt(3)").each(function () {
                a += self.stickyTable.height();
            });

            // Set fail safe limit (last three row might be too tall)
            // Set arbitrary limit at 0.25 of viewport height, or you
            // can use an arbitrary pixel value
            var wheight25 = $(window).height() * 0.25;
            if (a > wheight25) {
                a = wheight25;
            }

            // Add the height of sticky header
            a += this.stickyHead.height();
            return a;
        },

        sticky_adjust: function() {
            this.set_sticky_header_widths();
            this.reposition_sticky_head();
            this.reposition_sticky_col();
        },

        start: function () {
            this._super.apply(this, arguments);

            if (this.node.attrs.sticky) {
                this.make_template_sticky();

                var self = this;
                var sticky_adjust = _.debounce(function() {
                    self.set_sticky_header_widths();
                    self.reposition_sticky_head();
                    self.reposition_sticky_col();
                }, 50);

                this.view_body.scroll(sticky_adjust);

                this.set_sticky_header_widths();
            }
        },

        renderElement: function () {
            this._super.apply(this, arguments);
            if (this.node.attrs.sticky) {
                if (this.view_manager && this.view_manager.length == 1)
                    this.make_template_sticky();
            }
        },

        make_template_sticky: function() {
            var self = this;
            var _table = this.$el.find("table");

            if (this.node.attrs.sticky && _table.length > 0 && _table.parent('.sticky-wrap').length == 0) {

                this.sticky_x = parseInt(this.node.attrs.sticky_x) || 1;

                // Clone <thead>
                var thead = _table.find("thead").clone(),
                    col = _table.find("tbody").clone();

                // Add class, remove margins, reset width and wrap table
                _table
                    .addClass("sticky-enabled")
                    .wrap("<div class=\"sticky-wrap\" />");

                if (_table.hasClass("overflow-y")) {
                    _table.removeClass(
                        "overflow-y"
                    ).parent().addClass("overflow-y");
                }

                // Create new sticky table head (basic)
                _table.after("<table class=\"oe_list_content sticky-thead\" />");

                // If <tbody> contains <th>, then we create sticky column
                // and intersect (advanced)
                if (_table.find("tbody th").length > 0) {
                    _table.after(
                        "<table class=\"oe_list_content sticky-col\" />" +
                        "<table class=\"sticky-intersect\" />");
                }

                // Create shorthand for things
                this.sticky = true;
                this.view_manager = this.$el.parents(".oe_view_manager").first();
                this.view_header = this.view_manager.find(".oe_view_manager_header");
                this.view_body = this.view_manager.find(".oe_view_manager_body");
                this.stickyTable = _table;
                this.stickyHead = _table.siblings(".sticky-thead");
                this.stickyCol = _table.siblings(".sticky-col");
                this.stickyInsct = _table.siblings(".sticky-intersect");
                this.stickyWrap = _table.parent(".sticky-wrap");

                this.stickyHead.append(thead);

                this.stickyCol
                    .append(col)
                    .find("tr")
                    .each(function() {
                        $(this)
                            .find("td,th")
                            .slice(self.sticky_x)
                            .css("display", "none");
                    });
                var margin = $(_table.find("thead th")[0]).css("height");
                this.stickyCol.css({
                    "background": "#f0eeee",
                    "margin-top": String(String(margin)),
                });
                this.stickyInsct.html(
                    "<thead><tr><th>" + _table.find("thead th:first-child").html() +
                    "</th></tr></thead>");

                var sticky_adjust = _.debounce(function() {
                    self.set_sticky_header_widths();
                    self.reposition_sticky_head();
                    self.reposition_sticky_col();
                }, 50);
                this.stickyWrap.scroll(sticky_adjust);

            }

        },
    });
};
