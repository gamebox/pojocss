#POJOCSS.js

Don't be confused.  This is a Javascript library for building CSS files.  Yes, I know:  "What?"

This is about exploring what expressing CSS rulesets as Plain ol' Javascript Objects could bring to the experience of building stylesheets for your webapps.

Let's see what I've found so far

##Module System

We are smart authors of CSS, we like to namespace our classes and not fight the specificity battle.  So, we develop our styles in modules.  One powerful thing that I've found here?  We can compose a lot of different ways to compose our rule selectors.  For instance:

    ``` css
    .module-class  { ... }
    .module--class { ... }
    .module_class  { ... }
    .module__class { ... }
    .module .class { ... }
    ```

No need for the system to get all opinionated, though it does start with one big opinion that may be a deal breaker for some.  *All* selectors are classes. So the module name will either add it self to the front(or rear maybe) of the class names you choose as selectors.  One flag changes everything.  This makes the module system lightweight.

``` javascript
pojocss.module('moduleName', {
	'class': {
		'property': 'value';
	},
	'class2': {
		'other-property': 'other-value'
	}
}, 'du').build();
```

You'll see that you supply a string name for the module, an object containing key-value pairs of class names and declaration blocks expressed as key-value pairs, and then finally a display options object that allows you to choose how the classes are rendered: `h`, `dh`, `u`, `du`, `no`, or `id`.  These stand for hyphen, double-hyphen, underscore, double-underscore, no module name, and indirect descendant syntax.  If you write low specificity, class-based stylesheets, and want to componentize your rules easily, this is a great tool.

But surely namespacing isn't the advantage to a module system is it?  Of course not.

##Cross-module inheritance

Rulesets(or 'classes' as they are referred to here multiple times) can directly inherit from rulesets in other modules.  See the following.

``` javascript
pojocss.module('firstModule', {
	'class': {
		'property': 'value';
	},
	'class2': {
		'other-property': 'other-value'
	}
}, 'du').build();

pojocss.module('secondModule', {
	'class1 < firstModule.class2': {
		'some-property': 'some-value'
	}
}, 'du').build();
```

Now, when a graph of `[firstModule, secondModule]` is rendered, `secondModule.class1` will look like this

``` css
.second-module__class1 {
	some-property: some-value,
	other-property: other-value
}
```

Now, this seems like a mixin sort of.  How can it be more powerful, just a light coat of DSL.

##Lightweight DSL for abstract classes and implicit override protection

Need a class to be "abstract" or exact to fulfill dependencies, but not actually appear in the rendered stylesheets? When you create the selector key for the ruleset, just prefix it with a `*`, like so:

``` javascript
{
	'*abstractClass': {
		'some-property': 'some-value'
	}
}
```

Anything that extends that class will be able to do so, but this ruleset will not be found in your CSS file.  Now, I said this DSL was lightweight, and it in fact has one other operator: `!`.  Place it in front a property name to make it explicit that you wish to override the value from a dependency.  Failing to do so will cause the compiler to throw an error.  This way, with low specificity and only class based styles, you can easily author styles without calculating specificity scores or accidentally overwriting properties.  Do it like this:

``` javascript
pojocss.module('firstModule', {
	'class': {
		'property': 'value';
	},
	'class2': {
		'other-property': 'other-value'
	}
}, 'du').build();

pojocss.module('secondModule', {
	'class1 < firstModule.class2': {
		'!other-property': 'some-other-value'
	}
}, 'du').build();
```
 And you'll end up with this:

 ``` css
.second-module__class1 {
	other-property: some-other-value
}
```

##It's just Javascript

Probably the best part about **POJOCSS** is that it is _just Javascript_, not some CSS variant trying to hack on calculation and variables and such.  This is what Javascript does for a living.  Create variables, generators, factory functions, value calculators, whatever you'd like.  Or use it like it's just a preprocessor.  Or use it like PostCSS, scanning properties and values for things to transform, combine, or divide.  Auto-prefix with ease.

Right now, there aren't any "hooks" into the compilation system.  But there might not need to be.  There are two great places for you to put your hacking skills to work.

###Defining the classes

######Coming Soon...

###Working with built modules

######Coming Soon...
