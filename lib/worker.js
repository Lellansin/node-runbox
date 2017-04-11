'use strict';

const vm = require('vm');

process.on('message', (data) => {
  const {id, code, call, args} = data;
  let context = new vm.createContext({
    require: requireSafe, 
    _CODE_END: end });
  let script = new vm.Script(`(function () {
  ${code};
  let res = ${call}(${args.join(',')});
  _CODE_END({ id:${id}, call: ${call}, res });
})();`);
  script.runInContext(context);
  context = null;
  script = null;
});

function requireSafe (module) {
  switch (module) {
    case 'child_process':
    case 'cluster':
    case 'vm':
    case 'v8':
      throw new Error(`${module} is forbidern`);
    default:
      return require(module);
  }
}

function end (obj) {
  process.send(obj);
}