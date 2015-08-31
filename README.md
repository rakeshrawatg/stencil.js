# Stencil.js
Stencil.js is a javascript templating engine to generate HTML output by compiling template with json.

# Usage
Following are few usage of Stencil. 

## Value Replace
Stencil.render('<div>{{foo}}</div>', {foo: 'bar'});

## Condition
Stencil.render('{{#foo}}<div>{{foo}}</div>{{/foo}}', {foo: 'bar'});

## Negation
Stencil.render('{{^bar}}<div>{{foo}}</div>{{/bar}}', {foo: 'bar'});

## Array
Stencil.render('{{#items.length}}<ul>{{#items}}<li>{{.}}</>{{/items}}{{/ul}}{{/items.length}}', ['foo', 'bar', 'baz']);

## Object
Stencil.render('{{#user}}<p>Name: {{name}}</p><p>Value: {{value}}</p>{{/user}}', {name: 'foo', value: 'bar'});
