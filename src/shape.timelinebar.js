c3_chart_internal_fn.initTimelineLanes = function () { //console.log('initTimelineLanes');
    var $$ = this, config = $$.config, d3 = $$.d3;
    $$.lanes = $$.main.select('.' + CLASS.chart).append("g")
        .attr("class", CLASS.chartLanes)
        .selectAll();
    if ($$.hasTimelineType($$.data.targets)) {
        if (config.lane_combine) {
            $$.lanes.data($$.data.targets).enter().append("line")
                .attr("class", CLASS.chartLane)
                .attr('x1', 0)
                .attr('y1', 0.5)
                .attr('x2', 1)
                .attr('y2', 0.5);
        }
        else {
            $$.lanes.data($$.data.targets).enter().append("line")
                .attr("class", CLASS.chartLane)
                .attr('x1', 0)
                .attr('y1', function (d, i) { return d3.round((($$.height / $$.data.targets.length) * i)) + 0.5; })
                .attr('x2', 1)
                .attr('y2', function (d, i) { return d3.round((($$.height / $$.data.targets.length) * i)) + 0.5; });
        }
    }
};
c3_chart_internal_fn.initTimelineLaneAxis = function () { //console.log('initTimelineLaneAxis');
    var $$ = this, d3 = $$.d3,
        clipPathYAxis = $$.clipYAxis,
        yAxis = $$.main.selectAll('.' + CLASS.axisY),
        offset = 0;
    if ($$.hasTimelineType($$.data.targets)) {
        yAxis.selectAll('g').selectAll('text').each(function () {
            var _x = -1 * d3.select(this).attr('x');
            if (_x > offset) {
                offset = _x;
            }
        });
        $$.main.each(function () {
            d3.select(this).attr('transform', 'translate(' + 0.5 + offset + ',' + d3.transform(d3.select(this).attr('transform')).translate[1] + ')');
        });
        clipPathYAxis.each(function () {
            d3.select(this).attr('width', 0.5 + offset);
            d3.select(this).attr('x', -offset);
        });
    }
};
c3_chart_internal_fn.initTimelineLaneLabels = function () { //console.log('initTimelineLaneLabels');
    var $$ = this, config = $$.config, d3 = $$.d3;

    if ($$.hasTimelineType($$.data.targets)) {
        var boundingClientRectWidth = 0;
        var lane_labels;
        $$.lane_labels = $$.axes.y.selectAll();
        if (config.lane_combine) {
            lane_labels = $$.lane_labels.data([{id: 'timeline'}]);
            lane_labels.enter().append('g')
                .attr('class', 'lane')
                .attr("clip-path", $$.clipPathForYAxis)
                .attr("transform", $$.getTranslate('lane'))
                .style('opacity', 1)
                .append('text')
                    .text(function (d) { return d.id; })
                    .attr('x', function () {
                        if (this.getBoundingClientRect().width > boundingClientRectWidth) {
                            boundingClientRectWidth = this.getBoundingClientRect().width;
                        }
                        return (0.5 + this.getBoundingClientRect().width) * -1;
                    })
                    .attr('y', function () { return d3.round($$.height / 2); })
                    .attr("dy", ".32em");
            lane_labels.exit().remove();
        }
        else {
            lane_labels = $$.lane_labels.data($$.data.targets);
            var laneLabelsEnter = lane_labels.enter().append('g')
                    .attr('class', 'lane')
                    .attr("clip-path", $$.clipPathForYAxis)
                    .attr("transform", $$.getTranslate('lane'))
                    .style('opacity', 1);
            laneLabelsEnter.append('text')
                .text(function (d) { return d.id; })
                .attr('x', function () {
                    if (this.getBoundingClientRect().width > boundingClientRectWidth) {
                        boundingClientRectWidth = this.getBoundingClientRect().width;
                    }
                    return (5 + this.getBoundingClientRect().width) * -1;
                })
                .attr('y', function (d, i) { return d3.round((($$.height / $$.data.targets.length) * i) + ($$.height / $$.data.targets.length) / 2); })
                .attr("dy", ".32em");
        }

        $$.config.padding_left = boundingClientRectWidth;

        $$.axes.y.selectAll(CLASS.axis + ' ' + CLASS.axisY).attr("transform", 'translate(' + boundingClientRectWidth + ',0)');
    }
};
c3_chart_internal_fn.updateTargetsForTimeline = function (targets) { //console.log('updateTargetsForTimeline');
    var $$ = this, config = $$.config,
        mainTimelineUpdate, mainTimelineEnter,
        classChartBar = $$.classChartBar.bind($$),
        classLanes = $$.classLanes.bind($$);
    mainTimelineUpdate = $$.main.select('.' + CLASS.chartLanes).selectAll('.' + CLASS.chartBar)
        .data(targets)
        .attr('class', classChartBar);
    mainTimelineEnter = mainTimelineUpdate.enter().append('g')
        .attr('class', classChartBar)
        .style('opacity', 0)
        .style("pointer-events", "none");
    // Bars for each lane
    mainTimelineEnter.append('g')
        .attr("class", classLanes)
        .style("cursor", function (d) { return config.data_selection_isselectable(d) ? "pointer" : null; });
};
c3_chart_internal_fn.redrawTimeline = function (durationForExit) { //console.log('redrawTimeline');
    var $$ = this,
        timelineBarData = $$.timelineBarData.bind($$),
        classLane = $$.classLane.bind($$),
        initialOpacity = $$.initialOpacity.bind($$),
        color = function (d) { return $$.color(d); };
    $$.redrawTimelineLanes();
    $$.mainTimeline = $$.main.selectAll('.' + CLASS.lanes).selectAll('.' + CLASS.bar)
        .data(timelineBarData);
    $$.mainTimeline.enter().append('path')
        .attr("class", classLane)
        .style("stroke-width", 0)
        .style("fill", function (d) { return color(d.id); });
    $$.mainTimeline
        .style("opacity", initialOpacity);
    $$.mainTimeline.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawTimelineLanes = function () { //console.log('redrawTimelineLanes');
    var $$ = this, config = $$.config, d3 = $$.d3;
    if ($$.hasTimelineType($$.data.targets)) {
        if (config.lane_combine) {
            $$.lanes.data($$.data.targets).enter().append("line")
                .attr("class", CLASS.chartLane)
                .attr('x1', 0)
                .attr('y1', 0.5)
                .attr('x2', $$.width)
                .attr('y2', 0.5);
        }
        else {
            $$.lanes.data($$.data.targets).enter().append("line")
                .attr("class", CLASS.chartLane)
                .attr('x1', 0)
                .attr('y1', function (d, i) { return d3.round((($$.height / $$.data.targets.length) * i)) + 0.5; })
                .attr('x2', $$.width)
                .attr('y2', function (d, i) { return d3.round((($$.height / $$.data.targets.length) * i)) + 0.5; });
        }
    }
};
c3_chart_internal_fn.redrawTimelineLaneAxis = function () { //console.log('redrawTimelineLaneAxis');
    var $$ = this, d3 = $$.d3,
        clipPathYAxis = $$.clipYAxis,
        yAxis = $$.main.selectAll('.' + CLASS.axisY),
        offset = 0;
    if ($$.hasTimelineType($$.data.targets)) {
        yAxis.selectAll('g').selectAll('text').each(function () {
            var _x = -1 * d3.select(this).attr('x');
            if (_x > offset) {
                offset = _x;
            }
        });
        $$.main.each(function () {
            d3.select(this).attr('transform', 'translate(' + (0.5 + offset) + ',' + d3.transform(d3.select(this).attr('transform')).translate[1] + ')');
        });
        clipPathYAxis.each(function () {
            d3.select(this).attr('width', 0.5 + offset);
            d3.select(this).attr('x', -1 * (offset - 0.5));
        });
    }
};
c3_chart_internal_fn.addTransitionForTimeline = function (transitions, drawTimeline) { //console.log('addTransitionForTimeline');
    var $$ = this;
    transitions.push($$.mainTimeline.transition()
                     .attr('d', drawTimeline)
                     .style("fill", $$.color)
                     .style("opacity", function (d) { return d.value === 0 ? 0 : 1; }));
};
c3_chart_internal_fn.generateDrawTimeline = function (timelineIndicies, isSub) { //console.log('generateDrawTimeline');
    var $$ = this, //config = $$.config,
        getPoints = $$.generateGetTimelineBarPoints(timelineIndicies, isSub);
    return function (d, i) {
        // 4 points that make a bar
        var points = getPoints(d, i);

        // switch points if axis is rotated, not applicable for sub chart
        var indexX = 0; //config.axis_rotated ? 1 : 0;
        var indexY = 1; //config.axis_rotated ? 0 : 1;

        var path = 'M ' + points[0][indexX] + ',' + points[0][indexY] + ' ' +
                'L' + points[1][indexX] + ',' + points[1][indexY] + ' ' +
                'L' + points[2][indexX] + ',' + points[2][indexY] + ' ' +
                'L' + points[3][indexX] + ',' + points[3][indexY] + ' ' +
                'z';

        return path;
    };
};
c3_chart_internal_fn.generateGetTimelineBarPoints = function (timelineIndices, isSub) { //console.log('generateGetTimelineBarPoints');
    var $$ = this, config = $$.config, d3 = $$.d3,
        barTargetsNum = timelineIndices.__max__ + 1,
        barW = (config.lane_combine ? $$.height : ($$.height / barTargetsNum)) - ($$.laneMargin.top + $$.laneMargin.bottom),
        barX = $$.getShapeX(0, barTargetsNum, timelineIndices, !!isSub),
        barY = function (d) {
            if (config.lane_combine) {
                return $$.laneMargin.top;
            }
            return d3.round(($$.height / barTargetsNum) * timelineIndices[d.id]) + $$.laneMargin.top;
        },
        barOffset = $$.getShapeX(0, barTargetsNum, timelineIndices, !!isSub);
    return function (d, i) {
        var d2 = d;
        if (i + 1 < $$.data.targets[timelineIndices[d.id]].values.length) {
            for (var tI = 0; tI < timelineIndices.__max__ + 1; tI++) {
                if ($$.data.targets[tI].values[i + 1].value && $$.data.targets[tI].values[i + 1].value !== 0) {
                    d2 = $$.data.targets[tI].values[i + 1];
                }
            }
        }
        var offset = barOffset(d2),
            posX = barX(d),
            posY = barY(d);

        // 4 points that make a bar
        return [
            [posX, posY],
            [posX, posY + barW],
            [offset, posY + barW],
            [offset, posY]
        ];
    };
};