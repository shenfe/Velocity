<h1 align="center">Velocity Template Engine for JavaScript</h1>

This is a JavaScript implementation of [Apache Velocity](http://velocity.apache.org/) template engine.

<p align="center">
    <img src="https://raw.githubusercontent.com/shenfe/Velocity/master/readme_assets/velocity-logo.png">
    <img width="60" height="60" src="https://raw.githubusercontent.com/shenfe/Velocity/master/readme_assets/javascript-logo.png">
</p>

## Quick Start

```bash
npm install --save velocity-template-engine
```

Import and use module `velocity` which contains methods `render` and `compile`, both of which can be used as pure functions.

### rendering a template

Method `render` combines a velocity template string (`vts` below for short) and a data object, returning a string.

Example:

```js
var tmpl = 'My name is ${name}. I\'m a #if($gender == "male")boy#{else}girl#end.';
var data = {
    name: 'June',
    gender: 'female'
};
window.velocity.render(tmpl, data); // "My name is June. I'm a girl."
```

### compiling a template to a function

Method `compile` compiles a vts to a pure function or a string of pure function body (to be written into files).

Example:

```js
var tmpl = 'My name is ${name}. I\'m a #if($gender == "male")boy#{else}girl#end.';
var render = window.velocity.compile(tmpl);

// The second argument is options, and the `raw` property indicates whether to compile the vts to a string or not.
var render_raw = window.velocity.compile(tmpl, { raw: true });

var data = {
    name: 'June',
    gender: 'female'
};

render(data); // "My name is June. I'm a girl."
(new Function(render_raw))(data); // "My name is June. I'm a girl."
```

## Notice

Some grammar features have not been implemented. If you need, propose an issue please.

## More

* [velocity](http://velocity.apache.org/)
* [pegjs](https://github.com/pegjs/pegjs)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, [shenfe](https://github.com/shenfe)
