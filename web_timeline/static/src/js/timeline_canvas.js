/* Copyright 2018 Onestein
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_timeline.TimelineCanvas', function (require) {
    "use strict";
    var Widget = require('web.Widget');

    /**
     * Used to draw stuff on upon the timeline view.
     */
    var TimelineCanvas = Widget.extend({
        template: 'TimelineView.Canvas',

        /**
         * Clears all drawings (svg elements) from the canvas.
         */
        clear: function () {
            this.$el.find(' > :not(defs)').remove();
        },

        /**
         * Gets the path from one point to another.
         *
         * @param {Number} coordx1
         * @param {Number} coordy1
         * @param {Number} coordx2
         * @param {Number} coordy2
         * @param {Number} width1
         * @param {Number} height1
         * @param {Number} width2
         * @param {Number} height2
         * @param {Number} widthMarker The marker's width of the polyline
         * @param {Number} breakAt The space between the line turns
         * @returns {Array} Each item represents a coordinate
         */
        get_polyline_points: function (coordx1, coordy1, coordx2, coordy2,
                                       width1, height1, width2, height2,
                                       widthMarker, breakAt) {
            var halfHeight1 = height1 / 2;
            var halfHeight2 = height2 / 2;
            var x1 = coordx1 - widthMarker;
            var y1 = coordy1 + halfHeight1;
            var x2 = coordx2 + width2;
            var y2 = coordy2 + halfHeight2;
            var xDiff = x1 - x2;
            var yDiff = y1 - y2;
            var threshold = breakAt + widthMarker;
            var spaceY = halfHeight2 + 6;

            var points = [[x1, y1]];
            if (y1 !== y2) {
                if (xDiff > threshold) {
                    points.push([x1 - breakAt, y1]);
                    points.push([x1 - breakAt, y1 - yDiff]);
                } else if (xDiff <= threshold) {
                    var yDiffSpace = yDiff > 0 ? spaceY : -spaceY;
                    points.push([x1 - breakAt, y1]);
                    points.push([x1 - breakAt, y2 + yDiffSpace]);
                    points.push([x2 + breakAt, y2 + yDiffSpace]);
                    points.push([x2 + breakAt, y2]);
                }
            } else if(x1 < x2) {
                points.push([x1 - breakAt, y1]);
                points.push([x1 - breakAt, y1 + spaceY]);
                points.push([x2 + breakAt, y2 + spaceY]);
                points.push([x2 + breakAt, y2]);
            }
            points.push([x2, y2]);

            return points;
        },

        /**
         * Draws an arrow.
         *
         * @param {HTMLElement} from Element to draw the arrow from
         * @param {HTMLElement} to Element to draw the arrow to
         * @param {String} color Color of the line
         * @param {Number} width Width of the line
         * @returns {HTMLElement} The created SVG polyline
         */
        draw_arrow: function (from, to, color, width) {
            return this.draw_line(from, to, color, width, '#arrowhead', 10, 12);
        },

        /**
         * Draws a line.
         *
         * @param {HTMLElement} from Element to draw the line from
         * @param {HTMLElement} to Element to draw the line to
         * @param {String} color Color of the line
         * @param {Number} width Width of the line
         * @param {String} markerStart Start marker of the line
         * @param {Number} widthMarker The marker's width of the polyline
         * @param {Number} breakLineAt The space between the line turns
         * @returns {HTMLElement} The created SVG polyline
         */
        draw_line: function (from, to, color, width, markerStart, widthMarker, breakLineAt) {
            var x1 = from.offsetLeft,
                y1 = from.offsetTop + from.parentElement.offsetTop,
                x2 = to.offsetLeft,
                y2 = to.offsetTop + to.parentElement.offsetTop,
                width1 = from.clientWidth,
                height1 = from.clientHeight,
                width2 = to.clientWidth,
                height2 = to.clientHeight;

            var points = this.get_polyline_points(
                x1, y1, x2, y2, width1, height1, width2, height2, widthMarker, breakLineAt
            );

            var polyline_points = _.map(points, function(point) {
                return point.join(',');
            }).join();

            var line = document.createElementNS(
                'http://www.w3.org/2000/svg', 'polyline'
            );
            line.setAttribute('points', polyline_points);
            line.setAttribute('stroke', color || '#000');
            line.setAttribute('stroke-width', width || 1);
            line.setAttribute('fill', 'none');
            if (markerStart) {
                line.setAttribute('marker-start', 'url(' + markerStart + ')');
            }
            this.$el.append(line);
            return line;
        },
    });

    return TimelineCanvas;
});
