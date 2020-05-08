d3.json("/js/graph.json").then(function(data) {
    height = 800;
    width = 1300;
    radius = d => {
        return 8 + .6 * d3.selectAll("line")
            .filter((l, idx) =>
                    l.source.index == d.index || l.target.index == d.index)
            .data().length;
    };
    color = "#ffffff";

    drag = simulation => {

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };

    handleMouseOver = (d, i, g) => {
        nde = d3.select(g[i]);
        nde.attr("fill", "#999")
            .attr("r", nde.attr("r") * 1.3);

        d3.selectAll("text")
            .filter('#' + CSS.escape(g[i].id))
            .style("display", "block");

        d3.selectAll("line")
            .attr("stroke-width", 1);

        d3.selectAll("line")
            .filter((l, idx) => l.source.index == i || l.target.index == i)
            .attr("stroke-width", 5);
    };

    handleMouseOut = (d, i, g) => {
        nde = d3.select(g[i]);
        nde.attr("fill", "#000")
            .attr("r", nde.attr("r") / 1.3);

        d3.selectAll("text")
            .filter('#' + CSS.escape(g[i].id))
            .style("display", "none");

    };

    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id))
          .force("charge", d3.forceManyBody()
                 .strength(-120))
          .force("x", d3.forceX(width / 2))
          .force("y", d3.forceY(height / 2));

    const svg = d3.select("svg")
          .attr('max-width', '60%')
          .attr('class', 'note-graph')
          .attr("viewBox", [0, 0, width, height]);

    const link = svg.append("g")
          .attr("stroke", "#888")
          .attr("stroke-opacity", 0.6)
          .selectAll("line")
          .data(links)
          .join("line")
          .attr("marker-end", "url(#head)")
          .attr("stroke-width", 1);

    const node = svg.append("g")
          .selectAll("circle")
          .data(nodes)
          .join("a")
          .attr("xlink:href", d => {
              it = d.id.split('/');
              return "./" + it[it.length-1].replace(/\.org/g, "") + "/";
          })
          .append("circle")
          .attr("id", d => d.id)
          .attr("r", radius)
          .attr("fill", "#000")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.3)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .call(drag(simulation));

    node.append("title")
        .text(d => d.label.replace(/"/g, ''));

    const label = svg.append("g")
          .selectAll("text")
          .data(nodes)
          .join("g");

    const label_background = label.append("text")
          .style("font-size", "18px")
          .text(function (d) { return "  "+ d.label.replace(/"/g, '') + "  "; })
          .attr("dy", -25)
          .attr("id", d => d.id)
          .attr("class", "node_label")
          .style("display", "none")
          .style("pointer-events", "none")
          .style("alignment-baseline", "middle")
          .attr("filter", "url(#solid)");

    const label_text = label.append("text")
          .style("fill", "#222")
          .style("font-size", "18px")
          .text(function (d) { return "  "+ d.label.replace(/"/g, '') + "  "; })
          .attr("dy", -25)
          .attr("id", d => d.id)
          .attr("class", "node_label")
          .style("display", "none")
          .style("pointer-events", "none")
          .style("alignment-baseline", "middle");

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label_text.attr("x", d => d.x)
            .attr("y", d => d.y);

        label_background.attr("x", d => d.x)
            .attr("y", d => d.y);
    });


});
