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

A store holds the whole state tree of your application.
The only way to change the state inside it is to dispatch an action on it.

A store is not a class. It's just an object with a few methods on it.
To create it, pass your root reducing function to createStore.

The “vanilla” store implementation you get by calling createStore only supports plain object actions and hands them immediately to the reducer.

However, if you wrap createStore with applyMiddleware, the middleware can interpret actions differently, and provide support for dispatching async actions. Async actions are usually asynchronous primitives like Promises, Observables, or thunks.

## Store methods

* getState()
* dispatch(action)
* subscribe(listener)
* replaceReducer(nextReducer)

Note “Reducers may not dispatch actions.”

### getState()

Returns the current state tree of your application.
It is equal to the last value returned by the store's reducer.

### dispatch(action)

Dispatches an action. This is the only way to trigger a state change.

The store's reducing function will be called with the current getState() result and the given action synchronously. Its return value will be considered the next state. It will be returned from getState() from now on, and the change listeners will immediately be notified.

Returns an object with the dispatched action.

```
import { createStore } from 'redux'
let store = createStore(todos, [ 'Use Redux' ])

function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}

store.dispatch(addTodo('Read the docs'))
store.dispatch(addTodo('Read about the middleware'))
```

### subscribe(listener)

Adds a change listener. It will be called any time an action is dispatched, and some part of the state tree may potentially have changed. You may then call getState() to read the current state tree inside the callback.

Returns a function that unsubscribes the change listener.

```
function select(state) {
  return state.some.deep.property
}

let currentValue
function handleChange() {
  let previousValue = currentValue
  currentValue = select(store.getState())

  if (previousValue !== currentValue) {
    console.log('Some deep nested property changed from', previousValue, 'to', currentValue)
  }
}

let unsubscribe = store.subscribe(handleChange)
unsubscribe()
```

Note 1. You may call dispatch() from a change listener. However, Calling dispatch() without any conditions would lead to an infinite loop as every dispatch() call usually triggers the listener again.

Note 2. The subscriptions are snapshotted just before every dispatch() call. If you subscribe or unsubscribe while the listeners are being invoked, this will not have any effect on the dispatch() that is currently in progress. However, the next dispatch() call, whether nested or not, will use a more recent snapshot of the subscription list.

Note 3. The listener should not expect to see all state changes, as the state might have been updated multiple times during a nested dispatch() before the listener is called. It is, however, guaranteed that all subscribers registered before the dispatch() started will be called with the latest state by the time it exits.

### replaceReducer(nextReducer)

Replaces the reducer currently used by the store to calculate the state.

It is an advanced API. You might need this if your app implements code splitting, and you want to load some of the reducers dynamically. You might also need this if you implement a hot reloading mechanism for Redux.



## Update logic

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

----

https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f

In a more complex app, you’re going to want different entities to reference each other. We suggest that you keep your state as normalized as possible, without any nesting. Keep every entity in an object stored with an ID as a key, and use IDs to reference it from other entities, or lists. Think of the app’s state as a database. This approach is described in normalizr’s documentation in detail. For example, keeping todosById: { id -> todo } and todos: array<id> inside the state would be a better idea in a real app, but we’re keeping the example simple.

We suggest that you keep your state as normalized as possible, without any nesting.
is surprisingly helpful. Storing subjects as a hash, keyed by _id yields a much better result.

Pushing the DBMS analogy further, we’ve basically created a view on our data. The downside is that every single time our store changes, the subject stacking will be re-worked, just as the underlying queries are re-executed whenever you query a view.

Just as a database view can be materialized by creating an index on it, we have a (somewhat) similar way to avoid recomputing function calls in JavaScript: memoization. Since our selector here is just a regular function, we can memoize it as we can any other function. Of course we don’t want to manually do this; fortunately there’s a library we can use to do it for us: reselect.

Now our subjects are completely re-stacked whenever any individual subject is changed. Returning to the indexed view analogy, this would be like an entire clustered index being re-built from scratch whenever any item in the underlying tables is changed — which of course modern engines don’t. It’s doubtful this will matter, but if this code were somehow performance intense / crucial, there’s nothing stopping you from manually memoizing the function, and only recomputing the portions of the tree that actually changed. Naturally this wouldn’t be easy, and should only be done if actually needed.
