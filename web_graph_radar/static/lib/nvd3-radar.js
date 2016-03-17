nv.models.radar = function() {

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , width = 500
        , height = 500
        , color = nv.utils.defaultColor() // a function that returns a color
        , getValue = function(d) { return d.value } // accessor to get the x value from a data point
        , size = 5
        , scales = d3.scale.linear()
        , radius
        , max = 5
        , startAngle = 0
        , cursor = 0
        , clipEdge = false
        ;

    var line = d3.svg.line()
        .x(function(d) { return d.x})
        .y(function(d) { return d.y});

    var  scatter = nv.models.scatter()
            .size(16) // default size
            .sizeDomain([16,256])
        ;

    //============================================================


    //============================================================
    // Private Variables
    //------------------------------------------------------------


    //============================================================


    function chart(selection) {
        selection.each(function(data) {

            var availableWidth = width - margin.left - margin.right,
                availableHeight = height - margin.top - margin.bottom,
                container = d3.select(this)
                ;

            // max = max || d3.max(data, getValue) > 0 ? d3.max(data, getValue) : 1

            scales.domain([0, max]).range([0,radius]);

            var current = 0;
            if (cursor < 0) {
                current = Math.abs(cursor);
            }
            else if (cursor > 0) {
                current = size - cursor;
            }


            //------------------------------------------------------------
            // Setup Scales
            //compute proportions
            var maxValue = 0;
            for(var i=0; i<data.length; i++) {
                var serie = data[i].values;
                for(var j=0; j<serie.length; j++) {
                    if (serie[j].value > maxValue) {
                        maxValue = serie[j].value;
                    }
                }
            }
            var factor = maxValue ? (radius-40)/maxValue/max/2 : 0;
            data = data.map(function(serie, i) {
                serie.values = serie.values.map(function(value, j) {
                    value.x = calculateX(value.value*factor, j, size);
                    value.y = calculateY(value.value*factor, j, size);
                    value.serie = i;
                    value.focus = (current == j) ? true : false;
                    return value;
                });
                return serie;
            });

            //------------------------------------------------------------



            //------------------------------------------------------------
            // Setup containers and skeleton of chart

            var wrap = container.selectAll('g.nv-wrap.nv-radar').data([data]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-radar');
            var defsEnter = wrapEnter.append('defs');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g')

            gEnter.append('g').attr('class', 'nv-groups');
            gEnter.append('g').attr('class', 'nv-scatterWrap');


            // wrap.attr('transform', 'translate(' + radius + ',' + radius + ')');

            //------------------------------------------------------------

            // Points
            scatter
                .xScale(scales)
                .yScale(scales)
                .zScale(scales)
                .color(color)
                .useVoronoi(false)
                .width(availableWidth)
                .height(availableHeight);

            var scatterWrap = wrap.select('.nv-scatterWrap');
            //.datum(data); // Data automatically trickles down from the wrap

            d3.transition(scatterWrap).call(scatter);

            defsEnter.append('clipPath')
                .attr('id', 'nv-edge-clip-' + scatter.id())
                .append('rect');

            wrap.select('#nv-edge-clip-' + scatter.id() + ' rect')
                .attr('width', availableWidth)
                .attr('height', availableHeight);

            g.attr('clip-path', clipEdge ? 'url(#nv-edge-clip-' + scatter.id() + ')' : '');
            scatterWrap
                .attr('clip-path', clipEdge ? 'url(#nv-edge-clip-' + scatter.id() + ')' : '');


            // Series
            var groups = wrap.select('.nv-groups').selectAll('.nv-group').data(function(d) { return d }, function(d) { return d.key });
            groups.enter().append('g')
                .style('stroke-opacity', 1e-6)
                .style('fill-opacity', 1e-6);
            d3.transition(groups.exit())
                .style('stroke-opacity', 1e-6)
                .style('fill-opacity', 1e-6)
                .remove();
            groups
                .attr('class', function(d,i) { return 'nv-group nv-series-' + i })
                .style('fill', function(d,i){ return color(d,i); })
                .style('stroke', function(d,i){ return color(d,i); });
            d3.transition(groups)
                .style('stroke-opacity', 1)
                .style('fill-opacity', .5);

            var lineRadar = groups.selectAll('path.nv-line').data(function(d) { return [d.values] });

            lineRadar.enter().append('path')
                .attr('class', 'nv-line')
                .attr('d', line );


            d3.transition(lineRadar.exit())
                .attr('d', line)
                .remove();

            lineRadar
                .style('fill', function(d){ return color(d,d[0].serie); })
                .style('stroke', function(d,i,j){ return color(d,d[0].serie); })

            d3.transition(lineRadar)
                .attr('d', line );



        });

        return chart;
    }

    // compute an angle
    function angle(i, length) {
        return i * (2 * Math.PI / length ) + ((2 * Math.PI)  * startAngle / 360) + (cursor*2*Math.PI)/length;
    }

    // x-caclulator
    // d is the datapoint, i is the index, length is the length of the data
    function calculateX(d, i, length) {
        var l = scales(d);
        return Math.sin(angle(i, length)) * l;
    }

    // y-calculator
    function calculateY(d, i, length) {
        var l = scales(d);
        return Math.cos(angle(i, length)) * l;
    }


    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = scatter.dispatch;
    chart.scatter = scatter;

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
        margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.size = function(_) {
        if (!arguments.length) return size;
        size = _;
        return chart;
    };

    chart.scales = function(_) {
        if (!arguments.length) return scales;
        scales = _;
        return chart;
    };

    chart.max = function(_) {
        if (!arguments.length) return max;
        max = _;
        return chart;
    };

    chart.radius = function(_) {
        if (!arguments.length) return radius;
        radius = _;
        return chart;
    };

    chart.color = function(_) {
        if (!arguments.length) return color;
        color = nv.utils.getColor(_);
        return chart;
    };

    chart.startAngle = function(_) {
        if (!arguments.length) return startAngle;
        startAngle = _;
        return chart;
    };

    chart.cursor = function(_) {
        if (!arguments.length) return cursor;
        cursor = _;
        return chart;
    };

    //============================================================


    return chart;
}

nv.models.radarChart = function() {

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var radars = nv.models.radar()
        , legend = nv.models.legend();

    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , color = nv.utils.defaultColor()
        , width = null
        , height = null
        , showLegend = true
        , legs = []
        , ticks = 10 //Temp to test radar size issue
        , scales = d3.scale.linear()
        , edit = false
        , radius
        , startAngle = 180
        , cursor = 0
        , tooltips = true
        , transitionDuration = 250
        , tooltip = function(key, leg, value, e, graph) {
            return '<h3>' + key + '</h3>' +
                   '<p>' + leg + ': ' +  value + '</p>'
          }
        , dispatch = d3.dispatch('tooltipShow', 'tooltipHide','prevClick','stateChange')
    ;

    var line = d3.svg.line()
        .x(function(d) { return d.x})
        .y(function(d) { return d.y});

    //============================================================


    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var showTooltip = function(e, offsetElement) {

        // New addition to calculate position if SVG is scaled with viewBox, may move TODO: consider implementing everywhere else
        if (offsetElement) {
            var svg = d3.select(offsetElement).select('svg');
            var viewBox = svg.attr('viewBox');
            if (viewBox) {
                viewBox = viewBox.split(' ');
                var ratio = parseInt(svg.style('width')) / viewBox[2];
                e.pos[0] = e.pos[0] * ratio;
                e.pos[1] = e.pos[1] * ratio;
            }
        }

        var left = e.pos[0] + ( offsetElement.offsetLeft || 0 ),
            top = e.pos[1] + ( offsetElement.offsetTop || 0),
            val = e.series.values[e.pointIndex].value,
            leg = legs[e.pointIndex].label,
            content = tooltip(e.series.key, leg, val, e, chart);
            nv.tooltip.show([left, top], content, null, null, offsetElement);
    };

    //============================================================


    function chart(selection) {
        selection.each(function(data) {
            legs=data[0].values;//TODO: Think in a better way to put only the legs of the radar
            var container = d3.select(this),
                that = this,
                size = legs.length,
                availableWidth = (width  || parseInt(container.style('width')) || 500) - margin.left - margin.right,
                availableHeight = (height || parseInt(container.style('height')) || 500) - margin.top - margin.bottom;

            chart.update = function() { container.transition().duration(transitionDuration).call(chart) };
            chart.container = this;

            var current = 0;
            if (cursor < 0) {
                current = Math.abs(cursor);
            }
            else if (cursor > 0) {
                 current = legs.length - cursor;
            }

            //------------------------------------------------------------
            // Setup Scales

            // scales = radars.scales();
            radius = (availableWidth-300 >= availableHeight) ? (availableHeight)/2 : (availableWidth-300)/2;
            scales.domain([0, ticks]).range([0,radius]);

            //------------------------------------------------------------

            //------------------------------------------------------------
            // Setup containers and skeleton of chart

            var wrap = container.selectAll('g.nv-wrap.nv-radarChart').data([data]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-radarChart');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            gEnter.append('g').attr('class', 'nv-controlWrap');
            gEnter.append('g').attr('class', 'nv-gridWrap');
            gEnter.append('g').attr('class', 'nv-radarsWrap');
            gEnter.append('g').attr('class', 'nv-legendWrap');

            var gridWrap = wrap.select('g.nv-gridWrap');
            gridWrap.append("g").attr("class", "grid");
            gridWrap.append("g").attr("class", "axes");

            wrap.attr('transform', 'translate(' + parseFloat(radius + margin.left) + ',' + parseFloat(radius + margin.top) + ')');

            //------------------------------------------------------------


            //------------------------------------------------------------
            // Legend

            if (showLegend) {
                legend.width(30);

                g.select('.nv-legendWrap')
                    .datum(data)
                    .call(legend);

                /*
                if ( margin.top != legend.height()) {
                  margin.top = legend.height();
                  availableHeight = (height || parseInt(container.style('height')) || 400)
                                     - margin.top - margin.bottom;
                }
                */
                g.select('.nv-legendWrap')
                    .attr('transform', 'translate(' + (radius + margin.left + margin.right) + ',' + (-radius) +')');
            }

            //------------------------------------------------------------

            if (edit) {
                startAngle = 135
                //Focus
                var currentLeg = legs[current];
                var rgbLeg = hexToRgb("#000000");
                var controlWrap = wrap.select('g.nv-controlWrap');

                wrap.select('g.control').remove();
                var controlEnter = controlWrap.append("g")
                    .attr("class", "control");

                var controlLine = controlEnter.append("svg:line")
                    .attr('class', 'indicator')
                    .style("stroke", "#000000")
                    .style("fill", "none")
                    .style("opacity", 1)
                    .style("stroke-width", 1.5)
                    .attr("x1", Math.sin(angle(current, size)) * scales(scales.domain()[1]))
                    .attr("y1", Math.cos(angle(current, size)) * scales(scales.domain()[1]))
                    .attr("x2", Math.sin(angle(current, size)) * scales(scales.domain()[1]))
                    .attr("y2", Math.cos(angle(current, size)) * scales(scales.domain()[1]));

                var controlDescription = controlEnter.append("svg:foreignObject")
                    .attr('width',200)
                    .attr('height',0)
            		.attr("x", Math.sin(angle(current, size)) * scales(scales.domain()[1]) * 2)
    				.attr("y", Math.cos(angle(current, size)) * scales(scales.domain()[1]));

                controlDescription.append("xhtml:div")
                        .attr('class', 'radar-description')
                        .style("background-color", 'rgba('+rgbLeg.r+','+rgbLeg.g+','+rgbLeg.b+',0.1)')
                        .style('border-bottom', '1px solid '+"#000000")
                        .style("padding", "10px")
                        .style("text-align", "justify")
                        .text( currentLeg.description );


                var controlActionContent = controlEnter.append("svg:foreignObject")
                    .attr('width',200)
                    .attr('height',50)
                    .attr("x", Math.sin(angle(current, size)) * scales(scales.domain()[1]) * 2)
        			.attr("y", Math.cos(angle(current, size)) * scales(scales.domain()[1]) - 25);

                controlActionContent.append("xhtml:button")
                        .attr('type','button')
                        .attr('class','radar-prev btn btn-mini icon-arrow-left')
                        .text('prev');


                var controlSelect = controlActionContent.append("xhtml:select")
                    .attr('class','radar-select-note');

                controlSelect.append('xhtml:option')
                            .attr('value',0)
                           // .attr('selected', function(d,i){ return (d[0].values[current].value == 0) ? true : false;})
                            .text('Note')
                controlSelect.append('xhtml:option')
                            .attr('value',1)
                        //    .attr('selected', function(d,i){ return (d[0].values[current].value == 1) ? true : false;})
                            .text('Nul')
                controlSelect.append('xhtml:option')
                            .attr('value',2)
                            //.attr('selected', function(d,i){ return (d[0].values[current].value == 2) ? true : false;})
                            .text('Mauvais')
                controlSelect.append('xhtml:option')
                            .attr('value',3)
                        //    .attr('selected', function(d,i){ return (d[0].values[current].value == 3) ? true : false;})
                            .text('Nul')
                controlSelect.append('xhtml:option')
                            .attr('value',4)
                         //   .attr('selected', function(d,i){ return (d[0].values[current].value == 4) ? true : false;})
                            .text('Bien')
                controlSelect.append('xhtml:option')
                            .attr('value',5)
                         //   .attr('selected', function(d,i){ return (d[0].values[current].value == 4) ? true : false;})
                            .text('Très bien')

                controlActionContent.append("xhtml:button")
                        .attr('type','button')
                        .attr('class','radar-next btn btn-mini icon-arrow-right')
                        .text('next');


                var checkOption = function (d) {
                    if(d[0].values[current].value == this.value){
                        return d3.select(this).attr("selected", "selected");
                    }
                };

                controlSelect.selectAll("option").each(checkOption);

                // Animation
                controlLine.transition().duration(500)
                    .attr("x1", Math.sin(angle(current, size)) * scales(scales.domain()[1]))
                    .attr("y1", Math.cos(angle(current, size)) * scales(scales.domain()[1]))
                    .attr("x2", Math.sin(angle(current, size)) * scales(scales.domain()[1]) * 2 + 200)
                    .attr("y2", Math.cos(angle(current, size)) * scales(scales.domain()[1]))
                    .each('end',  function(d){ controlDescription.transition().duration(300).attr('height','100%') });

                // Controls
                controlWrap.select('.radar-prev')
                    .on('click', function(d) {
                        chart.prev();
                        selection.transition().call(chart);
                    });
                controlWrap.select('.radar-next')
                    .on('click', function(d) {
                        chart.next();
                        selection.transition().call(chart);
                    });

                controlWrap.select('.radar-select-note')
                    .on('change', function(d) {
                        d[0].values[current].value = this.value;
                        chart.next();
                        selection.transition().call(chart);
                    });

                //change
            } else {
                cursor = 0;
                startAngle = 180;
                wrap.select('g.control').remove();
            }

            //------------------------------------------------------------
            // Main Chart Component(s)

            radars
                .width(availableWidth)
                .height(availableHeight)
                .size(legs.length)
                .max(ticks)
                .startAngle(startAngle)
                .cursor(cursor)
               // .scales(scales)
                .radius(radius)
                .color(data.map(function(d,i) {
                    return d.color || color(d, i);
                }).filter(function(d,i) { return !data[i].disabled }))
                ;


            var radarWrap = g.select('.nv-radarsWrap')
                .datum(data.filter(function(d) { return !d.disabled }));

            d3.transition(radarWrap).call(radars);

            //------------------------------------------------------------

            //------------------------------------------------------------
            // Setup Axes

            // the grid data, number of ticks
            var gridData = buildAxisGrid(size, ticks);

            // Grid
            var grid = wrap.select('.grid').selectAll('.gridlevel').data(gridData);
            grid.exit().remove();

            grid.enter().append("path")
                .attr("class", "gridlevel")
                .attr("d", line);


            d3.transition(grid)
                .attr('d', line );

            grid.style("stroke", "#000")
                .style("fill", "none")
                .style("opacity", 0.3);

            // Axes
            var ax = wrap.select("g.axes").selectAll("g.axis").data(legs);
            ax.exit().remove();

			var axEnter = ax.enter().append("g")
                .attr("class", "axis");

            var legText = axEnter.append("svg:text")
                .style("text-anchor", function(d, i) {
					var x = Math.sin(angle(i, size)) * scales(scales.domain()[1]);
					if (Math.abs(x) < 0.1) {
						return "middle"
					}
					if (x > 0) {
						return "start"
					}

					return "end"
				})
				.attr("dy", function(d, i) {
					var y = Math.cos(angle(i, size)) * scales(scales.domain()[1]);

					if (Math.abs(y) < 0.1) {
						return ".72em"
					}

					if (y > 0) {
						return "1em"
					}
					return "-.3em"
				})
				.style("fill", function(d){ return d.color; })
				.style("font-size", "9pt")
                .style("font-weight",function(d,i){ return (i == current && edit) ? "bold": "normal"; })
				.style("opacity", function(d,i){ return (i == current && edit) ? 1: 0.4; })
				.text(function(d){ return d.label})
				.attr("x", function(d, i) { return Math.sin(angle(i, size)) * scales(scales.domain()[1]);})
				.attr("y", function(d, i) { return Math.cos(angle(i, size)) * scales(scales.domain()[1]);})
                ;

            legText.on('click', function(d,i) {
                    chart.cursor(legs.length - i);
                    selection.transition().call(chart);
                });

            d3.transition(ax)
                .select("text")
                .style("text-anchor", function(d, i) {
    				var x = Math.sin(angle(i, size)) * scales(scales.domain()[1]);
					if (Math.abs(x) < 0.1) {
						return "middle"
					}
					if (x > 0) {
						return "start"
					}

					return "end"
				})
				.attr("dy", function(d, i) {
					var y = Math.cos(angle(i, size)) * scales(scales.domain()[1]);

					if (Math.abs(y) < 0.1) {
						return ".72em"
					}

					if (y > 0) {
						return "1em"
					}
					return "-.3em"
				})
                .style("font-weight",function(d,i){ return (i == current && edit) ? "bold": "normal"; })
    			.style("opacity", function(d,i){ return (i == current && edit) ? 1: 0.4; })
				.attr("x", function(d, i) { return Math.sin(angle(i, size)) * scales(scales.domain()[1]);})
				.attr("y", function(d, i) { return Math.cos(angle(i, size)) * scales(scales.domain()[1]);});

            axEnter.append("svg:line")
                .style("stroke", function(d){ return d.color; })
                .style("fill", "none")
                .style("stroke-width", 2)
                .style("opacity", function(d,i){ return (i == current && edit) ? 1: 0.4; })
                .attr("x1", function(d, i) { return Math.sin(angle(i, size)) * scales(scales.domain()[0]);})
                .attr("y1", function(d, i) { return Math.cos(angle(i, size)) * scales(scales.domain()[0]);})
                .attr("x2", function(d, i) { return Math.sin(angle(i, size)) * scales(scales.domain()[1]);})
                .attr("y2", function(d, i) { return Math.cos(angle(i, size)) * scales(scales.domain()[1]);});

            d3.transition(ax)
                .select("line")
                .style("opacity", function(d,i){ return (i == current && edit) ? 1: 0.4; })
                .attr("x1", function(d, i) { return Math.sin(angle(i, size)) * scales(scales.domain()[0]);})
                .attr("y1", function(d, i) { return Math.cos(angle(i, size)) * scales(scales.domain()[0]);})
                .attr("x2", function(d, i) { return Math.sin(angle(i, size)) * scales(scales.domain()[1]);})
                .attr("y2", function(d, i) { return Math.cos(angle(i, size)) * scales(scales.domain()[1]);});
            //------------------------------------------------------------

            //============================================================
            // Event Handling/Dispatching (in chart's scope)
            //------------------------------------------------------------

            radars.dispatch.on('elementClick', function(d,i) {
                chart.cursor(legs.length - d.pointIndex);
                selection.transition().call(chart);
            });
            legend.dispatch.on('stateChange', function(newState) {
                state = newState;
                dispatch.stateChange(state);
                chart.update();
            });
            /*legend.dispatch.on('legendClick', function(d,i) {
                if (!d.disabled) return;
                data = data.map(function(s) {
                    s.disabled = true;
                    return s;
                });
                d.disabled = false;

                switch (d.key) {
                    case 'Grouped':
                        multibar.stacked(false);
                        break;
                    case 'Stacked':
                        multibar.stacked(true);
                        break;
                }

                state.stacked = multibar.stacked();
                dispatch.stateChange(state);

                chart.update();
            });*/

           /* legend.dispatch.on('legendClick', function(d,i) {
                d.disabled = !d.disabled;

                if (!data.filter(function(d) { return !d.disabled }).length) {
                    data.map(function(d) {
                        d.disabled = false;
                        wrap.selectAll('.nv-series').classed('disabled', false);

                        return d;
                    });
                }
                chart.update();
            });*/

            dispatch.on('tooltipShow', function(e) {
                e.pos = [parseFloat(e.pos[0] + availableHeight/2 + margin.left), parseFloat(e.pos[1] + availableHeight/2 + margin.top)];
                if (tooltips) showTooltip(e, that.parentNode);
            });

            //============================================================

        });

        return chart;
    }

    function hexToRgb(hex,opacity) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // compute an angle
    function angle(i, length) {
        return i * (2 * Math.PI / length ) + ((2 * Math.PI)  * startAngle / 360) + (cursor*2*Math.PI)/length;
    }

    // x-caclulator
    // d is the datapoint, i is the index, length is the length of the data
    function calculateX(d, i, length) {
        var l = scales(d);
        return Math.sin(angle(i, length)) * l;
    }

    // y-calculator
    function calculateY(d, i, length) {
        var l = scales(d);
        return Math.cos(angle(i, length)) * l;
    }

    // * build the spider axis * //
    // rewrite this to conform to d3 axis style? //
    function buildAxisGrid(length, ticks) {
        var min = scales.domain()[0];
        var max = scales.domain()[1] > 0 ? scales.domain()[1] : 1;
        var increase = max/ticks;

        var gridData = []
        for (var i = 0; i <= ticks; i++ ) {
            var val = min + i*increase;
            var d = [val];
            var gridPoints = [];

            for (var j = 0; j <= length; j++) {
                gridPoints.push({
                    x: calculateX(d, j, length),
                    y: calculateY(d, j, length),
                });
            }

            gridData.push(gridPoints)
        }

        return gridData;
    }

    //============================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------

    radars.dispatch.on('elementMouseover.tooltip', function(e) {
        dispatch.tooltipShow(e);
    });

    radars.dispatch.on('elementMouseout.tooltip', function(e) {
        dispatch.tooltipHide(e);
    });

    dispatch.on('tooltipHide', function() {
        if (tooltips) nv.tooltip.cleanup();
    });

    //============================================================


    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    // expose chart's sub-components
    chart.dispatch = dispatch;
    chart.radars = radars;


    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
        margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.legs = function(_) {
        if (!arguments.length) return legs;
        legs = _;
        return chart;
    };

    chart.showLegend = function(_) {
        if (!arguments.length) return showLegend;
        showLegend = _;
        return chart;
    };

    chart.cursor = function(_) {
        if (!arguments.length) return cursor;
        cursor = _;
        return chart;
    };

    chart.next = function(_) {
        cursor = cursor - 1;
        if (Math.abs(cursor) > legs.length-1) cursor = 0;
        return chart;
    };

    chart.prev = function(_) {
        cursor = cursor + 1;
        if (cursor > legs.length-1) cursor = 0;
        return chart;
    };

    chart.edit = function(_) {
        if (!arguments.length) return edit;
        edit = _;
        return chart;
    };
    //============================================================


    return chart;
}
