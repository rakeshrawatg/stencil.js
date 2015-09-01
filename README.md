# Stencil.js
Stencil.js is a javascript templating engine to generate HTML output by compiling template with json.

# Usage
Following are few usage of Stencil. 

## Value Replace
```
Code:
Stencil.render('<div>{{foo}}</div>', {
  foo: 'bar'
});

Output:
<div>bar</div>
```

## Condition
```
Code:
Stencil.render('{{#foo}}<div>{{foo}}</div>{{/foo}}', {
  foo: 'bar'
});

Output:
<div>bar</div>
```

## Negation
```
Code:
Stencil.render('{{^bar}}<div>{{foo}}</div>{{/bar}}', {
  foo: 'bar'
});

Output:
<div>bar</div>
```

## Array
```
Code:
Stencil.render('{{#items.length}}<ul>{{#items}}<li>{{.}}</>{{/items}}{{/ul}}{{/items.length}}', {
  items: ['foo', 'bar', 'baz']
});

Output:
<ul>
  <li>foo</li>
  <li>bar</li>
  <li>baz</li>
</ul>
```

## Object
```
Code:
Stencil.render('{{#user}}<p>Name: {{name}}</p><p>Value: {{value}}</p>{{/user}}', {
user: {
  name: 'foo', 
  value: 'bar'
}
});

Output:
<p>Name: foo</p>
<p>Value: bar</p>
```
