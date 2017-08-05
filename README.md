# Flynn-Module-ES5 (EcmaScript 5)

This is a polyfill wrapper that helps remove the issue of global namespace pollution, as well as introduce a couple of
key features that I regularly use for my projects.

I do this to help add the ability to increase the portability of my
projects, as well as allow inheritance of common methods (that I use regularly) through prototype inheritance.



## Installing

To install, include this git repository as a dependency for your npm project and `npm install`.

```json
{
  "dependancies":{
     "flynn-module-es5": "git://github.com/flynnham/flynn-module-es5.git"
  }
}
```

The package then be automatically fetched from git. The package will automatically update when using `npm update`.

The `module.js` file can then be found in the `node_modules/flynn-module-es5` directory as `module.js`. Include the file
manually into your build process **before** anything else, to ensure that modules can be created afterwards.

The filepath of the `module.js` is passed to the `index.js` when the package is `required` in the build script.

Example gulp build:
```javascript
var gulp = require('gulp');
var flynnModule = require('flynn-module-es5'); // returns the fullpath of the `module.js` file.
  
gulp.task('copy:module-polyfill', () =>{
  return gulp.src(flynnModule)
    .pipe(gulp.dest('./build/assets'));
})
```

There are no dependencies for this package, due to it's minimalist nature.

## Usage

The idea behind this code is to reduce global pollution by implementing a primitive module polyfill, which allows for
isolation of specific code segments, while allowing the export of modules. When creating new modules, the following
syntax is used:

```javascript
($F.createModule('the-name-of-the-module', function(globalObject){
    var self = this; // pointer to the module root object
    
    
    // code to be executed in the module, methods, ect
    
    
    self.exports = {} || [] || 'string' || 'number' || null; 
    
    // At the end of the module, an export can be made allowing for
    // the import of the module within proceeding code.
    // This can be data, an interface, or anything you want to be
    // shared between modules.
}));
``` 

After the code reaches the `self.exports` (or `this.exports` if inside the module's main scope), whatever type of data
that is exportedcalls from within the module can be imported into another using the `global.require` method. An example of
this can be seen below:

```javascript

// createModule is a global alias for the $F.createModule call.
// It is intended to be used when creating exportable/dynamic
// modules where the namespace or name of the global object
// is unknown.

// MODULE #1
(__createModule('data-module', function(){    
    this.exports = ['hello', 'world']; // export the data
}));

// MODULE #2
(__createModule('functional-module', function($F){
    // $F is the name of the global object reference, allowing
    // for importing of modules, as well as other methods.
    // While it could be referenced directly, it is a
    
    var data = $F.require('data-module');
    // import the previously declared module if it exists
     
    console.log(data); // log the output of the data.
    // should output ['hello', 'world'] or something similar.
}));
```


## The global object (`window.$F`)
The global object is the object created when the `module.js` code is loaded on the client-side. By default, it is 
set to the value of `window.$F`, but can be manually changed to meet your specific requirements. 

The global object is also passed as the first parameter of any `$F.createModule` or `window.__createModule` calls, allowing
appropriate reference within the scope of the module itself.

***
### `$F.createModule`  (`window.__createModule`)
#### params: `( nameOfModule {string}, closure {function} )`
See **Usage** above, as it's usage is explained.

***
### `$F.require( nameOfModule {string} )`
Also explained in **Usage** above. Will result in `console.error` message if the module does not exist, and a
`console.warn` if the called module exists, but does not have any export value.

***
### `$F.window`
A reference to the `Window` object on the client.

***
### `$F.document`
A reference to the `document` object on the client.

***
### `$F.bodyClass`
A reference to the `document.body.classList` method object on the client.



## The module prototype (and it's methods)

I have included methods (and plan on implementing more) that I find useful for my daily code. These methods are
available by accessing the module's root scope (`this` or preferably `self` when declared within the module's root).

The available methods are as follow:

***
### `this.log`, `this.warn`, `this.error`
Useful logging functions that reference the name of the module from which it is called.

Takes multiple arguments, which are equivalent to that of their native equivalents (`console.log`, `console.warn`, and `console.error`).

#### Example:
```javascript
(__createModule('functional-module', function($F){
    var self = this;
     
    self.log('hello'); // log the output of the data.
    
    // should output `[functional-module] hello`
}));
```
***
### `this.checkFirstFromQuery`
#### params: `( NodeList {NodeList}, warningMessage [{string} optional], callback [{function} optional] )`
This method (mostly used as a longhand version of `firstNodeOf`) allows for the checking whether the first Node of a
NodeList exists. This particularly useful if deciding whether a block of code *should* execute of a specific class
instance is present.

In my own way of coding, I often specify whether to run code if a specific instance of a classed
`HTMLElement` is available. If it is, it will run a closed blocked code inaccessible to other blocks of code.

If there is no callback function, it returns an `HTMLElement` reference matching the first Node of the query, or `null` 
if none are found. There is no return value if a `callback` if present.

#### Example:
```javascript
(__createModule('functional-module', function($F){
    var self = this;
    
    // usage example, callback closure 
    self.checkFirstFromQuery(document.getElementsByClassName('bob'),
        'Bob class does not exist', function(element){
        
        // This code will only execute if there is at least one Element'
        // With a ClassName of bob.
        
        // Otherwise, `[functional-module] Bob class does not exist` will
        // will be output to the console.
    });
    
    // usage example, conditional set
    
    var bob; // declare an empty variable for bob (useful if you will be)
    // referencing or exporting bob from within the module.
    
    if (bob = self.checkFirstFromQuery(document.querySelectorAll('div.bob'), 
        'No div with the className \'bob\' exist.')){
        
        // this code will only run if there is at least one Node in the query
        // Otherwise, `[functional-module] No div with the className 'bob' exist.` will
        // will be output to the console.
    }
  }));
```

***
### `this.firstNodeOf`
#### params: `( NodeList {NodeList}, callback [{function} optional], warningMessage [{string} optional] )`
A wrapper function for `this.checkFirstFromQuery`, with a different ordering of parameters. The warningMessage parameter
is now the last parameter. 

***
### `this.isScrolledIntoView( element {HTMLElement} )`
Compared the current `getBoundingClientRect()` of an HTMLElement with the size of the window to determine if it is inside
the client's viewport. Returns a `boolean` value.

***
### `this.matchesAncestor`
#### params: `( element {HTMLElement}, maxDepth {Number}, check {Function} )`
Searches the `parentNode` of the `element` until a the `check` function returns a the `HTMLElement` if a matching element is found; will return `null` if one does not exist. `maxDepth` is required, as it prevents the search from propagating too far up the DOM tree.

The `check` has two parameters that are given whenever a new iteration is triggered (when the loop goes to the next
parentNode). The first parameter will be the current `parentNode` being compared, while the second is the element that
is the original root element (optional).

#### Example:
```javascript
(__createModule('functional-module', function($F){
    var self = this;
    
    var whatever = document.getElementById('whatever');
    
    if (whatever){
        // if whatever has even been ever (if it exists)
        
        // simple comparison function - check if element has bobclass
        function hasBobClass(element){
            if (element.classList.contains('bob')){
                return true;
            }
            return false;
        }
        
        // lets create a search that checks if a defined element
        // has a parentNode containing the className 'bob'.
        
        // only allow it to search three parents before giving up
        // and returning null
       
        var bobContainer = self.matchesAncestor(whatever, 3, hasBobClass);
        
        if (bobContainer){
            self.log('.bob begot something, which eventually begot #whatever')
        }
    }
  }));
```

This prototype method can be extremely useful when trying to find if a `e.target` inside of a global event handler
has a specific parent with a specific attribute or property.

***

More methods will be added over time.
