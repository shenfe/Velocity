## 运行程序

`/server.js`

运行WYSIWYG的web程序。


`/run_tests.sh`

测试程序，负责运行各语言版本runner（目前是js与java两个版本的对比），监听runner输出文件变化，运行`diff_output`。


`/diff_output.sh`

比较每个case的不同runner输出（目前是js与java两个版本的对比），输出报表。


`/sync_dists.sh`

将`src`中的将各语言版本的velocity打包复制到`build`中和`test`中。


`/build_*.js`

将`/src/[javascript/php]`（各语言版本源码目录）中的`*.pegjs`语法文件build成parser，与源码结合，生成`/src/[lang]/velocity.[js/php]`。


## 文件结构

`/src/antlr`

velocity的antlr范式开发。

`/src/debug`

用于开发调试的web程序。

`/src/*`

各语言版本的velocity实现源码，包括所有依赖。


`/build/*/velocity.*`

各语言版本的velocity可执行程序，应由`src`打包。


`/test/cases`

测试用例，每个case包含同名的一个`.vm`文件和一个`.json`文件。


`/test/diff`

结果比较程序，比较各语言版本TestRunner的输出，并在该目录下生成`result.html`报表文件。


`/test/*/src`

各语言版本的TestRunner源码；TestRunner运行时不需要输入参数，直接读取case文件并输出到各自`output`目录。


`/test/*/run.sh`

各语言版本的测试运行脚本。


`/test/*/output/*.html`

各语言版本的TestRunner的输出，每个输出文件对应一个case。
