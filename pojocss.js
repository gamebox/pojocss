'use strict';

// PojoCSS.js
// Principal Author: Anthony Raymond Bullard
// Read license.md for license information

var _ = require('lodash');
var fs = require('fs');

module.exports = (function() {
	var SELECTOR_SPLIT_REGEX = /\.|\_|\#/;
	var SELECTOR_TOO_MANY_LEVELS = 
	    "A selector may only consist of a module and class name(psuedo-selectors coming soon).";
	
	function breakdownInternalSelector(selectorIn, moduleName) {
		var parts = selectorIn.split(' < ');
		var d = parts.length > 1 ? parts[1] : null;
		var a = parts[0][0] === '*';
		var s = a ? parts[0].slice(1) : parts[0];
		d = d && d.split('.').length === 1 ? moduleName + '.' + d : d;
		s = moduleName + '.' + s;
		return {
			a: a, // isAbstract?
			s: s, // Qualified Selector
			d: d  // Qualified Dependency Selector
		};
	}

	function newClassBuilder(internalSelector, declarationBlock, moduleName, options) {
		var ruleset = breakdownInternalSelector(internalSelector, moduleName);
		ruleset.r = declarationBlock; // Raw Declaration Block
		ruleset.m = options;
		return ruleset;
	}

	function moduleMethod(name, rulesets, options) {
		if(!name) {
			throw new Error("Every module must have a name defined.");
		}

		function build() {
			console.log('* Building Module "' + name + '"');
			return _.map(rulesets, function(ruleset, key) {
				return newClassBuilder(key, ruleset, name, options);
			});
		}

		return {
			build: build,
			name: name
		}
	}


	function fileMethod(path, modules) {
		var registry = _.flatten(modules);

		function build() {
			function cleanDeclarations(declarations) {
				return _.mapKeys(declarations, function(value, key) {
					var newKey = (key[0] === '!') ? key.slice(1) : key;
					return newKey;
				});
			}
			function applyToDependency(newDeclarations, oldDeclarations) {
				var newDeclarationPairs = _.pairs(newDeclarations);
				var partition = _.groupBy(newDeclarationPairs, function(value) {
					return value[0][0] === '!' ? 'override' : 'add';
				});
				var overrides = _.zipObject(partition.override);
				var adding = _.zipObject(partition.add);
				overrides = cleanDeclarations(overrides);
				var base = _.merge(_.clone(oldDeclarations, true), overrides);
				_.forOwn(adding, function(d, key) {
					if(_.has(base, key)) {
						throw new Error('Can\'t implicitly override key "' + key + '"" from ' + JSON.stringify(base));
					}
				});
				return _.merge(base, adding);
			}

			function buildOutputForRuleset(ruleset) {
				if(ruleset.o && ruleset.o.isArray()) {
					return;
				}
				if(ruleset.d) {
					var dependency = _.find(registry, { 's': ruleset.d}).o;
					ruleset.o = applyToDependency(ruleset.r,
						                          dependency || buildOutputForRuleset(dependency));
				} else {
					ruleset.o = cleanDeclarations(ruleset.r);
				}
			}

			function buildClassString(class_) {
				if(class_.a) {
					return '';
				}
				var selectorParts = class_.s.split('.');
				var className = selectorParts[1];
				var module = selectorParts[0];
				// TODO(@gamebox): Allow for reversed order and refactor out as fn
				if (!class_.m || class_.m.h) {
					var classString = '.' + module + '-' + className + ' {\n';
				} else if (!class_.m || class_.m.dh) {
					var classString = '.' + module + '--' + className + ' {\n';
				} else if (class_.m && class_.m.u) {
					var classString = '.' + module + '_' + className + ' {\n';
				} else if (class_.m && class_.m.du) {
					var classString = '.' + module + '__' + className + ' {\n';
				} else if (class_.m && class_.m.no) {
					var classString = '.' + className + ' {\n';
				}
				_.forOwn(class_.o, function(value, key) {
					classString = classString + '  ' + key + ': ' + value + ';\n';
				});
				classString = classString + '}\n\n';
				return classString;
			}

			console.log('[' + (new Date()) + '] Building file with ' + registry.length + ' rulesets...');
			var fileString = '';
			_.forOwn(registry, (ruleset) => buildOutputForRuleset(ruleset))
			_.forOwn(registry, function(value) {
				fileString = fileString + buildClassString(value);
			});
			fs.writeFileSync(path, fileString, { flags: 'w'});
			console.log('[' + (new Date()) + '] Created a file at: ' + path);
		}

		return {
			build: build
		}
	}


	return {
		module: moduleMethod,
		file: fileMethod
	};
})();