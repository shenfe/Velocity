<h1 align="center">Velocity模板引擎</h1>

[>> JavaScript版本 <<](./src/javascript)

Velocity模板引擎，JavaScript和PHP两个版本。Apache官方Java版本见[velocity.apache.org](http://velocity.apache.org/)。

<p align="center"><img src="https://raw.githubusercontent.com/shenfe/Velocity/master/readme_assets/logos.png"></p>

## 快速使用

### JavaScript版本

建议使用npm安装`velocity-template-engine`。模块包含两个property：render纯函数、compile纯函数。

#### 模板渲染

`render`方法将一个vm模板字符串和一个数据对象合成一段字符串，例如：

```js
var tmpl = 'My name is ${name}. I\'m a #if($gender == "male")boy#{else}girl#end.';
var data = {
    name: 'June',
    gender: 'female'
};
window.velocity.render(tmpl, data); // "My name is June. I'm a girl."
```

#### 缓存

`render`方法还接受第三个参数，一个option对象：

| 选项字段 | 含义 |
| :---: | :--- |
| tmplId | 字符串或函数，用来表征当前模板的唯一性，用于缓存。如果未定义，模板字符串将作为该选项的值。 |
| dataId | 函数，接受一个参数（即当前数据），返回一个字符串，用来表征当前数据的唯一性，用于缓存。 |
| noCache | 是否禁用缓存。默认启用。 |

#### 模板编译

`compile`方法将一个vm模板字符串编译成一个函数（或函数体字符串，用于写入js文件），例如：

```js
var tmpl = 'My name is ${name}. I\'m a #if($gender == "male")boy#{else}girl#end.';
var render = window.velocity.compile(tmpl);
var render_raw = window.velocity.compile(tmpl, { raw: true }); // 第二个参数为配置项，raw为true则返回字符串

var data = {
    name: 'June',
    gender: 'female'
};

render(data); // "My name is June. I'm a girl."
(new Function(render_raw))(data); // "My name is June. I'm a girl."
```

### PHP版本

引入`velocity.php`文件后，命名空间PhpVelocity的Main类通过构造方法设置编译路径和vm文件更新检查开关；通过render方法将指定路径的vm文件与数据合成字符串，并可设置清除以往数据。例如：

```php
<?php
include './velocity.php';
use PhpVelocity\Main as Velocity;

$compile_dir = 'path/to/compiles';

$ve = new Velocity($compile_dir, true); // 设置编译路径，并在每次渲染前检查vm模板文件更新（默认不检查更新），如果有更新则重新编译

$data = array("name" => "June", "gender" => "female");
echo $ve->render('path/to/template1.vm', $data); // 渲染模板和数据
echo $ve->render('path/to/template2.vm'); // 渲染模板
$data = array("name" => "Apple", "price" => 10000);
echo $ve->render('path/to/template3.vm', $data, true); // 渲染模板和数据，清除以往数据
```

## 开发和测试

脚本 | 作用
| :---: | :--- |
`/server.js` | 运行WYSIWYG的web程序。
`/run_tests.sh` | 测试程序，负责运行各语言版本runner（目前是js与java两个版本的对比），监听runner输出文件变化，运行`diff_output`。
`/diff_output.sh` | 比较每个case的不同runner输出（目前是js与java两个版本的对比），输出报表。
`/sync_dists.sh` | 将`src`中的将各语言版本的velocity打包复制到`build`中和`test`中。
`/build_*.js` | 将`/src/[javascript/php]`（对应语言版本源码目录）中的`*.pegjs`语法文件build成parser，与源码结合，生成`/src/[javascript/php]/velocity.[js/php]`。


## 项目结构

路径 | 含义
| :---: | :--- |
`/src/antlr` | velocity的antlr范式开发。
`/src/debug` | 用于开发调试的web程序。
`/src/*` | 各语言版本的velocity实现源码，包括所有依赖。
`/build/*/velocity.*` | 各语言版本的velocity可执行程序，应由`src`打包。
`/test/cases` | 测试用例，每个case包含同名的一个`.vm`文件和一个`.json`文件。
`/test/diff` | 结果比较程序，比较各语言版本TestRunner的输出，并在该目录下生成`result.html`报表文件。
`/test/*/src` | 各语言版本的TestRunner源码；TestRunner运行时不需要输入参数，直接读取case文件并输出到各自`output`目录。
`/test/*/run.sh` | 各语言版本的测试运行脚本。
`/test/*/output/*.html` | 各语言版本的TestRunner的输出，每个输出文件对应一个case。

## More

* [velocity](http://velocity.apache.org/)
* [pegjs](https://github.com/pegjs/pegjs)
* [phpegjs](https://github.com/nylen/phpegjs)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, [shenfe](https://github.com/shenfe)
