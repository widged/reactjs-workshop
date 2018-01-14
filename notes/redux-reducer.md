# Reducers

```
function todoApp(state = initialState, action) {
  // For now, don't handle any actions
  // and just return the state given to us.
  return state
}
```

When the store needs to know how an action changes the state, it asks the reducers. The root reducer takes charge and slices the state up based on the state object’s keys. It passes each slice of state to the reducer that knows how to handle it.

Immutable -> They don’t want to mess anything up, so they don’t change the state that has been passed in to them. Instead, they make a copy and make all their changes on the copy.

This is one of the key ideas of Redux. The state object isn’t manipulated directly. Instead, each slice is copied and then all of the slices are combined into a new state object.

The reducers pass their copies back to the root reducer, which pastes the copies together to form the updated state object. Then the root reducer sends the new state object back to the store, and the store makes it the new official state.

if you have a large application, you might have a whole tree of reducers.


NOTE. Services must be completely stateless.

-----
reducer composition. It's reducers all the way down, so you can write a reducer factory that generates pagination reducers and then use it in your reducer tree. The key to why it's so easy is because in Flux, stores are flat, but in Redux, reducers can be nested via functional composition, just like React components can be nested.

This pattern also enables wonderful features like no-user-code undo/redo. Can you imagine plugging Undo/Redo into a Flux app being two lines of code? Hardly. With Redux, it is—again, thanks to reducer composition pattern. I need to highlight there's nothing new about it—this is the pattern pioneered and described in detail in Elm Architecture which was itself influenced by Flux.

Server side rendering. Redux just goes further: since there is just a single store (managed by many reducers), you don't need any special API to manage the (re)hydration. You don't need to “flush” or “hydrate” stores—there's just a single store, and you can read its current state, or create a new store with a new state. Each request gets a separate store instance. Read more about server rendering with Redux.

Reloading reducers - I didn't actually intend Redux to become a popular Flux library—I wrote it as I was working on my ReactEurope talk on hot reloading with time travel. I had one main objective: make it possible to change reducer code on the fly or even “change the past” by crossing out actions, and see the state being recalculated.

I haven't seen a single Flux library that is able to do this. React Hot Loader also doesn't let you do this—in fact it breaks if you edit Flux stores because it doesn't know what to do with them.

When Redux needs to reload the reducer code, it calls replaceReducer(), and the app runs with the new code. In Flux, data and functions are entangled in Flux stores, so you can't “just replace the functions”. Moreover, you'd have to somehow re-register the new versions with the Dispatcher—something Redux doesn't even have.

### combineReducers

```
import { combineReducers } from 'redux'

const todoApp = combineReducers({
  visibilityFilter,
  todos
})

export default todoApp
```
Note that each of these reducers is managing its own part of the global state. The state parameter is different for every reducer, and corresponds to the part of the state it manages.
The above is equivalent to:

```
export default function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```

You could also give them different keys, or call functions differently. These two ways to write a combined reducer are equivalent:

```
const reducer = combineReducers({
  a: doSomethingWithA,
  b: processB,
  c: c
})
```
```
function reducer(state = {}, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
    c: c(state.c, action)
  }
}
```

like other reducers, combineReducers() does not create a new object if all of the reducers provided to it do not change state.

Note for ES6 Savvy Users

Because combineReducers expects an object, we can put all top-level reducers into a separate file, export each reducer function, and use import * as reducers to get them as an object with their names as the keys:

```
import { combineReducers } from 'redux'
import * as reducers from './reducers'

const todoApp = combineReducers(reducers)
```

Because import * is still new syntax, we don't use it anymore in the documentation to avoid confusion, but you may encounter it in some community examples.

### combineReducers

```
import { combineReducers } from 'redux'

const todoApp = combineReducers({
  visibilityFilter,
  todos
})

export default todoApp
```
Note that each of these reducers is managing its own part of the global state. The state parameter is different for every reducer, and corresponds to the part of the state it manages.
The above is equivalent to:

```
export default function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```

You could also give them different keys, or call functions differently. These two ways to write a combined reducer are equivalent:

```
const reducer = combineReducers({
  a: doSomethingWithA,
  b: processB,
  c: c
})
```
```
function reducer(state = {}, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
    c: c(state.c, action)
  }
}
```

like other reducers, combineReducers() does not create a new object if all of the reducers provided to it do not change state.

Note for ES6 Savvy Users

Because combineReducers expects an object, we can put all top-level reducers into a separate file, export each reducer function, and use import * as reducers to get them as an object with their names as the keys:

```
import { combineReducers } from 'redux'
import * as reducers from './reducers'

const todoApp = combineReducers(reducers)
```

Because import * is still new syntax, we don't use it anymore in the documentation to avoid confusion, but you may encounter it in some community examples.



# Store

The Redux store is just a plain object with a few methods.

http://redux.js.org/docs/api/Store.html

In Redux, all the application state is stored as a single object. It's a good idea to think of its shape before writing any code. What's the minimal representation of your app's state as an object?

The Store is the object that brings them together. The store has the following responsibilities:

* Holds application state;
* Allows access to state via getState();
* Allows state to be updated via dispatch(action);
* Registers listeners via subscribe(listener);
* Handles unregistering of listeners via the function returned by subscribe(listener).

It's important to note that you'll only have a single store in a Redux application. When you want to split your data handling logic, you'll use reducer composition instead of many stores.

```
import { createStore } from 'redux'
import todoApp from './reducers'
let store = createStore(todoApp)
```
You may optionally specify the initial state as the second argument to createStore(). This is useful for hydrating the state of the client to match the state of a Redux application running on the server.

```
let store = createStore(todoApp, window.STATE_FROM_SERVER)
```

### Update logic

```
import { addTodo, toggleTodo, setVisibilityFilter, VisibilityFilters } from './actions'

// Log the initial state
console.log(store.getState())

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)

// Dispatch some actions
store.dispatch(addTodo('Learn about actions'))
store.dispatch(addTodo('Learn about reducers'))
store.dispatch(addTodo('Learn about store'))
store.dispatch(toggleTodo(0))
store.dispatch(toggleTodo(1))
store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED))

// Stop listening to state updates
unsubscribe()
```

# Reducer

```
function todoApp(state = initialState, action) {
  // For now, don't handle any actions
  // and just return the state given to us.
  return state
}
```

# strict unidirectional data flow.


Redux architecture revolves around a strict unidirectional data flow.

Enter Redux’s Container
------------------------

There needs to be glue that connects the Redux data flow with the React components. The container is meant to be the file that holds all the data and functions required to connect store state and action creators actions to React component props. It is in this file where your action creators are imported, the Redux ‘connect’ function is imported, the parent React component is imported, and any other methods/data are imported (i.e routing and initial server loading).

```
import {connect} from 'react-redux';
import Template from '../components/Template.js'
import {increment, decrement} from '../actions/sidebar.js';
import {isBrowser} from '../env.js';
```

Now the connect function. The documentation for connect within Redux is difficult to understand, which creates a sense of mystery. Simply think of this as a component that takes props as parameters, which in return supplies actions and state to the provided React component via props… Confused yet? Well let’s break this down some more.

connect() is a function provided by react-redux. If a component wants to get state updates, it wraps itself using connect(). Then the connect function will set up all the wiring for it to the redux store.

The following shows the connect function breakdown:

```
connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(component);
```

Connect returns a function that accepts a react component. It has 4 arguments.

* mapStateToProps - function, mandatory
* mapDispatchToProps - function or object, mandotory
* mergeProps — function, optional
* options — object, optional

When applied to a component, it returns a component connected to the store that renders the specified component.


## mapStateToProps

The function `mapStateToProps` connects state from the store to corresponding props. This make it possible to access your reducer state objects from within your React components.
As connect subscribes to the store automatically, a new render of the connected component triggered anytime a change of state triggers a change of value for any of the properties passed to the component.

`mapStateToProps` returns an object, where keys are the prop names passed to the connected component and the value a reducer function.

```
const mapStateToProps = ({ reducer1, reducer2}) => ({reducer1, reducer2 });
```

## mapDispatchToProps

`mapDispatchToProps` can ether be a function or an object.

As the only way to change the application state is by dispatching an action, this allows to create named function for handling dispatch calls (i.e.: action creator).

When the name funtion is called with arguments, the associated named function will be called with the current getState() result and the given action synchronously. Its return value will be considered the next state.

```
import {actionCreator1, actionCreator2} from '../actions/main.js';

const bindActionsToDispatch = (dispatch) => ({
    actionCreator1 : () => {dispatch(actionCreator1())},
    actionCreator2 : (e) => {dispatch(actionCreator2(e))}
});
```

### bindActionCreators

`mapDispatchToProps` is not the only way of bind dispatch and action creators, there is another way called `bindActionCreators`.

```
import { bindActionCreators } from 'redux';
import * as TodoActionCreators from './TodoActionCreators';

let boundActionCreators = bindActionCreators(TodoActionCreators, dispatch)
```

The only use case for bindActionCreators is when you want to pass some action creators down to a component that isn't aware of Redux, and you don't want to pass dispatch or the Redux store to it.

## mergeProps

`mergeProps` is an optional parameter and is a function. The documentation on this particular function does not explain much as to it’s purpose and use cases. Hence adding to the mystery of the connect function.

If it is used, this function is passed the result of `mapStateToProps`(), `mapDispatchToProps`(), and the parent props. With this data available, it is easy to use props inherited from connect’s parent and combine them with an action creator. For example, if you are working with React Router, the variables assigned in the route path are passed as props to the connect function, if it is the connect function’s parent. You could then use those props and pass it along to your action creators to update your store with the needed URL parameters.

```
const mergeProps = (state, actions, {notebook, note}) => ({
    ...state,
    ...actions,
    onLoad: notebook && note
      ? () => {
        return Promise.all([
          actions.initActiveNotebookAndNote({notebook, note})
        ])
      }
      : actions.onLoad
})
```

The above code is receiving state from mapStateToProps, actions from mapDispatchToProps, and is creating a new prop called ‘onLoad’. This prop ‘onLoad’ is combining or ‘merging’ (as it’s name states) props from it’s parent component (React Router) and an action creator together. That action creator can be used to update data within a Reducer:

```
export const initActiveNotebookAndNote = ({notebook, note}) => ({
 type: SET_CURRENT_NOTE,
 notebook,
 note
});
```

## options

The options parameter is an object. It is used to customize the behavior of the connect function. The acceptable ‘options’ are the following:

* pure- Boolean, if true connect() will avoid re-rendering (will not update)
* areStatesEqual- Compares new store state vs. old*
* areOwnPropsEqual- Compares new props vs. old*
* areStatePropsEqual- Compares new mapStateToProps vs. old*
* areMergedPropsEqual- Compares new mergeProps vs. old*

(*Only when pure functions)

These options are not commonly used and are best explained by Redux:

You may wish to override `areStatesEqual` if your `mapStateToProps` function is computationally expensive and is also only concerned with a small slice of your state. For example: areStatesEqual: (prev, next) => prev.entities.todos === next.entities.todos; this would effectively ignore state changes for everything but that slice of state.

You may wish to override `areStatesEqual` to always return false (areStatesEqual: () => false) if you have impure reducers that mutate your store state. (This would likely impact the other equality checks is well, depending on your mapStateToProps function.)

You may wish to override `areOwnPropsEqual` as a way to whitelist incoming props. You'd also have to implement mapStateToProps, mapDispatchToProps and mergeProps to also whitelist props. (It may be simpler to achieve this other ways, for example by using recompose's mapProps.)

You may wish to override `areStatePropsEqual` to use strictEqual if your mapStateToProps uses a memoized selector that will only return a new object if a relevant prop has changed. This would be a very slight performance improvement, since would avoid extra equality checks on individual props each time mapStateToProps is called.

You may wish to override `areMergedPropsEqual` to implement a deepEqual if your selectors produce complex props. ex: nested objects, new arrays, etc. (The deep equal check should be faster than just re-rendering.)

# Reducers

When the store needs to know how an action changes the state, it asks the reducers. The root reducer takes charge and slices the state up based on the state object’s keys. It passes each slice of state to the reducer that knows how to handle it.

Immutable -> They don’t want to mess anything up, so they don’t change the state that has been passed in to them. Instead, they make a copy and make all their changes on the copy.

This is one of the key ideas of Redux. The state object isn’t manipulated directly. Instead, each slice is copied and then all of the slices are combined into a new state object.

The reducers pass their copies back to the root reducer, which pastes the copies together to form the updated state object. Then the root reducer sends the new state object back to the store, and the store makes it the new official state.

if you have a large application, you might have a whole tree of reducers.

-----
reducer composition. It's reducers all the way down, so you can write a reducer factory that generates pagination reducers and then use it in your reducer tree. The key to why it's so easy is because in Flux, stores are flat, but in Redux, reducers can be nested via functional composition, just like React components can be nested.

This pattern also enables wonderful features like no-user-code undo/redo. Can you imagine plugging Undo/Redo into a Flux app being two lines of code? Hardly. With Redux, it is—again, thanks to reducer composition pattern. I need to highlight there's nothing new about it—this is the pattern pioneered and described in detail in Elm Architecture which was itself influenced by Flux.

Server side rendering. Redux just goes further: since there is just a single store (managed by many reducers), you don't need any special API to manage the (re)hydration. You don't need to “flush” or “hydrate” stores—there's just a single store, and you can read its current state, or create a new store with a new state. Each request gets a separate store instance. Read more about server rendering with Redux.

Reloading reducers - I didn't actually intend Redux to become a popular Flux library—I wrote it as I was working on my ReactEurope talk on hot reloading with time travel. I had one main objective: make it possible to change reducer code on the fly or even “change the past” by crossing out actions, and see the state being recalculated.

I haven't seen a single Flux library that is able to do this. React Hot Loader also doesn't let you do this—in fact it breaks if you edit Flux stores because it doesn't know what to do with them.

When Redux needs to reload the reducer code, it calls replaceReducer(), and the app runs with the new code. In Flux, data and functions are entangled in Flux stores, so you can't “just replace the functions”. Moreover, you'd have to somehow re-register the new versions with the Dispatcher—something Redux doesn't even have.

# Middleware as extension point

Redux has a rich and fast-growing ecosystem. This is because it provides a few extension points such as middleware. It was designed with use cases such as logging, support for Promises, Observables, routing, immutability dev checks, persistence, etc, in mind. Not all of these will turn out to be useful, but it's nice to have access to a set of tools that can be easily combined to work together.

 Middleware is some code you can put between the framework receiving a request, and the framework generating a response.

 It provides a third-party extension point between dispatching an action, and the moment it reaches the reducer. People use Redux middleware for logging, crash reporting, talking to an asynchronous API, routing, and more.

Example

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

### Seven Examples

If your head boiled from reading the above section, imagine what it was like to write it. This section is meant to be a relaxation for you and me, and will help get your gears turning.

Each function below is a valid Redux middleware. They are not equally useful, but at least they are equally fun.

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

# Conclusion

Here is a final example that shows the connect function :

```
import {connect} from 'react-redux';
import Template from '../components/Template.js';
import {actionCreator1, actionCreator2} from '../actions/main.js';

const mapStateToProps = ({ reducer1, reducer2}) => ({reducer1, reducer2 });

const bindActionsToDispatch = dispatch => ({
    actionCreator1 : () => {dispatch(actionCreator1())},
    actionCreator2 : (e) => {dispatch(actionCreator2(e))}
});

const mergeProps = (state, actions, {notebook, note}) => ({
    ...state,
    ...actions,
    onLoad: notebook && note
      ? () => {
        return (
          actions.initActiveNotebookAndNote({notebook, note})
        )
      }
      : null
});

connect(mapStateToProps, mapDispatchToProps, mergeProps, { withRef: true })(Template);
```


---------

http://redux.js.org/docs/recipes/ComputingDerivedData.html

Reselect is a simple library for creating memoized, composable selector functions. Reselect selectors can be used to efficiently compute derived data from the Redux store.

We would like to replace getVisibleTodos with a memoized selector that recalculates todos when the value of state.todos or state.visibilityFilter changes, but not when changes occur in other (unrelated) parts of the state tree.

```
selectors/index.js

import { createSelector } from 'reselect'

const getVisibilityFilter = (state) => state.visibilityFilter
const getTodos = (state) => state.todos

export const getVisibleTodos = createSelector(
  [ getVisibilityFilter, getTodos ],
  (visibilityFilter, todos) => {
    switch (visibilityFilter) {
      case 'SHOW_ALL':
        return todos
      case 'SHOW_COMPLETED':
        return todos.filter(t => t.completed)
      case 'SHOW_ACTIVE':
        return todos.filter(t => !t.completed)
    }
  }
)
```

### Why should the reducer be a “pure” function that returns a new value of the state if altered

Redux takes a given state (object) and passes it to each reducer in a loop. And it expects a brand new object from the reducer if there are any changes. And it also expects to get the old object back if there are no changes.

Redux simply checks whether the old object is the same as the new object by comparing the memory locations of the two objects. So if you mutate the old object’s property inside a reducer, the “new state” and the “old state” will both point to the same object. Hence Redux thinks nothing has changed! So this won’t work.

The alternative would be to deep-compare the new state and the old state. This is a very expensive operation.


### Conventions

If the reducer receives undefined as the state argument it must returns what it considers to be the initial state of the application.


----

Selectors are one of the most important constructs in Redux that people tend to overlook. A selector is a pure function that takes the global state as argument and returns some transformation over it. Selectors are tightly coupled to reducers and are located inside reducer.js. They allow us to perform a few calculations on data before it’s being consumed by the view. In our methodology, we take this idea even further. Every time anyone needs to access part of the state (like in mapStatetoProps), they need to go through a selector.

Why? The idea is to encapsulate the internal structure of the app state and hide it from views. Imagine that we decide later on to change the internal state structure. We wouldn’t want to go over all the views in our app and refactor them. Passing through a selector will allow us to confine the refactoring to the reducer only.


## Extras

Just as a database view can be materialized by creating an index on it, we have a (somewhat) similar way to avoid recomputing function calls in JavaScript: memoization. Since our selector here is just a regular function, we can memoize it as we can any other function. Of course we don’t want to manually do this; fortunately there’s a library we can use to do it for us: reselect.
