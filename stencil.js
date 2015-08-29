Stencil = (function(){

	var PROPERTY_TYPE = {
		ARRAY: 'ARRAY',
		OBJECT: 'OBJECT',
		PRIMITIVE: 'PRIMITIVE'
	};

	function trim(str) {
		return str.replace(/^\s+|\s+$/g, '').replace(/[\n]+/g, '');
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

	function render(template, json) {
		var regex = /\{\{[#\^]{1}[^\}]+\}\}.*\{\{\/[^\}]+\}\}/g,
			regexIdentifier = /\{\{([^\}]+)\}\}/,
			identifierMatches = [],
			match = null,
			blocks = [],
			html;

		template = trim(template);
		match = template.match(regex);

		if (match) {
			blocks = getBlocks(match[0]);
			html = blocks.map(function(item){
				var propertyValue = getValueOf(item.key, json),
					propertyType = getPropertyType(propertyValue);

				if (item.tag.charAt(0) === '^') {
					if (!json[item.key]) {
						return render(item.block, json);
					}						
				} else {
					if (propertyType === PROPERTY_TYPE.OBJECT) {
						return render(item.block, json[item.key]);
					} else if (propertyType === PROPERTY_TYPE.ARRAY) {
						return renderWithArray(item.block, json[item.key]);
					} else {

						if (propertyValue) {
							return render(item.block, json);
						}

						return '';
					}
				}
			});

			template = template.replace(match[0], html.join(''));
		}

		//
		while (regexIdentifier.test(template)) {
			identifierMatches = template.match(regexIdentifier);
			template = template.replace(new RegExp('\{\{' + identifierMatches[1] + '\}\}'), getValueOf(identifierMatches[1], json));
		}

		return template;
	}

	return {
		render: render
	};
})();