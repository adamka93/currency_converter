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
		width: 960,
		height: 500,
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
			}).fail(function (response) {
				debugger;
			});
		});
	}

	function updateGraph(response) {
		debugger;
		var from = $("select.fromtype").val();
		var to = $("select.totype").val();
		graphData[0].data = [];
		graphData[0].data.push(...filterArr(response, from));
		$("#legend ul li:nth-child(2) span").text(from);
		graphData[0].name = from;
		graphData[1].data = [];
		graphData[1].data.push(...filterArr(response, to));
		$("#legend ul li:nth-child(1) span").text(to);
		graphData[1].name = to;
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
			}).fail(function (response) {
				debugger;
			});
		});
	}

	// set up our data series with 50 random data points
	getData();
})()
