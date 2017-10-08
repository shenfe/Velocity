# Velocity Template Engine

Implementations of [Apache Velocity](http://velocity.apache.org/) template engine，including versions of JavaScript and PHP.

<p align="center"><img src="https://raw.githubusercontent.com/shenfe/Velocity/master/readme_assets/logos.png"></p>

## Quick Start

### JavaScript Version

Import file `velocity.js`, then use module `velocity` which contains methods `render` and `compile`, both of which can be used as pure functions.

#### rendering a template

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

#### compiling a template to a function

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

### PHP Version

Import file `velocity.php`, then use `Main` class in the namespace `PhpVelocity`. The `Main` class contains the constructor and method `render`.

The constructor is used to specify the compilation path and set the update checking switch of template files (with suffix `.vm`).

Method `render` combines the vts (in the path-specified file) and a data object, returning a string.

```php
<?php
include './velocity.php';
use PhpVelocity\Main as Velocity;

$compile_dir = 'path/to/compiles';

// Specify the compilation path, and set the update checking switch for templates. 
// If a template file is modified after its latest compilation, it should be re-compiled before being used for rendering.
$ve = new Velocity($compile_dir, true); 

$data = array("name" => "June", "gender" => "female");
echo $ve->render('path/to/template1.vm', $data); // Render a template and a data object.
echo $ve->render('path/to/template2.vm'); // Render a template.
$data = array("name" => "Apple", "price" => 10000);
echo $ve->render('path/to/template3.vm', $data, true); // Render a template and a data object, and clean up the history data.
```

## Develop & Test

Script | Function
| :---: | :--- |
`/server.js` | Run the server of the web application for debugging and testing.
`/run_tests.sh` | Run the test runners in different language versions (JavaScript and Java for now), and run the output diffing.
`/diff_output.sh` | Compare (namely diff) each case's output of test runners in different languages (JavaScript and Java for now), and generate a report file.
`/sync_dists.sh` | Build and distribute.
`/build_*.js` | Build. Compile `*.pegjs` grammar to a parser, then combine it with base codes, and generate the complete `velocity` library file `/src/[javascript|php]/velocity.[js|php]`.


## Project Structure

Path | Explanation
| :---: | :--- |
`/src/antlr` | [antlr](http://www.antlr.org) parser generator development for velocity template grammar.
`/src/debug` | The WYSIWYG web application for debugging and testing.
`/src/*` | Source codes of velocity implementation in different programming languages, and all dependencies.
`/build/*/velocity.*` | Distribution codes, built from `src` files.
`/test/cases` | Test cases, each of which has a `.vm` file and a `.json` file.
`/test/diff` | Diffing the output results of test runners in different language versions, generating file `result.html`.
`/test/*/src` | Source codes of test runners in different language versions. Test runners run upon test cases as the input, and output into `output` folders of each language version.
`/test/*/run.sh` | The test launcher for each language version.
`/test/*/output/*.html` | Outputs of test runners in different language versions.

## More

* [velocity](http://velocity.apache.org/)
* [pegjs](https://github.com/pegjs/pegjs)
* [phpegjs](https://github.com/nylen/phpegjs)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, [shenfe](https://github.com/shenfe)
