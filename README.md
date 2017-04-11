# node-runbox

Use for runing code to avoid block condition in child processes.

```
const runbox = require('runbox');

const box = runbox.setup(2); // 2 processes to run code

(async function () {
  let code = `
    function test (a, b) {
      return a * 2 + b;
    }
  `;

  let res = await box.run(
  	code,
  	'test',  // call function
  	[1, 1]   // args
  );

  console.log('res', res); // 3
})();
```

if there is endless loop:

```
const runbox = require('runbox');

const box = runbox.setup(2); // 2 processes to run code

(async function () {
  let code = `
    function test (a, b) {
      while(true);
      return a * 2 + b;
    }
  `;

  try {
    let res = await box.run(code, 'test', [1, 2]);
    console.log('endless loop', res);
  } catch(err) {
    console.log('endless loop', err.stack); // Timeout error
  }
})();
```
