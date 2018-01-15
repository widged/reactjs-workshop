## Redux : Middleware

Reducer functions are only concerned with executing logic using action data. They typically don’t care who did it, how long it took, or logging the before and after effects of the state changes. 

Middleware is some code you can put between the framework receiving a request, and the framework generating a response.

A middleware provides a third-party extension pointfor use cases such as logging, crash reporting, talking to an asynchronous API (promises), Observables, routing, immutability dev checks, persistence, and more.  

In the redux ecosystem, Middleware help us to address these non-core concerns. It provides the ability to run code between dispatching an action, and the moment it reaches the reducer // create functions that can be composed together before the main dispatch method is invoked. 

Redux middleware functions have this signature:

```
middleware:: next -> action -> retVal
```

- First it captures the previous state
- The action is dispatched to the next middleware function
All downstream middleware functions in the chain are invoked
- The reducer functions in the store are called with the action payload
- The logger middleware then gets the resulting next state




# Middleware as extension point

Middleware is created by composing functionality that wraps separate cross-cutting concerns which are not part of your main execution task.

Any specificy middleware is typically kept short. Most of the middleware you’ll find are, in fact, 10-liners. The nesting and composability is what makes the middleware system powerful.


## Implementation

```
export default function applyMiddleware(...middlewares) {
  return (next) =>
    (reducer, initialState) => {
      var store = next(reducer, initialState);
      var dispatch = store.dispatch;
      var chain = [];
      var middlewareAPI = {
        getState: store.getState,
        dispatch: (action) => dispatch(action)
      };
      chain = middlewares.map(middleware =>
                    middleware(middlewareAPI));
      dispatch = compose(...chain, store.dispatch);
      return {
        ...store,
        dispatch
      };
   };
}
```

## Example

Very simple logger middleware function that can echo the state of your application before and after running your main dispatch function. 

```
export default function createLogger({ getState }) {
  return (next) =>
    (action) => {
      const console = window.console;
      const prevState = getState();
      const returnValue = next(action);
      const nextState = getState();
      const actionType = String(action.type);
      const message = `action ${actionType}`;
      console.log(`%c prev state`, `color: #9E9E9E`, prevState);
      console.log(`%c action`, `color: #03A9F4`, action);
      console.log(`%c next state`, `color: #4CAF50`, nextState);
      return returnValue;
    };
}
```


Notice that createLogger accepts the getState method which is injected by applyMiddleware.js and used inside the inner closure to read the current state. This will return a new function with the next parameter which is used to compose the next chained middleware function or the main dispatch function. This function returns a curried function that accepts the action object which can be read or modified before sending it to the next middleware function in the chain. Finally, the main dispatch function is invoked with the action object.

// -----

 ```
 const logger = store => next => action => {
   console.log('dispatching', action)
   let result = next(action)
   console.log('next state', store.getState())
   return result
 }

 const crashReporter = store => next => action => {
   try {
     return next(action)
   } catch (err) {
     console.error('Caught an exception!', err)
     Raven.captureException(err, {
       extra: {
         action,
         state: store.getState()
       }
     })
     throw err
   }
 }
 ```

 Here's how to apply it to a Redux store:

 ```
 import { createStore, combineReducers, applyMiddleware } from 'redux'

 let todoApp = combineReducers(reducers)
 let store = createStore(
   todoApp,
   // applyMiddleware() tells createStore() how to handle middleware
   applyMiddleware(logger, crashReporter)
 )
 That's it! Now any actions dispatched to the store instance will flow through logger and crashReporter:

 // Will flow through both logger and crashReporter middleware!
 store.dispatch(addTodo('Use Redux'))
```

## Dissecting applyMiddleware.js

````
export default function applyMiddleware(...middlewares) {
  return (next) =>
    (reducer, initialState) => {
      var store = next(reducer, initialState);
      var dispatch = store.dispatch;
      var chain = [];
      var middlewareAPI = {
        getState: store.getState,
        dispatch: (action) => dispatch(action)
      };
      chain = middlewares.map(middleware =>
                       middleware(middlewareAPI));
      dispatch = compose(...chain, store.dispatch);
      return {
        ...store,
        dispatch
      };
   };
}
````

First we have the method signature:
`export default function applyMiddleware(...middlewares)`

The argument is `...middlewares`. The spread operator on it will allow us to pass in as many middleware functions that we want. We will return a function that takes a mysterious next argument:
`return (next) => (reducer, initialState) => {...}`
The next argument will be a function that is used to create a store. By default you should look at the implementation for createStore.js. The final returned function will be like createStore and replaces the dispatch function with it’s associated middleware.

Next we assign the store implementation to the function responsible for creating the new store (again see createStore.js). Then we create a variable to the store’s original dispatch function. Finally, we setup an array to hold the middleware chain we will be creating.

```
var store = next(reducer, initialState);
var dispatch = store.dispatch;
var chain = [];
```

This next bit of code injects the getState function and original dispatch function from the store into each middleware function which you can optionally use in your middleware. The resultant middleware is stored in the chain array:

```
var middlewareAPI = {
  getState: store.getState,
  dispatch: (action) => dispatch(action)
};
chain = middlewares.map(middleware =>
                    middleware(middlewareAPI));
```

Now we create our replacement dispatch function with the information about the middleware chain.
`dispatch = compose(...chain, store.dispatch);`
The magic to composing our middleware chain lies in this utility function supplied by Redux. Here is the implementation:

```
export default function compose(...funcs) {
 return funcs.reduceRight((composed, f) => f(composed));
}
```

The compose function will express your functions as a composition injecting each middleware as an argument to the next middleware in the chain. Order is important here when assembling your middleware functions. 

Finally, the original store dispatch method is composed. This new looks something like this:
`middlewareI(middlewareJ(middlewareK(store.dispatch)))(action)`

The final thing to do is return the new store object with the overridden dispatch function:

```
return {
 ...store,
 dispatch
};
```

There is that spread operator again. This spreads out the store object which includes the original dispatch function. Since we specify dispatch at the end it will be extended into the new store object which was the original intent. Here is what it looks like from Babel’s perspective:

```
return _extends({}, store, { dispatch: _dispatch });
```

Let’s add our logger middleware we started above into a custom store with the enhanced dispatch function. Here is how you could do this:
```
import { createStore, applyMiddleware } from ‘redux’;
import loggerMiddleware from ‘logger’;
import rootReducer from ‘../reducers’;
const createStoreWithMiddleware =
  applyMiddleware(loggerMiddleware)(createStore);
export default function configureStore(initialState) {
  return createStoreWithMiddleware(rootReducer, initialState);
}
const store = configureStore();
```


## Various Middleware

### Logging
```
 /**
  * Logs all actions and states after they are dispatched.
  */
 const logger = store => next => action => {
   console.group(action.type)
   console.info('dispatching', action)
   let result = next(action)
   console.log('next state', store.getState())
   console.groupEnd(action.type)
   return result
 }
```
 
### Crash report 

```
 /**
  * Sends crash reports as state is updated and listeners are notified.
  */
 const crashReporter = store => next => action => {
   try {
     return next(action)
   } catch (err) {
     console.error('Caught an exception!', err)
     Raven.captureException(err, {
       extra: {
         action,
         state: store.getState()
       }
     })
     throw err
   }
 }
 ```
  
 ### Async Scheduler

 ```
 /**
  * Schedules actions with { meta: { delay: N } } to be delayed by N milliseconds.
  * Makes `dispatch` return a function to cancel the timeout in this case.
  */
 const timeoutScheduler = store => next => action => {
   if (!action.meta || !action.meta.delay) {
     return next(action)
   }

   let timeoutId = setTimeout(
     () => next(action),
     action.meta.delay
   )

   return function cancel() {
     clearTimeout(timeoutId)
   }
 }

 /**
  * Schedules actions with { meta: { raf: true } } to be dispatched inside a rAF loop
  * frame.  Makes `dispatch` return a function to remove the action from the queue in
  * this case.
  */
 const rafScheduler = store => next => {
   let queuedActions = []
   let frame = null

   function loop() {
     frame = null
     try {
       if (queuedActions.length) {
         next(queuedActions.shift())
       }
     } finally {
       maybeRaf()
     }
   }

   function maybeRaf() {
     if (queuedActions.length && !frame) {
       frame = requestAnimationFrame(loop)
     }
   }

   return action => {
     if (!action.meta || !action.meta.raf) {
       return next(action)
     }

     queuedActions.push(action)
     maybeRaf()

     return function cancel() {
       queuedActions = queuedActions.filter(a => a !== action)
     }
   }
 }
 ```
  
 ### Async Promises

 ```
 /**
  * Lets you dispatch promises in addition to actions.
  * If the promise is resolved, its result will be dispatched as an action.
  * The promise is returned from `dispatch` so the caller may handle rejection.
  */
 const vanillaPromise = store => next => action => {
   if (typeof action.then !== 'function') {
     return next(action)
   }

   return Promise.resolve(action).then(store.dispatch)
 }

 /**
  * Lets you dispatch special actions with a { promise } field.
  *
  * This middleware will turn them into a single action at the beginning,
  * and a single success (or failure) action when the `promise` resolves.
  *
  * For convenience, `dispatch` will return the promise so the caller can wait.
  */
 const readyStatePromise = store => next => action => {
   if (!action.promise) {
     return next(action)
   }

   function makeAction(ready, data) {
     let newAction = Object.assign({}, action, { ready }, data)
     delete newAction.promise
     return newAction
   }

   next(makeAction(false))
   return action.promise.then(
     result => next(makeAction(true, { result })),
     error => next(makeAction(true, { error }))
   )
 }

 ```
  
// ---


https://github.com/pburtchaell/redux-promise-middleware



shared/lib/promiseMiddleware.js (modified from https://github.com/gaearon/redux/issues/99#issuecomment-112212639):
```
export default function promiseMiddleware() {
  return next => action => {
    const { promise, type, ...rest } = action;

    if (!promise) return next(action);

    const SUCCESS = type;
    const REQUEST = type + '_REQUEST';
    const FAILURE = type + '_FAILURE';
    next({ ...rest, type: REQUEST });
    return promise
      .then(res => {
        next({ ...rest, res, type: SUCCESS });

        return true;
      })
      .catch(error => {
        next({ ...rest, error, type: FAILURE });

        // Another benefit is being able to log all failures here
        console.log(error);
        return false;
      });
   };
}

...
import { applyMiddleware } from 'redux';
import promiseMiddleware   from 'lib/promiseMiddleware';
...
const store = applyMiddleware(promiseMiddleware)(createStore)(reducer);

...
import request from 'axios';
const BACKEND_URL = 'https://webtask.it.auth0.com/api/run/wt-milomord-gmail_com-0/redux-tutorial-backend?webtask_no_cache=1';
export function createTodo(text) {
  return {
    type: 'CREATE_TODO',
    promise: request.post(BACKEND_URL, { text })
  }
}

return state.concat(action.res.data.text);

...
export function getTodos() {
  return {
    type: 'GET_TODOS',
    promise: request.get(BACKEND_URL)
  }
}

...
case 'GET_TODOS':
  return state.concat(action.res.data);

...
componentDidMount() {
  this.props.getTodos();
}

```
  
 ### Dispatch function instead of action

 ```
 /**
  * Lets you dispatch a function instead of an action.
  * This function will receive `dispatch` and `getState` as arguments.
  *
  * Useful for early exits (conditions over `getState()`), as well
  * as for async control flow (it can `dispatch()` something else).
  *
  * `dispatch` will return the return value of the dispatched function.
  */
 const thunk = store => next => action =>
   typeof action === 'function' ?
     action(store.dispatch, store.getState) :
     next(action)


 // You can use all of them! (It doesn't mean you should.)
 let todoApp = combineReducers(reducers)
 let store = createStore(
   todoApp,
   applyMiddleware(
     rafScheduler,
     timeoutScheduler,
     thunk,
     vanillaPromise,
     readyStatePromise,
     logger,
     crashReporter
   )
 )
```

### createThunkMiddleware

```
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```


// -----

To get the boilerplate out of the way, let’s also quickly initialize the Redux store and hook up thunk middleware in index.js:

```
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import App from './App';
import './index.css';

import * as reducers from './store/reducers';
const store = createStore(combineReducers(reducers), applyMiddleware(thunk));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

