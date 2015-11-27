'use strict';

var pojocss = require('./pojocss.js');

pojocss.newClass('test1', {
	'display': 'block',
	'float': 'left'
}).isAbstract(true).seal();
pojocss.newClass('test2')
       .extending('test1')
       .withNewDeclarations({'border-left': '1px solid green'})
       .withOverrides({'float': 'right'})
       .seal();

pojocss.newClass('other-test')
       .extending('test2')
       .overrideDeclaration('display', 'inline-block')
       .withNewDeclarations({'color': '#343434'})
       .seal();

pojocss.newClass('btn', {
	'display': 'inline-block',
	'padding': '8px 12px',
	'border-radius': '3px',
	'margin': '3px',
	'border': 'none'
}).isAbstract().seal();

pojocss.newClass('btn-primary')
       .extending('btn')
       .withDeclaration('background-color', '#47D934')
       .seal();
// now <button class="btn-primary"> will have all the .btn properties, as well as the background color
// No need for .btn class, as that will actually not be in the style file

// Need to have the button in a specific context have a bigger border?  Make a new class for it.
pojocss.newClass('specific-context-btn')
       .extending('btn-primary')
       .overrideDeclaration('margin', '3px 5px')
       .seal();
// pojocss.newClass('specific-context-btn').extending('btn-primary').withDeclaration('margin', '3px 5px'); <-- Throws error

pojocss.build();