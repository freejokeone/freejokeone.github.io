// Test the bubble controller
describe('Bubble controller tests', function() {

	beforeEach(function() {
		window.addDefaultMatchers(jasmine);
	});

	afterEach(function() {
		window.releaseAllCharts();
	});

	it('should be constructed', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: []
				}]
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.type).toBe('bubble');
		expect(meta.controller).not.toBe(undefined);
		expect(meta.controller.index).toBe(0);
		expect(meta.data).toEqual([]);

		meta.controller.updateIndex(1);
		expect(meta.controller.index).toBe(1);
	});

	it('should use the first scale IDs if the dataset does not specify them', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: []
				}]
			},
			options: {
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(0);

		expect(meta.xAxisID).toBe('firstXScaleID');
		expect(meta.yAxisID).toBe('firstYScaleID');
	});

	it('should create point elements for each data item during initialization', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			}
		});

		var meta = chart.getDatasetMeta(0);

		expect(meta.data.length).toBe(4); // 4 points created
		expect(meta.data[0] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Point).toBe(true);
	});

	it('should draw all elements', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
			options: {
				animation: false,
				showLines: true
			}
		});

		var meta = chart.getDatasetMeta(0);

		spyOn(meta.data[0], 'draw');
		spyOn(meta.data[1], 'draw');
		spyOn(meta.data[2], 'draw');
		spyOn(meta.data[3], 'draw');

		chart.update();

		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
	});

	it('should update elements when modifying style', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: [{
						x: 10,
						y: 10,
						r: 5
					}, {
						x: -15,
						y: -10,
						r: 1
					}, {
						x: 0,
						y: -9,
						r: 2
					}, {
						x: -4,
						y: 10,
						r: 1
					}]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				scales: {
					xAxes: [{
						type: 'category'
					}],
					yAxes: [{
						type: 'linear'
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(0);

		[ 	{ r: 5, x:  38, y:  32 },
			{ r: 1, x: 189, y: 484 },
			{ r: 2, x: 341, y: 461 },
			{ r: 1, x: 492, y:  32 }
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.radius).toBe(expected.r);
			expect(meta.data[i]._model.x).toBeCloseToPixel(expected.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(expected.y);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: Chart.defaults.global.defaultColor,
				borderColor: Chart.defaults.global.defaultColor,
				borderWidth: 1,
				hitRadius: 1,
				skip: false
			}));
		});

		// Use dataset level styles for lines & points
		chart.data.datasets[0].backgroundColor = 'rgb(98, 98, 98)';
		chart.data.datasets[0].borderColor = 'rgb(8, 8, 8)';
		chart.data.datasets[0].borderWidth = 0.55;

		// point styles
		chart.data.datasets[0].radius = 22;
		chart.data.datasets[0].hitRadius = 3.3;

		chart.update();

		for (var i=0; i