String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
}

if (!window.additiv) { var additiv = {}; }
if (!additiv.imcs) { additiv.imcs = {}; }
if (!additiv.imcs.utility) { additiv.imcs.utility = {}; }

additiv.imcs.utility.remoteDataProvider = function() {
	var _dataCollection = { };

	function _init(providerName, sourceDataUrl, secondsToExpire) {
		if (sourceDataUrl && secondsToExpire) {
			_dataCollection[providerName] = { };
			_dataCollection[providerName].SourceDataUrl = sourceDataUrl;
			_dataCollection[providerName].SecondsToExpire = secondsToExpire;
			_dataCollection[providerName].Data = null;
			_dataCollection[providerName].ExpiredOn = null;
		}
	}

	function _getData(providerName) {
		var dataProvider = _dataCollection[providerName];
		if (dataProvider) {
			if (dataProvider.ExpiredOn && dataProvider.ExpiredOn > (new Date())) {
				return dataProvider.Data;
			} else { // try to get data and return it synchronously
				var sourceData;
				var isSucceeded = false;
				$.ajax({
					url: dataProvider.SourceDataUrl,
					data: { },
					type: "POST",
					success: function(result) {
						sourceData = result;
						isSucceeded = true;
					},
					async: false
				});
				if (isSucceeded) {
					dataProvider.Data = sourceData;
					var exp = new Date();
					exp.setSeconds(exp.getSeconds() + dataProvider.SecondsToExpire);
					dataProvider.ExpiredOn = exp;
					return sourceData;
				} else {
					return null; // do not set anything to cache
				}
			}
		} else {
			return "undefined";
		}
	}

	return {
		init: _init,
		getData: _getData
	};
}();