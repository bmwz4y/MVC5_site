if (!window.additiv) {
	var additiv = new Object();
}

if (!additiv.imcs) {
	additiv.imcs = new Object();
}

additiv.imcs.languageCode = '';
additiv.imcs.applicationPath = '';

additiv.imcs.initWidgets = function () {
	//$("input.ui-button-action, input.ui-button, a.link").button();
	//$("button.ui-button-action, button.ui-button").button();
	$('.datepicker').datepicker({ showAnim: false, dateFormat: "dd.mm.yy" });
	$('[watermark]').each(function (i, n) {
		$(this).watermark($(this).attr("watermark"));
	});
	$('.multiselect').multiselect({ searchable: false, sortable: false });
	additiv.imcs.widget.tree.init();
};

additiv.imcs.Loading = (function ($) {
	var
	win = $(window),
	doc = $(document),
	loader = $('<div />', {
		id: 'loading'
	}).append('<div />'),

	init = function () {
		doc.ajaxStart(function () {
			loader.show();
		})
		.ajaxStop(function () {
			loader.hide();
			additiv.imcs.initWidgets();
		});

		loader.appendTo('body');
	};

	showLoader = function () {
		loader.show();
	};

	return {
		init: init,
		showLoader: showLoader
	};
}(jQuery));

$(function () {
	// loading indicator
	additiv.imcs.Loading.init();
	additiv.imcs.initWidgets();

	// error message link handling
	(function () {
		$('.fm-error').live('click', function (e) {
			e.preventDefault();
			var $e = $(e.target);
			if ($e.is('a')) {
				$($e.attr('href')).focus();
			}
		});
	}());
});

//Initialze placeholder plugin for IE9		
$(document).on('ready ajaxComplete', function () {
	$('input, textarea').placeholder();
});


additiv.imcs.widget = {
	showValidationData: function (message, isValid, parent) {
		var validationContainer = $((parent || '') + ' div.Validation');

		validationContainer.html('').hide();

		if (isValid)
			validationContainer.html('<div class="fm-msg fm-successful rounded-border-all"><h2 class="fm-successful-title">' + message + '</h2></div>');
		else
			validationContainer.html('<div class="fm-msg fm-error rounded-border-all"><h2 class="fm-error-title">The following errors occurred:</h2>' + message + '</div>');

		validationContainer.show(200);

		clearTimeout(additiv.imcs.widget.hideTimeoutId);

		additiv.imcs.widget.hideTimeoutId = setTimeout(function () {
			validationContainer.html('').hide(1000);
		}, 5000);
	},
	hideValidationData: function () {
		$('div.Validation').html('').hide();
	},
	hideTimeoutId: null
};

additiv.imcs.window = {
	open: function (link, height, width) {
		window.open(link, null, 'height=' + height + ',width=' + width + ',status=yes,toolbar=no,menubar=no,location=no');
		return;
	},
	openScrollable: function (link, height, width) {
		window.open(link, null, 'height=' + height + ',width=' + width + ',status=yes,toolbar=no,menubar=no,location=no, resizable=yes, scrollbars=yes');
		return;
	}
};

additiv.imcs.widget.tree = (function ($) {
	/* fit tree in window */
	var
	tree, offset,

	init = function () {
		win = $(window);
		tree = $('.tree').not('.fixed-tree');

		if (tree.length) {
			offset = tree.offset();
			win.on('resize', function () {
				setHeight();
			});
			setHeight();
		}
	},

	setHeight = function () {
		var height = parseInt(win.height(), 10) - offset.top - 80;
		if (height > 80) {
			tree.height(height);
		}
	};

	return {
		init: init
	};
}(jQuery));

(function ($) {
	$.fn.reloadDropdown = function (url, data, isEnabled, callback) {
		if (isEnabled == null)
			isEnabled = true;

		var _$selector = this;
		if (isEnabled) {
			$.ajax({
				url: url,
				type: "POST",
				data: data || {},
				dataType: "json",
				success: function (result) {
					var selectedValue = _$selector.val();
					_$selector.empty().attr("disabled", result.length == 0);
					_$selector.append();

					for (var i = 0; i < result.length; i++) {
						$('<option>', { value: result[i].Value }).text(result[i].Text).appendTo(_$selector);
						if (result[i].Selected)
							selectedValue = result[i].Value;
					}
					_$selector.val(selectedValue);

					if (callback && $.isFunction(callback))
						callback();
					else
						_$selector.change();
				}
			});
		} else {
			_$selector.empty().attr("disabled", true);
			_$selector.change();
		}
	};
}(jQuery));

additiv.imcs.globalFilter = function () {
	var _callbacks = {};

	var _$mandatorDropDown, _$campaignDropDown, _$editionDropDown, _$languageDropDown, _$channelDropDown;

	function filterChanged() {
		for (var callback in _callbacks) {
			_callbacks[callback][0]();
		}
	};

	function addFilterFunctionListener(functionName, handler) {
		if (functionName in _callbacks)
			_callbacks[functionName] = [handler];
		else {
			_callbacks[functionName] = [];
			_callbacks[functionName].push(handler);
		}

	};

	function init($mandatorDropDown, $campaignDropDown, $editionDropDown, $languageDropDown, $channelDropDown) {
		_$mandatorDropDown = $mandatorDropDown;
		_$campaignDropDown = $campaignDropDown;
		_$editionDropDown = $editionDropDown;
		_$languageDropDown = $languageDropDown;
		_$channelDropDown = $channelDropDown;

		_$mandatorDropDown.change(function () {
			$.cookie('PreferredMandatorId', $(this).val(), { expires: 180, path: '/' });
			filterChanged();
		});
		_$campaignDropDown.change(function () {
			$.cookie('PreferredCampaignId', $(this).val(), { expires: 180, path: '/' });
			filterChanged();
		});
		_$editionDropDown.change(function () {
			$.cookie('PreferredEditionId', $(this).val(), { expires: 180, path: '/' });
			filterChanged();
		});
		_$languageDropDown.change(function () {
			$.cookie('PreferredLanguageId', $(this).val(), { expires: 180, path: '/' });
			filterChanged();
		});
		_$channelDropDown.change(function () {
			$.cookie('PreferredChannelId', $(this).val(), { expires: 180, path: '/' });
			filterChanged();
		});
	}

	function isAllDropDownsSelected() {
		if (_$mandatorDropDown.val() == "")
			return false;
		if (_$campaignDropDown.val() == "")
			return false;
		if (_$editionDropDown.val() == "")
			return false;
		if (_$languageDropDown.val() == "")
			return false;
		if (_$channelDropDown.val() == "")
			return false;
		return true;
	}

	return {
		filterChanged: filterChanged,
		addFilterFunctionListener: addFilterFunctionListener,
		init: init,

		isAllDropDownsSelected: isAllDropDownsSelected,

		mandatorDropDown: function () { return _$mandatorDropDown; },
		campaignDropDown: function () { return _$campaignDropDown; },
		editionDropDown: function () { return _$editionDropDown; },
		languageDropDown: function () { return _$languageDropDown; },
		channelDropDown: function () { return _$channelDropDown; },

		selectedMandator: function () { return _$mandatorDropDown.val(); },
		selectedCampaign: function () { return _$campaignDropDown.val(); },
		selectedEdition: function () { return _$editionDropDown.val(); },
		selectedLanguage: function () { return _$languageDropDown.val(); },
		selectedChannel: function () { return _$channelDropDown.val(); }
	};
}();

if (!additiv.imcs.backend) { additiv.imcs.backend = {}; }
if (!additiv.imcs.backend.dropdown) { additiv.imcs.backend.dropdown = {}; }

additiv.imcs.backend.dropdown.filter = function () {
	var _emptyValues = ['', '0'];

	function _init(isApply, emptyValues) {
		if (isApply) {
			if (emptyValues != null) {
				_emptyValues = emptyValues;
			}

			$(document).ready(_documentReady);

			$(document).ajaxComplete(_ajaxComplete);
		}
	}

	function _documentReady() {
		$('select').each(function () {
			_apply($(this));
		});
	}

	function _ajaxComplete(event, xhr, settings) {
		if (settings.context != undefined) {
			_apply($(settings.context));
		}
	}

	function _apply(element) {
		var options = $('option', element);

		if (!element.is(':disabled') && options.length > 0) {
			var firstVal = $(options[0]).val();

			if (element.val() == firstVal && options.length == 2 && _emptyValues.indexOf(firstVal) != -1) {
				$(options[1]).prop('selected', true);
				if (element.hasClass("trigger-change")) {
					element.trigger("change");
				}
			}
		}
	}

	return {
		init: _init
	};
}();