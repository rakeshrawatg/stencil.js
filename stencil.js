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

	function getBlocks(template) {
		var regex = /^\{\{([#\^]{1}([^\}]+))\}\}/,
			regexBlock,
			match,
			matchBlock,
			blocks = [];

		while (true) {
			template = trim(template);
			match = template.match(regex);

			// break if match not found
			if (!match) {
				break;
			}

			regexBlock = new RegExp('^\{\{\\' + match[1] + '\}\}.*?\{\{\/' + match[2] + '\}\}');
			matchBlock = template.match(regexBlock);
			template = trim(template.replace(matchBlock[0], ''));
			matchBlock[0] = trim(matchBlock[0]
							.replace(/^\{\{[^\}]+\}\}/, '')
							.replace(/\{\{[^\}]+\}\}$/, ''));

			blocks.push({
				block: matchBlock[0],
				tag: match[1],
				key: match[2]
			});
			
		}

		return blocks;
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

	function renderWithArray(template, json) {
		var arr = json.map(function(value) {
			var propertyType = getPropertyType(value);

			switch (propertyType) {
				case PROPERTY_TYPE.OBJECT:
					return render(template, value)
					break;
				case PROPERTY_TYPE.ARRAY:
					return renderWithArray(template, value);
					break;
				case PROPERTY_TYPE.PRIMITIVE:
					return render(template, value);
					break;					
			}

		});

		return arr.join('');
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

	function getBlocksContent (blocks) {
		var arr = blocks.map(function(item) {
			return item.block;
		});

		return arr.join('');
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

	function getContext(template, json) {
		var regex = /\{\{.{1}([^\}]+)\}\}/;
		return getValueOf(template.match(regex)[1], json);
	}

	function getChildTemplate (template) {
		return template.replace(/^\{\{[^\}]+\}\}/, '').replace(/\{\{[^\}]+\}\}$/, '');
	}

	function parse(template, json) {
		var blockRegex,
			match,
			context,
			content;

		// while there are any block in template
		while (blockRegex = getBlockSelector(template)) {
			match = template.match(blockRegex);
			context = getContext(match[0], json);

			switch (match[0].charAt(2)) {
				case '^':
					content = !(context) ? parse(getChildTemplate(match[0]), context) : '';
					break;

				case '#':
					if (getPropertyType(context) === PROPERTY_TYPE.ARRAY) {
						content = parseWithArray(getChildTemplate(match[0]), context);
					} else if (getPropertyType(context) === PROPERTY_TYPE.OBJECT) {
						content = parse(getChildTemplate(match[0]), context);
					} else {					
						content = context ? parse(getChildTemplate(match[0]), context) : '';
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