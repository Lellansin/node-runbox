'use strict';

const os = require('os');
const path = require('path');
const {fork} = require('child_process');

const workers = {};
const times = [];
const cbs = {};

let id = 0;

exports.setup = (pnum = os.cpus().length, opts = {}) => {
  for (let i = 0; i < pnum; i++) {
    workers[i] = createWorker();
    setImmediate(() => times[i] = { time: 0 });
  }
  return {
    run : async (code, call, args) => {
      let n = await getMin(pnum);
      return new Promise((resolve, reject) => {
        let child = workers[n];
        child.send({ id, code, call, args });

        let flag = true;
        let count = id++;
        let timer = setTimeout(() => {
          if (flag) {
            delete cbs[count];
            child.kill();
            workers[n] = createWorker();
            setTimeout(() => { times[n] = 0; }, 0);
            reject(new Error(`Timeout: ${code} \ncall: [${call}] \nargs: [${args}]`))
          }
        }, opts.timeout || 500);

        let start = Date.now();
        times[n] = null;
        cbs[count] = (data) => {
          flag = false;
          clearTimeout(timer);
          times[n] = Date.now() - start;
          delete data.count;
          delete cbs[count];
          resolve(data);
        };
      });
    }
  };
};

async function getMin(pnum) {
  while(true) {
    let index = null;
    let r = random(0, pnum);
    if (times[r] != null) {
      return r;
    }
    await sleep(1);
  }
}

function sleep(sec) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), sec || 0);
  });
}

function createWorker() {
  let child = fork(path.join(__dirname, './worker'));
  child.on('message', (data) => {
    cbs[data.id](data);
  });
  return child;
}

function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min));
};
