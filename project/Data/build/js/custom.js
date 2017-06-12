
function init_charts() {

		console.log('run_charts  typeof [' + typeof (Chart) + ']');

		if( typeof (Chart) === 'undefined'){ return; }

		console.log('init_charts');


		Chart.defaults.global.legend = {
			enabled: false
		};

	if ($('#lineChart').length ){

	  var ctx = document.getElementById("lineChart");
	  var lineChart = new Chart(ctx, {
		type: 'line',
		data: {
		  labels: ["21", "20", "19", "18", "17", "16", "15"],
		  datasets: [{
			label: "我的家庭数",
			backgroundColor: "rgba(38, 185, 154, 0.31)",
			borderColor: "rgba(38, 185, 154, 0.7)",
			pointBorderColor: "rgba(38, 185, 154, 0.7)",
			pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
			pointHoverBackgroundColor: "#fff",
			pointHoverBorderColor: "rgba(220,220,220,1)",
			pointBorderWidth: 1,
			data: [31, 74, 6, 39, 20, 85, 7]
		  }, {
			label: "社会平均值",
			backgroundColor: "rgba(3, 88, 106, 0.3)",
			borderColor: "rgba(3, 88, 106, 0.70)",
			pointBorderColor: "rgba(3, 88, 106, 0.70)",
			pointBackgroundColor: "rgba(3, 88, 106, 0.70)",
			pointHoverBackgroundColor: "#fff",
			pointHoverBorderColor: "rgba(151,187,205,1)",
			pointBorderWidth: 1,
			data: [82, 23, 66, 9, 99, 4, 2]
		  }]
		},
	  });

	}


	if ($('#canvasRadar').length ){

	  var ctx = document.getElementById("canvasRadar");
	  var data = {
		labels: ["蛋白质", "维生素", "淀粉", "糖", "油脂", "无机盐", "矿物质"],
		datasets: [{
		  label: "我的家庭数",
		  backgroundColor: "rgba(3, 88, 106, 0.2)",
		  borderColor: "rgba(3, 88, 106, 0.80)",
		  pointBorderColor: "rgba(3, 88, 106, 0.80)",
		  pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
		  pointHoverBackgroundColor: "#fff",
		  pointHoverBorderColor: "rgba(220,220,220,1)",
		  data: [65, 59, 90, 81, 56, 55, 40]
		}, {
		  label: "社会平均值",
		  backgroundColor: "rgba(38, 185, 154, 0.2)",
		  borderColor: "rgba(38, 185, 154, 0.85)",
		  pointColor: "rgba(38, 185, 154, 0.85)",
		  pointStrokeColor: "#fff",
		  pointHighlightFill: "#fff",
		  pointHighlightStroke: "rgba(151,187,205,1)",
		  data: [28, 48, 40, 19, 96, 27, 100]
		}]
	  };

	  var canvasRadar = new Chart(ctx, {
		type: 'radar',
		data: data
	  });
	}

	if ($('#polarArea').length ){

		var ctx = document.getElementById("polarArea");
		var data = {
		datasets: [{
		  data: [120, 50, 140, 180, 100],
		  backgroundColor: [
			"#455C73",
			"#9B59B6",
			"#BDC3C7",
			"#26B99A",
			"#3498DB"
		  ],
		  label: 'My dataset'
		}],
		labels: [
			"油脂",
			"糖类",
			"无机盐",
			"维生素",
			"蛋白质"
		]
		};

		var polarArea = new Chart(ctx, {
		data: data,
		type: 'polarArea',
		options: {
		  scale: {
			ticks: {
			  beginAtZero: true
			}
		  }
		}
		});

	}
}

$(document).ready(function() {
	init_charts();
});
	

