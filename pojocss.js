'use strict';

// PojoCSS.js
// Principal Author: Anthony Raymond Bullard
// Read license.md for license information

// TODO: Add module system
// pojocss.module(name, registrationFunction, options)
// name 				STRING 		Name for the module, only lower case letters, numbers, and -
// registrationFunction	FUNCTION 	Function with all class declarations contained inside
// options				OBJECT		Contains options like whether to append module name to class selectors
// 									or include it as a descendent selector(space), or neither

var _ = require('lodash');
var fs = require('fs');

module.exports = (function() {
	var pojo = {};
	var SELECTOR_SPLIT_REGEX = /\.|\_|\#/;
	var SELECTOR_TOO_MANY_LEVELS = "A selector may only consist of a module and class|element|id";

	function newClassMethod(internalSelector, declarationBlock) {
		if(pojo.registry[internalSelector]) {
			throw new Error("This selector is already defined in this module");
		}
		var newClass = ClassBuilder(internalSelector, declarationBlock);
		var registryEntry = {};
		registryEntry[internalSelector] = newClass;
		pojo.registry = _.assign(pojo.registry, registryEntry);
		return newClass;
	}

	function getDeclarationBlockMethod(moduleName, selectorName) {
		moduleName = moduleName || pojo.activeModule;
		return pojo.registry[selectorName].declarationBlock;
	}

	function buildClass(className, classBuilder) {
		if(classBuilder.abstract) {
			return '';
		}
		var classString = '';
		classString = classString + '.' + className + ' {\n';
		_.forOwn(classBuilder.declarationBlock, function(value, key) {
			classString = classString + '  ' + key + ': ' + value + ';\n';
		});
		classString = classString + '}\n\n';
		return classString;
	}

	function buildMethod(filename, dir) {
		var fileString = '';
		var path = (dir || './') + (filename || 'style') + '.css'
		_.forOwn(pojo.registry, function(value, key) {
			fileString = fileString + buildClass(key, value);
		});
		fs.appendFileSync(path, fileString);
		console.log('Created a file at: ' + path);
	}
	pojo.registry = {};
	pojo.newClass = newClassMethod;
	pojo.getDeclarationBlock = getDeclarationBlockMethod;
	pojo.build = buildMethod;
	pojo.activeModule = 'default';
	function ClassBuilder(internalSelector, declarationBlock) {
		function extendsMethod(selectorToBeExtended) {
			if(this.sealed) {
				return this;
			}
			if(this.log.length > 0) {
				throw new Error('Can\'t extend once extended.');
			}
			var moduleName, selectorName, module;
			if(SELECTOR_SPLIT_REGEX.test(selectorToBeExtended)) {
				var parts = selectorToBeExtended.split(SELECTOR_SPLIT_REGEX);
				if(parts.length > 2) {
					throw new Error(SELECTOR_TOO_MANY_LEVELS)
				}
				moduleName = parts[0];
				selectorName = parts[1];
			} else {
				moduleName = this.moduleName;
				selectorName = selectorToBeExtended;
			}

			var declarationBlock = this.declarationBlock = pojo.getDeclarationBlock(moduleName, selectorName);
			this.log.push({
				action: 'extending',
				selectorUsed: selectorToBeExtended,
				declarationBlockAdded: _.assign({}, declarationBlock)
			});

			return this;
		}

		function newDeclarationsMethod(declarationBlock) {
			if(this.sealed) {
				return this;
			}
			var that = this;
			_.forOwn(declarationBlock, function(value, key) {
				if(_.has(that.declarationBlock, key)) {
					throw new Error('This declaration has already defined this property');
				}
			});
			_.merge(this.declarationBlock, declarationBlock);
			return this;
		}

		function overridesMethod(declarationBlock) {
			if(this.sealed) {
				return this;
			}
			_.merge(this.declarationBlock, declarationBlock);
			return this;
		}

		function overrideDeclarationMethod(propertyName, value) {
			if(this.sealed) {
				return this;
			}
			var overrideDeclaration = {};
			overrideDeclaration[propertyName] = value;
			_.merge(this.declarationBlock, overrideDeclaration);
			return this;
		}

		function withDeclarationMethod(propertyName, value) {
			if(this.sealed) {
				return this;
			}
			if(_.has(this.declarationBlock, propertyName)) {
				throw new Error('The property \'' + propertyName + '\' has already been set!');
			}
			var newDeclaration = {};
			newDeclaration[propertyName] = value;
			_.merge(this.declarationBlock, newDeclaration);
			return this;
		}

		function setDescriptionMethod(description) {
			if(this.sealed) {
				return this;
			}
			this.description = description;
			return this;
		}

		function sealMethod() {
			this.sealed = true;
			pojo.registry[this.internalSelector] = this;
			return this;
		}

		function isAbstractMethod(value) {
			if(this.sealed) {
				throw new Error("Can not modify a sealed class!");
			}
			this.abstract = value || true;
			return this;
		}
		return {
			internalSelector: internalSelector,
			module: pojo.activeModule,
			extending: extendsMethod,
			withNewDeclarations: newDeclarationsMethod,
			withOverrides: overridesMethod,
			overrideDeclaration: overrideDeclarationMethod,
			withDeclaration: withDeclarationMethod,
			setDescription: setDescriptionMethod,
			isAbstract: isAbstractMethod,
			seal: sealMethod,
			declarationBlock: declarationBlock || {},
			log: [],
			sealed: false,
			abstract: false,
			description: ''
		}
	}
	return pojo;
})();