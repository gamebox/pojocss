'use strict';
var pojocss = require('./pojocss.js');
var defaultMod = require('./default-mod.js');

pojocss.file('out/style1.css', [defaultMod]).build();