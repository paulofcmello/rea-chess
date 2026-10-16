
  let promiseResolve;
  window.turnstileReady = new Promise(resolve => {
    promiseResolve = resolve;
  });
  window.onloadTurnstileCallback = function() {
    promiseResolve();
  };
