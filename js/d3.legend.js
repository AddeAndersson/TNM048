// d3.legend.js
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module with d3 as a dependency.
        define(['d3'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = function(d3) {
            d3.legend = factory(d3);
            return d3.legend;
        };
    } else {
        // Browser global.
        root.d3.legend = factory(root.d3);
    }
}(this, function (d3) {
    return function(g) {
        g.each(function() {
            var g = d3.select(this),
                items = {},
                svg = d3.select(g.property('nearestViewportElement')),
                legendPadding = g.attr('data-style-padding') || 5,
                lb = g.selectAll('.legend-box').data([true]),
                li = g.selectAll('.legend-items').data([true]);

            lb = lb.enter().append('rect').classed('legend-box', true).merge(lb);
            li = li.enter().append('g').classed('legend-items', true).merge(li);

            svg.selectAll('[data-legend]').each(function() {
                var self = d3.select(this);
                items[self.attr('data-legend')] = {
                    pos: self.attr('data-legend-pos') || this.getBBox().y,
                    color: self.style('fill') !== 'none' ? self.style('fill') : self.style('stroke')
                };
            });

            items = d3.entries(items).sort(function(a, b) { return a.value.pos - b.value.pos; });

            li.selectAll('text')
                .data(items, function(d) { return d.key; })
                .call(function(d) { d.enter().append('text'); })
                .call(function(d) { d.exit().remove(); })
                .attr('y', function(d, i) { return i + 'em'; })
                .attr('x', '1em')
                .text(function(d) { return d.key; });

            li.selectAll('circle')
                .data(items, function(d) { return d.key; })
                .call(function(d) { d.enter().append('circle'); })
                .call(function(d) { d.exit().remove(); })
                .attr('cy', function(d, i) { return i - 0.25 + 'em'; })
                .attr('cx', 0)
                .attr('r', '0.4em')
                .style('fill', function(d) {
                    return d.value.color;
                });

            // Reposition and resize the box
            var lbbox = li.node().getBBox();
            lb.attr('x', (lbbox.x - legendPadding))
                .attr('y', (lbbox.y - legendPadding))
                .attr('height', (lbbox.height + 2 * legendPadding))
                .attr('width', (lbbox.width + 2 * legendPadding));
        });
        return g;
    };
}));