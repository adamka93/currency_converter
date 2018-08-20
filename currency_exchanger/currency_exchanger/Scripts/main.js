(function () {
	$(".input").on("change", recalculate)
	var from = $("select.fromtype").val();
	var to = $("select.totype").val();
	var graphData = [
	{
		color: "#aa0066",
		data: [{ x : 0, y : 0 }],
		name: from
	}, {
		color: "#ffbb00",
		data: [{ x : 0, y : 0 }],
		name: to
	}];
	var graph = new Rickshaw.Graph({
		element: document.getElementById("chart"),
		renderer: 'line',
		stroke: true,
		preserve: true,
		series: graphData
	});

	var slider = new Rickshaw.Graph.RangeSlider({
		graph: graph,
		element: document.getElementById('slider'),
	});
	var hoverDetail = new Rickshaw.Graph.HoverDetail({
		graph: graph
	});
	var legend = new Rickshaw.Graph.Legend({
		graph: graph,
		element: document.getElementById('legend')

	});
	var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
		graph: graph,
		legend: legend
	});
	var order = new Rickshaw.Graph.Behavior.Series.Order({
		graph: graph,
		legend: legend
	});
	var highlight = new Rickshaw.Graph.Behavior.Series.Highlight({
		graph: graph,
		legend: legend
	});
	//graph.render();


	function recalculate() {
		$(document).ready(function () {
			$.ajax({
				type: 'POST',
				url: '/Home/ConvertRate/',
				data: {
					from: $("select.fromtype").val(), to: $("select.totype").val(), value: $("input.fromvalue").val() },
				dataType: 'json'
			}).done(function (response) {
				$("input.tovalue").val(response.data.replace("\"", "").replace("\"", ""));
				getData();
			});
		});
	}

	function updateGraph(response) {
		var from = $("select.fromtype").val();
		var to = $("select.totype").val();
		let fromarr = filterArr(response, from);
		let toarr = filterArr(response, to)

		let fromMax = Math.max.apply(Math, (fromarr.map(function (item, idx) { return item["y"]; })));
		let toMax = Math.max.apply(Math, (toarr.map(function (item, idx) { return item["y"]; })));
		let max = Math.max(fromMax, toMax);

		graphData[0].data = [];
		graphData[0].data.push(...fromarr);
		$("#legend ul li:nth-child(2) span").text(from);
		graphData[0].name = from;
		graphData[1].data = [];
		graphData[1].data.push(...toarr);
		$("#legend ul li:nth-child(1) span").text(to);
		graphData[1].name = to;
		graph.max = max + max * 1.1;
		graph.render();
	}

	function filterArr(response, key) {
		return JSON.parse(response.data).map(function (item, idx) { return { x: new Date(item["time"]).getTime(), y: item[key] } }).reverse();
	}

	function getData() {
		$(document).ready(function () {
			$.ajax({
				type: 'GET',
				url: '/Home/GetGraphData/',
				dataType: 'json'
			}).done(function (response) {
				updateGraph(response)
			});
		});
	}
	// set up our data series with 50 random data points
	getData();
})()
