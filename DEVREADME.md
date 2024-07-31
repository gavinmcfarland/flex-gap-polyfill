# Developing

## Unit testing

To test the post-css plugin against a list of test cases, run:

```shell
npm run test
```

Manage the test cases by editing the `.tape.js` to include a new test case.

```js
module.exports = {
    // ...
    "name-of-your-test": {
        message: "describe what its testing",
    },
};
```

Then create two stylesheets with the same name inside `test`. For example:

```shell
test/
    name-of-your-test.css
    name-of-your-test.expect.css
```

`name-of-your-test.expect.css` should match what the expected result of the CSS is.

## Testing website

Note: `test` automatically rebuilds the docs page.

Using `serve` check the website examples still perform as they should.

```shell
serve docs/
```

## Publishing
