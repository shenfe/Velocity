<h1 align="center">Velocity Template Engine for JavaScript</h1>

This is a JavaScript implementation of [Apache Velocity](http://velocity.apache.org/) template engine.

<p align="center">
    <img src="https://raw.githubusercontent.com/shenfe/Velocity/master/readme_assets/velocity-logo.png">
    <img width="60" height="60" src="https://raw.githubusercontent.com/shenfe/Velocity/master/readme_assets/javascript-logo.png">
</p>

## Quick Start

```bash
$ npm install --save velocity-template-engine
```

The module contains methods `render` and `compile`, both of which can be used as pure functions.

### 🎨 rendering a template

Method `render` combines a velocity template string (`vts` below for short) and a data object, returning a string.

Example:

```js
let tmpl = 'My name is ${name}. I\'m a #if($gender == "male")boy#{else}girl#end.';
let data = {
    name: 'June',
    gender: 'female'
};
window.velocity.render(tmpl, data); // "My name is June. I'm a girl."
```

### ♻️ caching

Additionally, there is a third parameter for the `render` method, which is an `options` object.

| Option Property | Meaning |
| :---: | :--- |
| tmplId | A string or function representing the uniqueness of the template. For caching. The template string would be used if it was undefined. |
| dataId | A function which accepts the data and returns the unique id string of the data. For caching. |
| noCache | Whether disable caching or not. |

Example:

```js
let tmpl = 'My name is ${name}. I\'m a #if($gender == "male")boy#{else}girl#end.';
let tmplName = 'user-desc';
for (let i = 0; i < 1000000; i++) {
    let data = {
        time: Date.now(),
        name: 'June',
        gender: 'female'
    };
    window.velocity.render(tmpl, data, {
        tmplId: tmplName,
        dataId: user => Math.floor(user.time / 1000)
    });
}
```

> Note: you must be clearly aware of what you are doing, since the cached data amount must be in control.

### 📰 compiling a template to a function

Method `compile` compiles a vts to a pure function or a string of pure function body (to be written into files).

Example:

```js
let tmpl = 'My name is ${name}. I\'m a #if($gender == "male")boy#{else}girl#end.';
let render = window.velocity.compile(tmpl);

// The second argument is options, and the `raw` property indicates whether to compile the vts to a string or not.
let render_raw = window.velocity.compile(tmpl, { raw: true });

let data = {
    name: 'June',
    gender: 'female'
};

render(data); // "My name is June. I'm a girl."
(new Function(render_raw))(data); // "My name is June. I'm a girl."
```

## Directives

Name | Usage | Example
:---: | :--- | :---
if | Condition. | `#if($a) a #elseif($b) b #else c #end`
foreach | Loop. | `#foreach($item in $list) $velocityCount: $item #end`
set | Assign a variable, declaring it at the same time if not exist. | `#set($a = 1)`
define | Define a variable as a block of VTL. | `#set($name = "Tom") #set($gender = "male") #define($a) $name is $gender #end $a`
macro | Define a functional directive as a macro of VTL. | `#macro(a $name $gender) $name is $gender #end #a("Tom" "male")`

## More

* [velocity](http://velocity.apache.org/)
* [pegjs](https://github.com/pegjs/pegjs)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright © 2017-present, [shenfe](https://github.com/shenfe)
