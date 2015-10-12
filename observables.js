'use strict';

const Observable = require('rx').Observable;

var queue = (function() {
  const MAX_CONCURRENT = 1;

  var tasks = [];
  var pendingTasks = 0;

  function doAsap(operation) {
    return Observable.create(function(observer) {
      var task = { operation, observer };
      tasks.push(task);
      dequeue();
    });
  }

  function doLater(operation) {
    return Observable.create(function(observer) {
      var task = { operation, observer };
      tasks.unshift(task);
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
    Observable.create(function(observer) {
        setTimeout(function() {
          observer.onNext(task.operation());
          observer.onCompleted();
          pendingTasks -= 1;
          dequeue();
        }, 2000);
      })
      .subscribe(
        operationNumber =>task.observer.onNext(operationNumber),
        err => task.observer.onError(err),
        () => task.observer.onCompleted()
      );
  }

  return {
    doAsap,
    doLater
  };

})();

queue.doLater(function() {
  console.log('This is operation 1. Do it later');
  return 1;
}).subscribe(onOperationCompleted, onOperationError);

queue.doLater(function() {
  console.log('This is operation 2. Do it later');
  return 2;
}).subscribe(onOperationCompleted, onOperationError);

queue.doAsap(function() {
  console.log('This is operation 3. Do it asap');
  return 3;
}).subscribe(onOperationCompleted, onOperationError);

queue.doLater(function() {
  console.log('This is operation 4. Do it later');
  return 4;
}).subscribe(onOperationCompleted, onOperationError);

queue.doAsap(function() {
  console.log('This is operation 5. Do it asap');
  return 5;
}).subscribe(onOperationCompleted, onOperationError);

queue.doAsap(function() {
  console.log('This is operation 6. Do it asap');
  return 6;
}).subscribe(onOperationCompleted, onOperationError);

setTimeout(function() {
  queue.doAsap(function() {
    console.log('This is operation 7. Do it asap');
    return 7;
  }).subscribe(onOperationCompleted, onOperationError);
}, 10000);

function onOperationCompleted(operationNumber) {
  console.log('Done with operation ' + operationNumber);
}

function onOperationError(err) {
  console.log('Error: ', err);
}
