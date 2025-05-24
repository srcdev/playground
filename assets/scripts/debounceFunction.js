// Function that takes a function and a delay as arguments
export function debounceFunction(func, delay) {
  let timeoutId;

  // Return a new function that will be debounced
  return function (...args) {
    // Clear the previous timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout to call the original function after the specified delay
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
// Usage example:
// const debouncedFunction = debounceFunction(() => {
//   console.log('Function executed after delay');
// }, 1000);
//
// window.addEventListener('resize', debouncedFunction);
// This will ensure that the function is not called too frequently during resize events.
// The function will only execute after the specified delay (1000ms in this case) has passed since the last call.
// This is useful for performance optimization, especially in scenarios like window resizing or input events.
//
// The debounced function can be used in various scenarios where you want to limit the rate of function execution.
// For example, you can use it to handle window resize events, input field changes, or any other event that might trigger a function call frequently.
//
// The `debounceFunction` utility helps in preventing performance issues by ensuring that the function is not called too often,
// which can lead to unnecessary computations or UI updates. It allows you to control the execution flow of functions in a more efficient manner.
//
// The `debounceFunction` utility is a simple yet effective way to limit the rate at which a function can be executed.
// It can be particularly useful in scenarios where you want to avoid excessive function calls, such as during window resizing,
// input field changes, or any other event that might trigger a function call frequently.
// The function takes two parameters: `func`, which is the function to be debounced, and `delay`, which is the time in milliseconds to wait before executing the function.
