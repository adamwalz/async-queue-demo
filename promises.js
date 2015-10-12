var maxConcurrent = 1;

var pendingTasks = 0;

var tasks = []; // queue

function doAsap(operation) {
  return new Promise(function(resolve, reject) {
    tasks.push({
      operation: operation,
      resolve: resolve,
      reject: reject
    });
    dequeue();
  });
}

function doLater(operation) {
  return new Promise(function(resolve, reject) {
    tasks.unshift({
      operation: operation,
      resolve: resolve,
      reject: reject
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
  new Promise(function(resolve) {
    setTimeout(function() {
      resolve(task.operation());
    }, 2000);
  })
    .then(function(operationNumber) {
      task.resolve(operationNumber);
      pendingTasks -= 1;
      dequeue();
    })
    .catch(function(err) {
      task.reject(err);
      pendingTasks -= 1;
      dequeue();
    });
}

doLater(function() {
  console.log('This is operation 1. Do it later');
  return 1;
}).then(onOperationCompleted, onOperationError);

doLater(function() {
  console.log('This is operation 2. Do it later');
  return 2;
}).then(onOperationCompleted, onOperationError);

doAsap(function() {
  console.log('This is operation 3. Do it asap');
  return 3;
}).then(onOperationCompleted, onOperationError);

doLater(function() {
  console.log('This is operation 4. Do it later');
  return 4;
}).then(onOperationCompleted, onOperationError);

doAsap(function() {
  console.log('This is operation 5. Do it asap');
  return 5;
}).then(onOperationCompleted, onOperationError);

doAsap(function() {
  console.log('This is operation 6. Do it asap');
  return 6;
}).then(onOperationCompleted, onOperationError);

setTimeout(function() {
  doAsap(function() {
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
