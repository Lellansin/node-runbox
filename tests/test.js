const runbox = require('..');

let box = runbox.setup(2);

let code = `
  function test (a, b) {
    while(true);
    return a * 2 + b;
  }
`;

let code2 = `
  function test (a, b) {
    return a + b;
  }
`;

(async function main() {
  for (var i = 0; i < 10000; i++) {
    if (i == 5000) {
      try {
        let res = await box.run(code, 'test', [1,2]);
        console.log('endless loop', res);
      } catch(err) {
        console.log('endless loop', err.stack);
      }
    }

    console.time('cost');
    let res = await box.run(code2, 'test', [i, 1]);
    console.timeEnd('cost');
  }

  console.log('over');
  process.exit();
})();
