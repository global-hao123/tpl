# 大家好, my name is 还没想好!

我是一个基于语法分析的模板引擎, 可以用在基于 `tag` 的任意模板处理。

## Ideas

- 为前端开发者设计，基于 JavaScript 引擎，完全忠于 JavaScript 语法，无学习成本
- 适用于浏览器 / node 环境（预编译）
- 基于原创的 AST tag 分析引擎，保证复杂结构下的解析健壮可靠，同时此引擎可以用于很多类似语法分析，比如 markdown
- 功能完整强大，能适用各种复杂业务逻辑
- 自定义扩展非常简单，内置最常用的区块语法和过滤器，其他都将以插件产出，保证核心文件在 4k 左右(gzip 压缩后控制在 2K 内)
- 编译速度会在保证健壮性和语法友好的同时持续优化，目前相比其他简单的模板引擎可能落后几毫秒（当前页的编译时间在 chrome 下为 14ms）

## Feature

- Node(Express, Koa...) / Browsers(All) Support
- Javascript Syntax Expression Support
- Variable Filters Support
- Escapes Output
- Built-in Iteration
- Built-in if/else/else if(TODO) Conditionals
- Extendable Tags, Logic, and/or Filters
- Partials / Includes(TODO)

## Roadmap

- {{else if}} Conditionals supports
- Extends / Block Template Inheritance
- (for 区块内实现 break coutiue?)
- (自定义变量有没有必要？)
- debug 模式，详细定位出错的具体 token 位置 行号等，同时产出可视化 debug 工具
- 优化编译过程, 运算部分交给 web worker
- Available via npm
- 生态系统完善 sublime 语法插件，snippets / 文档, cheat sheets 等
- 严格单元测试和基准测试

===========跳过废话，直接看实时 [DEMO](http://view.gitlab.pro/common-ui/tpl) 边看边试，了解语法========

## GET START

### Template Source

- from String

- from HTML

```html
&lt;textarea&gt;
&lt;!doctype html&gt;
&lt;html&gt;
    &lt;body&gt;
        &lt;h1&gt;{{name}}&lt;/h1&gt;
    &lt;/body&gt;
&lt;/html&gt;
&lt;/textarea&gt;
```

or

```html
&lt;script type="text/template"&gt;
&lt;h1&gt;{{title}}&lt;/h1&gt;
&lt;p&gt;I am {{name}}...&lt;/p&gt;
&lt;/script&gt;
```

- from javascript

```javascript
var tpl = function(){/*!@preserve
<!doctype html>
<html>
   <body>
       <h1>{{name}}</h1>
   </body>
</html>
*/0}
```

### Data Source

- form String(JSON)
- from javascript Object

### INIT

```javascript
wrap.innerHTML = tpl(tpl, data, options);
```

### OPTIONS

```javascript
{
    // begin delimiter
    delimiterBegin: "{{"

    // end delimiter
    , delimiterEnd: "}}"

    // remove line breaks
    , removeLineBreaks: false
}
```

### API

- tpl.util
  * noop
  * toBool
  * type
  * each
  * extend
  * arrTobj
  * keys
  * tap
  * replace
  * fetchTpl
  * parseData
  * filter
  * exec

--------------

## Expressions

### Delimiter

- Default

```
{{ "\{\{ expressions \}\}" }}
```

- Custom

```javascript
tpl(tpl, data, {

    // begin delimiter
    delimiterBegin: "<{",

    // end delimiter
    delimiterEnd: "}>"
});
```

#### Variable

```
{{hi}} *Render the value of data["hi"]*

{{  hi
}} *Exception error handling*

{{about.name}} *Supports `.` to assign the path of Object*

{{about.coutry[1]}} *Supports `[Number]` to assign the index of Array*

{{num[1].big}} *Supports too*

{{hi.length}} *Supports get the length of String*
```

#### Operators(Fully supports JavaScript)

- Basic operators

```
{{"prefix " + hi + about.name + " suffix"}} *String concatenation*

{{hi + 1 + 1}} *Equivalent to `"hi" + 1 + 1`*

{{hi + (1 + 1)}} *Equivalent to `"hi" + (1 + 1)`*

{{hi + (1 + 1) / 2 % 1}} *same as JavaScript*
```

- Logical operators(Fully supports JavaScript)

```
{{xxx || "default"}} *The way to set default value*

{{false || "default"}} *Notice that the `false` is Boolean type*

{{"false" || "default"}} *The `"false"` is String type*

{{"" || null || 0 || false || undefined || "default"}} *All are false*

{{hi && "isset"}} *Also supports true determination*

{{!!hi}} *use `!` or `!!` to converting data types*
```

- Dualistic operators(Fully supports JavaScript)

```
{{hi ? "true" : "false"}} *Same as Javascript*

{{hi ? !!hi ? "false" : "true" : "false"}} *Same as Javascript*
```

#### Escape

- HTML escape

```
{{ "&lt;br&gt;" }} *Html default escape*

{{ "&lt;br&gt;" | unescape}} *Forced not escape*

{{ "\{\{\}\}" }} *use `\` for delimiter escape*
```

- Delimiter escape

```
{{ "\{\{\}\}" }} *use `\` for delimiter escape*
```

#### Filters pipe

- Built-in filters: `trim` `escape` `regescape` `unwrap` `decodeURIComponent` `encodeURIComponent` `decodeURI` `encodeURI` and all of the String.prototype(like `slice`, `charAt`, `toUpperCase`)

```
{{hi + "&lt;br&gt;" | unescape}} *Forced not escape(Html default escape)*

{{"  " + hi + "  " | trim}} *trim*

{{hi | slice(0, 1)}} *Native slice*

{{"http://www.gitlab.pro" | encodeURIComponent}} *Native decodeURIComponent*

{{about.coutry[0] | slice(0, 3) | toUpperCase}} *Native slice*
```

- Extend global filters

```javascript
tpl.filter["myGlobalFilter"] = function(str) {
    return str + "suffix";
}
```

- Extend private filters

```javascript
tpl(tpl, data, {
    , filter: {
        "myPrivateFilter": function() {
            return str + "suffix";
        }
    }
});
```

## Block

- Built-in helper: `if` `for` `with` `NULL` `ROUTE`

### Delimiter

- Default

```
{{ "\{\{#name expression\}\}\{\{/name\}\}" }}
```

- Extend global helper

```javascript
tpl.helper["myGlobalHelper"] = function(ast, data, tpl) {
    return tpl;
}

// {{ "\{\{#myGlobalHelper expression\}\}\{\{/name\}\}" }}
```

- Extend private filters

```javascript
tpl("// {{ "\{\{#myPrivateHelper expression\}\}\{\{/name\}\}" }}", data, {
    , filter: {
        "myPrivateHelper": function(ast, data, tpl) {
            return tpl;
        }
    }
});
```

#### if

```
*basic usage*
{{#if hi}}
{{hi}}
{{/if}}

*with `else`*
{{#if true}}
{{"true"}}
{{else}}
{{"false"}}
{{/if}}

*supports expressions*
{{#if 2>1}}
{{"true"}}
{{else}}
{{"false"}}
{{/if}}

*Notice: `hi.length` is a string "3", So, you need `+hi.length === 3` or `hi.length == 3`*
{{#if +hi.length === 3}}
{{"true"}}
{{else}}
{{"false"}}
{{/if}}

*Notice: "false" is Equivalent to `false` here, diffenrent to {{ "\{\{\"false\"\}\}" | unescape}}*
{{#if 0 || "0" || null || undefined || true || false || NaN || "false"}}
{{"true"}}
{{else}}
{{"false"}}
{{/if}}
```

#### with

```
*Basic usage*
{{#with about}}
    {{name}}
{{/with}}

*More complex nested*
{{#with about}}
    {{#with coutry}}
        {{#if [1] === "Amrican"}}
            {{[1]}}
        {{/if}}
    {{/with}}
{{/with}}
```

#### for

```
*Basic usage*
*Notice: Avoid key conflicts, Recommended to use `$`*
{{#for $item in about}}
    {{$item}}
{{/for}}

*Built-in items: @key @index @first @last @length @total*
{{#for $item in about}}
    key: {{@key}}
    value: {{$item}}
    index: {{@index}}
    first: {{@first}}
    last: {{@last}}
    length: {{@length}}
{{/for}}

*More complex nested*
{{#for $li in children}}
    {{#for $item in $li.list}}
        {{#if @index == 0}}
            first: {{$item}} | {{@index}}
        {{else}}
            {{#if @index == 1}}
                second: {{$item}} | {{@index}}
            {{else}}
                {{@index == 2 ? $item : "empty" | toUpperCase}}
            {{/if}}
        {{/if}}
    {{/for}}
{{/for}}
```

## comments

### Delimiter

- Default

```
{{ "\{\{**\}\}" }}
```

```
{{* inline comments *}} *inline comments*

*multi-line comments*
{{* 
multi-line
comments
*}}
```