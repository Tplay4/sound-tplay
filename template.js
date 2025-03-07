function TemplateEngine(data=[]) {
	var _this = this;
	this.data = data;
	this.parentElement = function (_this) {
		var el = document.getElementById('TEMPLATE_ENGINE_ELEMENT');
		if (el == null) {
			el = document.createElement('DIV');
			el.id = 'TEMPLATE_ENGINE_ELEMENT';
			document.body.appendChild(el);
		}
		return el;
	};
	this.template = function (_this) { return "<span>{{ value }}<br></span>"; };
	this.template_signals = ["{{ ", " }}"];
	this.builders = {
		'index': function (_this, index, value) { return index; },
		'value': function (_this, index, value) {
			if (typeof value == 'string') return value;
			if (Array.isArray(value)) for (var i=0;i<value.length;i++) { if (typeof value[i] == 'string') return value[i]; };
			if (typeof value == 'object') for (var i=0;i<Object.keys(value).length;i++) { if (typeof value[Object.keys(value)[i]] == 'string') return value[Object.keys(value)[i]]; };
			return '{% ERROR: Failed To Get A Valid String Value From : "'+value.toString()+'" %}';
		}
	};
	this.bootware = [];
	this.middleware = [];
	this.onClickFunction = function (_this, element) { console.log("The Following Element Was Clicked: ", element); return _this; };
	this.addBuilder = function (index, value) {
		_this.builders[index] = value;
		return _this;
	};
	this.addBootware = function (func) {
		if (typeof func == 'function') { _this.bootware.push(func); }
		return _this;
	};
	this.addMiddleware = function (func) {
		if (typeof func == 'function') { _this.middleware.push(func); }
		return _this;
	};
	this.injectHTML = function(_this, data, template, builders) {
		var signals = _this.template_signals;
		return template.replace(new RegExp(signals.join('(.*?)'), 'g'), function (key) {
			key = key.replace(new RegExp(signals.join("|")+"| ", 'g'), '');
			if (typeof _this.builders[key] == 'function') { return _this.builders[key](_this, data.index, data.value);
			} else { return ""; }
		});
	};
	this.run = function (_this) {
		for (var i=0;i<_this.data.length;i++) {
			_this.skip = false;
			for (var j=0;j<_this.middleware.length;j++) {
				_this = _this.middleware[j](_this, i);
			}
			if (_this.skip) { continue; }
			_this.parentElement(_this).innerHTML += _this.injectHTML(_this, {'index': i, 'value': _this.data[i]}, _this.template(_this, i), _this.builders);
			Array.from(_this.parentElement(_this).childNodes).forEach(function (node) {
				node.onclick = function () { _this.onClickFunction(_this, node); };
			});
		}
		return _this;
	};
	this.init = function () {
		_this.kill=false;
		for (var i=0;i<_this.bootware.length;i++) {
			_this = _this.bootware[i](_this);
			if (_this.kill) { return _this; };
		}
		return _this.run(_this);
	};
	return _this;
}
