Dictionary
=========

## Overview
Structure like array with fast search by value (indexOf)


### example
```javascript
var Dictionary = require('./dictionary');
var dic = new Dictionary();
var indx = dic.add('hello1');
dic.add('hello2');
dic.add('hello3');
console.log(dic.has('hello2'));
dic.remove('hello2');
console.log(dic.get(indx));
console.log(dic.has('hello2'));
dic.forEach(console.log);
```
