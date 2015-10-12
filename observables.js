var Observable = require('rx').Observable;

var maxConcurrent = 1;

var tasks = [];
var pendingTasks = 0;

function doAsap(operation) {
  return Observable.create(function(observer) {
    tasks.push({
      operation: operation,
      observer: observer
    });
    dequeue();
  });
}

function doLater(operation) {
  return Observable.create(function(observer) {
    tasks.unshift({
      operation: operation,
      observer: observer
    });
    dequeue();
  });
}

function dequeue() {
  if (pendingTasks >= maxConcurrent) {
    return;
  }

  var task = tasks.pop();
  if (!task) {
    return;
  }

  pendingTasks += 1;
  Observable.create(function(observer) {
    setTimeout(function() {
      observer.onNext(task.operation());
      observer.onCompleted();
    }, 2000);
  })
    .subscribe(
      function(operationNumber) {
        task.observer.onNext(operationNumber);
      },
      function(err) {
        task.observer.onError(err);
        pendingTasks -= 1;
        dequeue();
      },
      function() {
        task.observer.onCompleted();
        pendingTasks -= 1;
        dequeue();
      });
}

doLater(function() {
  console.log('This is operation 1. Do it later');
  return 1;
}).subscribe(onOperationCompleted, onOperationError);

doLater(function() {
  console.log('This is operation 2. Do it later');
  return 2;
}).subscribe(onOperationCompleted, onOperationError);

doAsap(function() {
  console.log('This is operation 3. Do it asap');
  return 3;
}).subscribe(onOperationCompleted, onOperationError);

doLater(function() {
  console.log('This is operation 4. Do it later');
  return 4;
}).subscribe(onOperationCompleted, onOperationError);

doAsap(function() {
  console.log('This is operation 5. Do it asap');
  return 5;
}).subscribe(onOperationCompleted, onOperationError);

doAsap(function() {
  console.log('This is operation 6. Do it asap');
  return 6;
}).subscribe(onOperationCompleted, onOperationError);

setTimeout(function() {
  doAsap(function() {
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
