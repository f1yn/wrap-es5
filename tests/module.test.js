require('../module.js');

const EXPORT_KEY = '$F';
// setup modules since apparently each `describe` resets the `window` object.

// run constructor tests before anything else
describe('main polyfill', () => {
    const globalObject = window[EXPORT_KEY];

    describe(`globalObject "window.${ EXPORT_KEY }"`, () => {

        test(`exists in global namespace`, () => {
            expect(globalObject).toBeInstanceOf(Object);
        });

        test('has immutable namespace', () => {
            globalObject._test = 'hello';
            expect(globalObject._test).toBeUndefined();
        });

        test('require method', () => {
            expect(globalObject).toHaveProperty('require');
            expect(globalObject.require).toBeInstanceOf(Function)
        });

        test('createModule method', () => {
            expect(globalObject).toHaveProperty('createModule');
            expect(globalObject.createModule).toBeInstanceOf(Function)
        });

        test('listModules method', () => {
            expect(globalObject).toHaveProperty('listModules');
            expect(globalObject.listModules).toBeInstanceOf(Function)
            expect(globalObject.listModules()).toBeInstanceOf(Array)
        });

        test('namespace references', () => {
            expect(globalObject).toHaveProperty('window');
            expect(globalObject.window).toEqual(Window);

            expect(globalObject).toHaveProperty('bodyClass');
            expect(globalObject.bodyClass).toEqual(document.body.classList);
        });
    });

    test('"window.__createModule" method', () => {
        expect(window.__createModule).toBeInstanceOf(Function);
    });
});

describe(`module testing (no methods)`, () => {
    const globalObject = window[EXPORT_KEY];

    const testArray = [1, 2, 3, 4, 'hello world'];
    const dataId = '1-data';
    const writableId = '1-unprotected';
    const fetchId = '1-fetch';

    globalObject.createModule(dataId, function ($F) {
        // should be protected by default
        this.exports = [1, 2, 3, 4, 'hello world'];
    });

    globalObject.createModule(writableId, function ($F) {
        this.protected = false; // should no be protected
        this.exports = [1, 2, 3, 4, 'hello world'];
    });

    globalObject.createModule(fetchId, function ($F) {
        var self = this;
        var data = $F.require(dataId);

        this.exports = {
            returnData: function () {
                return data;
            },
            testLog: function(){
                self.log('this is a test log');
                self.warn('this is a test warn');
                self.error('this is a test error');
            }
        };
    });

    test('module exporting (exact match)', () => {
        let data = globalObject.require(dataId);
        expect(data).toEqual(testArray);
    })

    test('module importing (with methods) (exact match)', () => {
        let fetch = globalObject.require(fetchId);
        expect(fetch.returnData()).toEqual(testArray);
    })

    test('module protection', () => {
        var data = globalObject.require(dataId);
        expect(() => { data.push('bob') }).toThrow();
    });

    test('writable modules', () => {
        var writable = globalObject.require(writableId),
            val = 'bob';

        writable.push(val);
        expect(writable).toEqual(testArray.concat(val))
    })

    test('logging', () => {
        let fetch = globalObject.require(fetchId);

        expect(() => { fetch.testLog()} ).not.toThrow();
    })
});
