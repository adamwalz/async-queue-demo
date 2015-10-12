var maxConcurrent = 1;

var tasks = [];
var pendingTasks = 0;

function doAsap(operation, callback) {
  tasks.push({
    operation: operation,
    callback: callback
  });
  dequeue();
}

function doLater(operation, callback) {
  tasks.unshift({
    operation: operation,
    callback: callback
  });
  dequeue();
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
  setTimeout(function() {
    task.operation(function(err, operationNumber) {
      pendingTasks -= 1;
      dequeue();
      task.callback(err, operationNumber);
    });
  }, 2000);
}

doLater(function(blackboxCallback) {
  console.log('This is operation 1. Do it later');
  blackboxCallback(null, 1)
}, operationCallback);

doLater(function(blackboxCallback) {
  console.log('This is operation 2. Do it later');
  blackboxCallback(null, 2)
}, operationCallback);

doAsap(function(blackboxCallback) {
  console.log('This is operation 3. Do it asap');
  blackboxCallback(null, 3)
}, operationCallback);

doLater(function(blackboxCallback) {
  console.log('This is operation 4. Do it later');
  blackboxCallback(null, 4)
}, operationCallback);

doAsap(function(blackboxCallback) {
  console.log('This is operation 5. Do it asap');
  blackboxCallback(null, 5)
}, operationCallback);

doAsap(function(blackboxCallback) {
  console.log('This is operation 6. Do it asap');
  blackboxCallback(null, 6)
}, operationCallback);

setTimeout(function() {
  doAsap(function(blackboxCallback) {
    console.log('This is operation 7. Do it asap');
    blackboxCallback(null, 7)
  }, operationCallback);
}, 10000);

function operationCallback(err, operationNumber) {
  if (err) {
    console.log('Error: ', err);
  } else {
    console.log('Done with operation ' + operationNumber);
  }
}
