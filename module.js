/* GLOBAL HELPER FUNCTIONS */

(function(window, document, bodyClass){

    var modules = {}; // container for modules
    var globalObject = {}; // container for global objec that is pushed to window/each module when declared

    // allows freezing
    var lockable = typeof Object.freeze !== "undefined";

    // this is the constrictor used for creating new modules
    // name -> the name of the module ; code -> the code being applied within the module.
    function ModuleClass (name, code) {
        this.name = name;
        this.document = document;
        this.body = document.body;
        this.bodyClass = document.body.classList;

        try {
            code.apply(this, [globalObject, window, document, bodyClass]); // apply prototype and execute inner code

            // determine if the project has is not protected

            if (typeof this.exports === "object") {
                // the module has an object return, make sure it's protected (unless otherwise specified)

                if (((typeof this.protected === "boolean") ? this.protected : true) && lockable) {
                    // if the object is protected (default)
                    Object.freeze(this.exports);
                } else {
                    // warn the user
                    console.warn('[' + name + ']', 'exported object is un-protected. This is not recommended.');
                }
            }
        } catch (e) {
            console.error('[' + name + ']', 'has encountered a fatal exception', e);
        }
    }


    // routed console errors

    ModuleClass.prototype.consoleLogger = function(level, args){
        Function.prototype.apply.call(console[level], console, ['[' + this.name + ']'].concat(args));
        //console[level].apply(this, ['[' + this.name + ']'].concat(args));
    }

    ModuleClass.prototype.log = function(args){
        this.consoleLogger.apply(this, ['log', args]);
    }

    ModuleClass.prototype.warn = function(args){
        this.consoleLogger.apply(this, ['warn', args]);
    }

    ModuleClass.prototype.error = function(args){
        this.consoleLogger.apply(this, ['error', args]);
    }

    // Element checkers

    ModuleClass.prototype.checkFirstFromQuery = function(NodeList, warningMessage, callback){
        callback = typeof callback === "function" ? callback : null;

        if (typeof NodeList === "object" && NodeList.length > 0){
            if (callback){
                callback(NodeList[0]);
            } else return NodeList[0];
        }  else {
            this.warn(warningMessage || '');
            if (callback){
                // callback(null);
            } else return null;
        }
    }

    ModuleClass.prototype.firstNodeOf = function(NodeList, closure, warning){
        this.checkFirstFromQuery(NodeList, warning, closure);
    }

    ModuleClass.prototype.matchesAncestor = function(elem, max, check){
        if (typeof max === "number" && typeof elem === "object"){

            var i = max,// the number of layers that are searched (should be relatively short, since this happens each click)
                elemNode = elem;

            while (elemNode){
                // auto exit loop if elem is undefinedmainNavigator
                if (check(elemNode, elem)) {
                    // the dataset was found, return it's value
                    return elemNode;
                }

                elemNode = elemNode.parentNode; // iterate to next layer

                if (--i <= 0) return null; // there isn't a modalId that was triggered.
            }
            return null; // the while loop hit the top parent of the DOM tree
        }
    }

    ModuleClass.prototype.isScrolledIntoView = function(el) {
        /* optimized from source: http://stackoverflow.com/a/22480938 + comment correction */
        var rect = el.getBoundingClientRect();
        return (rect.top < window.innerHeight) && (rect.bottom >= 0);
    }

    // wrapper to be called when making new modules
    function createModule(name, code){
        if (typeof name !== "string"){
            console.error('Module must have a name!');
            return; // don't bother importing it
        }

        if (typeof modules[name] === "undefined") {
            console.log('added module "' + name + '"');
            modules[name] = new ModuleClass(name, code);
        } else {
            console.error('You cannot override a currently existing module')
        }
    }

    function _require(moduleName, readOnly){
        readOnly = (typeof readOnly === "boolean") ? readOnly : true; // default to a immutable reference

        if (typeof modules[moduleName] === "object"){
            // module exists, check if it has any exports

            if (typeof modules[moduleName].exports !== "undefined"){
                // it has an export
                return modules[moduleName].exports; // return immutable reference
            } else {
                console.warn('module "' + moduleName + '" has no exports');
            }

        } else {
            console.error('module does not exist!');
        }
    }

    // returns array of currently registered modules
    function listModules() {
        return Object.keys(modules)
    }

    // setup global object methods
    globalObject = {
        createModule: createModule,
        require: _require,
        listModules: listModules,
        window: Window,
        document: document,
        bodyClass: bodyClass,
    }

    // export global object if it does not already exist
    if (typeof window.$F === "undefined") {
        if (lockable){
            window.$F = Object.freeze(globalObject);
        } else {
            window.$F = globalObject
        }
    }

    // export global require method for imported scripts -> if it does not already exist
    if (typeof window.__createModule === "undefined") {
        window.__createModule = createModule;
    }

})(window, document, document.body.classList);
