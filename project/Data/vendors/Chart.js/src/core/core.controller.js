"use strict";

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	//Create a dictionary of chart types, to allow for extension of existing types
	Chart.types = {};

	//Store a reference to each instance - allowing us to globally resize chart instances on window resize.
	//Destroy method on the chart will remove the instance of the chart from this reference.
	Chart.instances = {};

	// Controllers available for dataset visualization eg. bar, line, slice, etc.
	Chart.controllers = {};

	// The main controller of a chart
	Chart.Controller = function(instance) {

		this.chart = instance;
		this.config = instance.config;
		this.options = this.config.options = helpers.configMerge(Chart.defaults.global, Chart.defaults[this.config.type], this.config.options || {});
		this.id = helpers.uid();

		Object.defineProperty(this, 'data', {
			get: function() {
				return this.config.data;
			}
		});

		//Add the chart instance to the global namespace
		Chart.instances[this.id] = this;

		if (this.options.responsive) {
			// Silent resize before chart draws
			this.resize(true);
		}

		this.initialize();

		return this;
	};

	helpers.extend(Chart.Controller.prototype, {

		initialize: function initialize() {
			// Before init plugin notification
			Chart.pluginService.notifyPlugins('beforeInit', [this]);

			this.bindEvents();

			// Make sure controllers are built first so that each dataset is bound to an axis before the scales
			// are built
			this.ensureScalesHaveIDs();
			this.buildOrUpdateControllers();
			this.buildScales();
			this.buildSurroundingItems();
			this.updateLayout();
			this.resetElements();
			this.initToolTip();
			this.update();

			// After init plugin notification
			Chart.pluginService.notifyPlugins('afterInit', [this]);

			return this;
		},

		clear: function clear() {
			helpers.clear(this.chart);
			return this;
		},

		stop: function stop() {
			// Stops any current animation loop occuring
			Chart.animationService.cancelAnimation(this);
			return this;
		},

		resize: function resize(silent) {
			var canvas = this.chart.canvas;
			var newWidth = helpers.getMaximumWidth(this.chart.canvas);
			var newHeight = (this.options.maintainAspectRatio && isNaN(this.chart.aspectRatio) === false && isFinite(this.chart.aspectRatio) && this.chart.aspectRatio !== 0) ? newWidth / this.chart.aspectRatio : helpers.getMaximumHeight(this.chart.canvas);

			var sizeChanged = this.chart.width !== newWidth || this.chart.height !== newHeight;

			if (!sizeChanged)
				return this;

			canvas.width = this.chart.width = newWidth;
			canvas.height = this.chart.height = newHeight;

			helpers.retinaScale(this.chart);

			if (!silent) {
				this.stop();
				this.update(this.options.responsiveAnimationDuration);
			}

			return this;
		},

		ensureScalesHaveIDs: function ensureScalesHaveIDs() {
			var options = this.options;
			var scalesOptions = options.scales || {};
			var scaleOptions = options.scale;

			helpers.each(scalesOptions.xAxes, function(xAxisOptions, index) {
				xAxisOptions.id = xAxisOptions.id || ('x-axis-' + index);
			});

			helpers.each(scalesOptions.yAxes, function(yAxisOptions, index) {
				yAxisOptions.id = yAxisOptions.id || ('y-axis-' + index);
			});

			if (scaleOptions) {
				scaleOptions.id = scaleOptions.id || 'scale';
			}
		},

		/**
		 * Builds a map of scale ID to scale object for future lookup.
		 */
		buildScales: function buildScales() {
			var me = this;
			var options = me.options;
			var scales = me.scales = {};
			var items = [];

			if (options.scales) {
				items = items.concat(
					(options.scales.xAxes || []).map(function(xAxisOptions) {
						return { options: xAxisOptions, dtype: 'category' }; }),
					(options.scales.yAxes || []).map(function(yAxisOptions) {
						return { options: yAxisOptions, dtype: 'linear' }; }));
			}

			if (options.scale) {
				items.push({ options: options.scale, dtype: 'radialLinear', isDefault: true });
			}

			helpers.each(items, function(item, index) {
				var scaleOptions = item.options;
				var scaleType = helpers.getValueOrDefault(scaleOptions.type, item.dtype);
				var scaleClass = Chart.scaleService.getScaleConstructor(scaleType);
				if (!scaleClass) {
					return;
				}

				var scale = new scaleClass({
					id: scaleOptions.id,
					options: scaleOptions,
					ctx: me.chart.ctx,
					chart: me
				});

				scales[scale.id] = scale;

				// TODO(SB): I think we should be able to remove this custom case (options.scale)
				// and consider it as a regular scale part of the "scales"" map only! This would
				// make the logic easier and remove some useless? custom code.
				if (item.isDefault) {
					me.scale = scale;
				}
			});

			Chart.scaleService.addScalesToLayout(this);
		},

		buildSurroundingItems: function() {
			if (this.options.title) {
				this.titleBlock = new Chart.Title({
					ctx: this.chart.ctx,
					options: this.options.title,
					chart: this
				});

				Chart.layoutService.addBox(this, this.titleBlock);
			}

			if (this.options.legend) {
				this.legend = new Chart.Legend({
					ctx: this.chart.ctx,
					options: this.options.legend,
					chart: this
				});

				Chart.layoutService.addBox(this, this.legend);
			}
		},

		updateLayout: function() {
			Chart.layoutService.update(this, this.chart.width, this.chart.height);
		},

		buildOrUpdateControllers: function buildOrUpdateControllers() {
			var types = [];
			var newControllers = [];

			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				var meta = this.getDatasetMeta(datasetIndex);
				if (!meta.type) {
					meta.type = dataset.type || this.config.type;
				}

				types.push(meta.type);

				if (meta.controller) {
					meta.controller.updateIndex(datasetIndex);
				} else {
					meta.controller = new Chart.controllers[meta.type](this, datasetIndex);
					newControllers.push(meta.controller);
				}
			}, this);

			if (types.length > 1) {
				for (var i = 1; i < types.length; i++) {
					if (types[i] !== types[i - 1]) {
						this.isCombo = true;
						break;
					}
				}
			}

			return newControllers;
		},

		resetElements: function resetElements() {
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				this.getDatasetMeta(datasetIndex).controller.reset();
			}, this);
		},

		update: function update(animationDuration, lazy) {
			Chart.pluginService.notifyPlugins('beforeUpdate', [this]);

			// In case the entire data object changed
			this.tooltip._data = this.data;

			// Make sure dataset controllers are updated and new controllers are reset
			var newControllers = this.buildOrUpdateControllers();

			// Make sure all dataset controllers have correct meta data counts
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				this.getDatasetMeta(datasetIndex).controller.buildOrUpdateElements();
			}, this);

			Chart.layoutService.update(this, this.chart.width, this.chart.height);

			// Apply changes to the dataets that require the scales to have been calculated i.e BorderColor chages
			Chart.pluginService.notifyPlugins('afterScaleUpdate', [this]);

			// Can only reset the new controllers after the scales have been updated
			helpers.each(newControllers, function(controller) {
				controller.reset();
			});

			// This will loop through any data and do the appropriate element update for the type
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				this.getDatasetMeta(datasetIndex).controller.update();
			}, this);

			// Do this before render so that any plugins that need final scale updates can use it
			Chart.pluginService.notifyPlugins('afterUpdate', [this]);

			this.render(animationDuration, lazy);
		},

		render: function render(duration, lazy) {
			Chart.pluginService.notifyPlugins('beforeRender', [this]);

			var animationOptions = this.options.animation;
			if (animationOptions && ((typeof duration !== 'undefined' && duration !== 0) || (typeof duration === 'undefined' && animationOptions.duration !== 0))) {
				var animation = new Chart.Animation();
				animation.numSteps = (duration || animationOptions.duration) / 16.66; //60 fps
				animation.easing = animationOptions.easing;

				// render function
				animation.render = function(chartInstance, animationObject) {
					var easingFunction = helpers.easingEffects[animationObject.easing];
					var stepDecimal = animationObject.currentStep / animationObject.numSteps;
					var easeDecimal = easingFunction(stepDecimal);

					chartInstance.draw(easeDecimal, stepDecimal, animationObject.currentStep);
				};

				// user events
				animation.onAnimationProgress = animationOptions.onProgress;
				animation.onAnimationComplete = animationOptions.onComplete;

				Chart.animationService.addAnimation(this, animation, duration, lazy);
			} else {
				this.draw();
				if (animationOptions && animationOptions.onComplete && animationOptions.onComplete.call) {
					animationOptions.onComplete.call(this);
				}
			}
			return this;
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			this.clear();

			Chart.pluginService.notifyPlugins('beforeDraw', [this, easingDecimal]);

			// Draw all the scales
			helpers.each(this.boxes, function(box) {
				box.draw(this.chartArea);
			}, this);
			if (this.scale) {
				this.scale.draw();
			}

			// Clip out the chart area so that anything outside does not draw. This is necessary for zoom and pan to function
			var context = this.chart.ctx;
			context.save();
			context.beginPath();
			context.rect(this.chartArea.left, this.chartArea.top, this.chartArea.right - this.chartArea.left, this.chartArea.bottom - this.chartArea.top);
			context.clip();

			// Draw each dataset via its respective controller (reversed to support proper line stacking)
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				if (this.isDatasetVisible(datasetIndex)) {
					this.getDatasetMeta(datasetIndex).controller.draw(ease);
				}
			}, this, true);

			// Restore from the clipping operation
			context.restore();

			// Finally draw the tooltip
			this.tooltip.transition(easingDecimal).draw();

			Chart.pluginService.notifyPlugins('afterDraw', [this, easingDecimal]);
		},

		// Get the single element that was clicked on
		// @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was draw
		getElementAtEvent: function(e) {
			var eventPosition = helpers.getRelativePosition(e, this.chart);
			var elementsArray = [];

			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				if (this.isDatasetVisible(datasetIndex)) {
					var meta = this.getDatasetMeta(datasetIndex);
					helpers.each(meta.data, function(element, index) {
						if (element.inRange(eventPosition.x, eventPosition.y)) {
							elementsArray.push(element);
							return elementsArray;
						}
					});
				}
			}, this);

			return elementsArray;
		},

		getElementsAtEvent: function(e) {
			var eventPosition = helpers.getRelativePosition(e, this.chart);
			var elementsArray = [];

			var found = (function() {
				if (this.data.datasets) {
					for (var i = 0; i < this.data.datasets.length; i++) {
						var meta = this.getDatasetMeta(i);
						if (this.isDatasetVisible(i)) {
							for (var j = 0; j < meta.data.length; j++) {
								if (meta.data[j].inRange(eventPosition.x, eventPosition.y)) {
									return meta.data[j];
								}
							}
						}
					}
				}
			}).call(this);

			if (!found) {
				return elementsArray;
			}

			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				if (this.isDatasetVisible(datasetIndex)) {
					var meta = this.getDatasetMeta(datasetIndex);
					elementsArray.push(meta.data[found._index]);
				}
			}, this);

			return elementsArray;
		},

		getElementsAtEventForMode: function(e, mode) {
			var me = this;
			switch (mode) {
			case 'single':
				return me.getElementAtEvent(e);
			case 'label':
				return me.getElementsAtEvent(e);
			case 'dataset':
				return me.getDatasetAtEvent(e);
			default:
				return e;
			}
		},

		getDatasetAtEvent: function(e) {
			var elementsArray = this.getElementAtEvent(e);

			if (elementsArray.length > 0) {
				elementsArray = this.getDatasetMeta(elementsArray[0]._datasetIndex).data;
			}

			return elementsArray;
		},

		getDatasetMeta: function(datasetIndex) {
			var dataset = this.data.datasets[datasetIndex];
			if (!dataset._meta) {
				dataset._meta = {};
			}

			var meta = dataset._meta[this.id];
			if (!meta) {
				meta = dataset._meta[this.id] = {
				type: null,
				data: [],
				dataset: null,
				controller: null,
				hidden: null,			// See isDatasetVisible() comment
				xAxisID: null,
				yAxisID: null
			};
			}

			return meta;
		},

		getVisibleDatasetCount: function() {
			var count = 0;
			for (var i = 0, ilen = this.data.datasets.length; i