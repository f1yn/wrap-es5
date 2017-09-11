/*
* Flynn Buckingham - 2017
* manual JS testing area for basic functions
* */

// test 1: test whether or not export creation and immutability of objects works

(__createModule('test-1-data', function(){
    this.exports = ['bob', 'marley'];
}));

(__createModule('test-1-data-unprotected', function(){
    this.protected = false; // allow manual manipulation of data
    this.exports = ['bob', 'marley'];
}));

(__createModule('test-1-protected', function(){
    var data = $F.require('test-1-data');
    data.push('frank');
    this.log(data);
}));
(__createModule('test-1-unprotected', function(){
    var data = $F.require('test-1-data-unprotected');
    data.push('frank');
    this.log(data);
}));