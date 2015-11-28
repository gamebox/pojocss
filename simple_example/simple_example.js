'use strict';
var pojocss = require('./pojocss.js');
var vars = require('./vars.js');

var defaultMod = pojocss.module('default', {
	'test1': {
		'display': 'block',
		'float': 'left'
	},
	'test2 < test1': {
   		'border-left': '1px solid green',
   		'!float': 'right'
	},
	'other-test < test2': {
	   '!display': 'inline-block',
	   'color': '#343434'
	},
	'*btn': {
		'display': 'inline-block',
		'padding': '8px 12px',
		'border-radius': '3px',
		'margin': vars.DEFAULT_MARGIN,
		'border': 'none'
	},
	'btn-primary < btn': {
	    'background-color': '#47D934'
	},
	'specific-context-btn < btn-primary': {
	    '!margin': '3px 5px'
	}
}, 'du').build();

pojocss.file('out/style1.css', [defaultMod]).build();