'use strict';

var queue = (function() {
  const MAX_CONCURRENT = 1;

  var pendingTasks = 0;

  var tasks = []; // queue

  function doAsap(operation) {
    return new Promise(function(resolve, reject) {
      tasks.push({ operation, resolve, reject });
      dequeue();
    });
  }

  function doLater(operation) {
    return new Promise(function(resolve, reject) {
      tasks.unshift({ operation, resolve, reject });
      dequeue();
    });
  }

  function dequeue() {
    if (pendingTasks >= MAX_CONCURRENT) {
      return;
    }

    let task = tasks.pop();
    if (!task) {
      return;
    }

    pendingTasks += 1;
    new Promise(function(resolve) {
      setTimeout(function() {
        resolve(task.operation());
        pendingTasks -= 1;
        dequeue();
      }, 2000);
    })
    .then(operationNumber => task.resolve(operationNumber))
    .catch(err => task.reject(err));
  }

  return {
    doAsap,
    doLater
  };

})();

queue.doLater(function() {
  console.log('This is operation 1. Do it later');
  return 1;
}).then(onOperationCompleted, onOperationError);

queue.doLater(function() {
  console.log('This is operation 2. Do it later');
  return 2;
}).then(onOperationCompleted, onOperationError);

queue.doAsap(function() {
  console.log('This is operation 3. Do it asap');
  return 3;
}).then(onOperationCompleted, onOperationError);

queue.doLater(function() {
  console.log('This is operation 4. Do it later');
  return 4;
}).then(onOperationCompleted, onOperationError);

queue.doAsap(function() {
  console.log('This is operation 5. Do it asap');
  return 5;
}).then(onOperationCompleted, onOperationError);

queue.doAsap(function() {
  console.log('This is operation 6. Do it asap');
  return 6;
}).then(onOperationCompleted, onOperationError);

setTimeout(function() {
  queue.doAsap(function() {
    console.log('This is operation 7. Do it asap');
    return 7;
  }).then(onOperationCompleted, onOperationError);
}, 10000);

function onOperationCompleted(operationNumber) {
  console.log('Done with operation ' + operationNumber);
}

function onOperationError(err) {
  console.log('Error: ', err);
}
