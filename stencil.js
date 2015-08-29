Stencil = (function(){

	var PROPERTY_TYPE = {
		ARRAY: 'ARRAY',
		OBJECT: 'OBJECT',
		PRIMITIVE: 'PRIMITIVE'
	};

	function parseWithKeys(template, json) {
		var regex = /\{\{([^\}]+)\}\}/,
			match,
			value;

		while (regex.test(template)) {
			match = template.match(regex);
			value = getValueOf(match[1], json);
			template = template.replace(match[0], value);
		}

		return template;
	}

	function parseWithArray(template, context) {
		var content = context.map(function(context) {
			return parse(template, context);
		});

		return content.join('');
	}


	function trim(str) {
		return str.replace(/[\r\n]+/g, '');
	}

	function getPropertyType(value) {
		var type;

		if (value) {
			type = typeof value;

			if (type === 'object') {
				if (Array.prototype.isPrototypeOf(value)) {
					return PROPERTY_TYPE.ARRAY;
				}
				return PROPERTY_TYPE.OBJECT;
			} else {
				return PROPERTY_TYPE.PRIMITIVE
			}
		}

		return null;
	}

	function getValueOf(key, obj) {
		var arr;

		if (obj[key]) {
			return obj[key];
		}

		if (key === ".") {
			return obj;
		}

		if (key.indexOf(".") > -1) {
			arr = key.split('.');

			for (var i=0, n=arr.length; i<n; i++) {
				if (obj[arr[i]]) {
					obj = obj[arr[i]];
					continue;
				}

				return '';
			}

			return obj;
		}
	}

	function getBlockSelector (template) {
		var regex = /\{\{[#\^\/][^\}]+\}\}/g,
			match = template.match(regex),
			selector = [],
			count = 0,
			tag,
			charAt2;

		while (match && match.length) {
			tag = match.shift();
			charAt2 = tag.charAt(2);

			switch (charAt2) {
				case '/':
					count--;
					selector.push('\{\{\\/' + tag.match(/\{\{([^\}]+)\}\}/)[1].substr(1) + '\}\}');
					break;
				case '#':
					count++	;
					selector.push('\{\{#' + tag.match(/\{\{([^\}]+)\}\}/)[1].substr(1) + '\}\}');
					break;
				case '^':
					count++	;
					selector.push('\{\{\\^' + tag.match(/\{\{([^\}]+)\}\}/)[1].substr(1) + '\}\}');
					break;
			}


			// 
			if (count === 0) {
				break;
			}
		}

		return selector.length ? new RegExp(selector.join('.*?')) : null;
	}

	function getContext(key, obj) {
		/*
		var regex = /\{\{.{1}([^\}]+)\}\}/;
		return getValueOf(template.match(regex)[1], json);
		*/
		var valueOf,
			arr;

		if (obj[key]) {
			if (getPropertyType(obj[key]) === PROPERTY_TYPE.PRIMITIVE) {
				return obj;
			}
			
			return obj[key];
		}

		// need to chk scenario
		if (key === ".") {
			return obj;
		}

		if (key.indexOf(".") > -1) {
			arr = key.split('.');

			for (var i=0, n=arr.length; i<n; i++) {

				if (obj[arr[i]] && getPropertyType(obj[key]) !== PROPERTY_TYPE.PRIMITIVE) {
					obj = obj[arr[i]];
					continue;
				}

				return null;
			}

			return obj;
		}
	}

	function getRootTagKey(template) {
		var regex = /\{\{.{1}([^\}]+)\}\}/;
		return template.match(regex)[1];
	}

	function getChildTemplate (template) {
		return template.replace(/^\{\{[^\}]+\}\}/, '').replace(/\{\{[^\}]+\}\}$/, '');
	}

	function parse(template, json) {
		var blockRegex,
			match,
			context,
			contextValue,
			contextType,
			content;

		// while there are any block in template
		while (blockRegex = getBlockSelector(template)) {
			match = template.match(blockRegex);
			contextValue = getValueOf(getRootTagKey(match[0]), json);
			contextType = getPropertyType(contextValue);
			context = getContext(getRootTagKey(match[0]), json);

			switch (match[0].charAt(2)) {
				case '^':
					content = !(getValueOf(getRootTagKey(match[0]), json)) ? parse(getChildTemplate(match[0]), context) : '';
					break;

				case '#':
					if (contextType === PROPERTY_TYPE.ARRAY) {
						content = parseWithArray(getChildTemplate(match[0]), context);
					} else if (contextType === PROPERTY_TYPE.OBJECT) {
						content = parse(getChildTemplate(match[0]), context);
					} else {					
						content = (getValueOf(getRootTagKey(match[0]), json))  ? parse(getChildTemplate(match[0]), context) : '';
					}

					break;
			}

			template = template.replace(match[0], content);
		}



		return parseWithKeys(template, json);

	}

	function render (template, json) {
		return parse(trim(template), json);
	}

	return {
		render: render
	};
})();
