# Redux :: Store

The Redux store is just a plain object with a few methods.


In Redux, by convention, a store holds the whole state tree of your application. A store is not a class. It's just an object with a few methods on it. It's a good idea to think of the shape of the state tree before writing any code. App state is a first class citizen, structure it like an in-memory database.


The only way to change the state inside the store is to dispatch an action on it.

The Store is the object that brings them together. The store has the following responsibilities:

* Holds application state;
* Allows access to state via getState();
* Allows state to be updated via dispatch(action);
* Registers listeners via subscribe(listener);
* Handles unregistering of listeners via the function returned by subscribe(listener).

It's important to note that you'll only have a single store in a Redux application. When you want to split your data handling logic, you'll use reducer composition instead of many stores.

## `redux.createStore()` to create a store

To create it, pass your root reducing function to createStore.

```
import { createStore } from 'redux'
import todoApp from './reducers'
let store = createStore(todoApp)
```

You may optionally specify the initial state as the second argument to createStore(). This is useful for hydrating the state of the client to match the state of a Redux application running on the server.

```
let store = createStore(todoApp, window.STATE_FROM_SERVER)
```

### vanilla store vs middleware

The “vanilla” store implementation you get by calling createStore only supports plain object actions and hands them immediately to the reducer.

However, if you wrap createStore with applyMiddleware, the middleware can interpret actions differently, and provide support for dispatching async actions. Async actions are usually asynchronous primitives like Promises, Observables, or thunks.

## API

http://redux.js.org/docs/api/Store.html

* getState()
* dispatch(action)
* subscribe(listener)
* replaceReducer(nextReducer)

Note “Reducers may not dispatch actions.”

### `getState()`

Returns the current state tree of your application.
It is equal to the last value returned by the store's reducer.

### `dispatch(action)`

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

### `subscribe(listener)`

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

### `replaceReducer(nextReducer)`

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

## Tips

### Avoid multiple levels of nesting

We suggest that you keep your state as normalized as possible, without any nesting. Storing subjects as a hash, keyed by _id yields a much better result. Keep every entity in an object stored with an ID as a key, and use IDs to reference it from other entities, or lists. Think of the app’s state as a database. This approach is described in normalizr’s documentation in detail. For example, keeping todosById: { id -> todo } and todos: array<id> inside the state would be a better idea in a real app, but we’re keeping the example simple. [source](https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f)

If you were to adopt nesting that reflect the hierarchy of UI views, a downside would be that every single time our views change, the store tree  will be re-worked.

Web applications often show lists of things. For example, a list of posts, or a list of friends. You'll need to figure out what sorts of lists your app can show. You want to store them separately in the state, because this way you can cache them and only fetch again if necessary.

Here's what the state shape for a “Reddit headlines” app might look like:

```
{
  selectedSubreddit: 'frontend',
  postsBySubreddit: {
    frontend: {
      isFetching: true,
      didInvalidate: false,
      items: []
    },
    reactjs: {
      isFetching: false,
      didInvalidate: false,
      lastUpdated: 1439478405547,
      items: [
        {
          id: 42,
          title: 'Confusion about Flux and Relay'
        },
        {
          id: 500,
          title: 'Creating a Simple Application Using React JS and Flux Architecture'
        }
      ]
    }
  }
}
```

There are a few important bits here:

We store each subreddit's information separately so we can cache every subreddit. When the user switches between them the second time, the update will be instant, and we won't need to refetch unless we want to. Don't worry about all these items being in memory: unless you're dealing with tens of thousands of items, and your user rarely closes the tab, you won't need any sort of cleanup.

For every list of items, you'll want to store isFetching to show a spinner, didInvalidate so you can later toggle it when the data is stale, lastUpdated so you know when it was fetched the last time, and the items themselves. In a real app, you'll also want to store pagination state like fetchedPageCount and nextPageUrl.

Note on Nested Entities

In this example, we store the received items together with the pagination information. However, this approach won't work well if you have nested entities referencing each other, or if you let the user edit items. Imagine the user wants to edit a fetched post, but this post is duplicated in several places in the state tree. This would be really painful to implement.

If you have nested entities, or if you let users edit received entities, you should keep them separately in the state as if it was a database. In pagination information, you would only refer to them by their IDs. This lets you always keep them up to date. The real world example shows this approach, together with normalizr to normalize the nested API responses. With this approach, your state might look like this:

```
{
  selectedSubreddit: 'frontend',
  entities: {
    users: {
      2: {
        id: 2,
        name: 'Andrew'
      }
    },
    posts: {
      42: {
        id: 42,
        title: 'Confusion about Flux and Relay',
        author: 2
      },
      100: {
        id: 100,
        title: 'Creating a Simple Application Using React JS and Flux Architecture',
        author: 2
      }
    }
  },
  postsBySubreddit: {
    frontend: {
      isFetching: true,
      didInvalidate: false,
      items: []
    },
    reactjs: {
      isFetching: false,
      didInvalidate: false,
      lastUpdated: 1439478405547,
      items: [ 42, 100 ]
    }
  }
}
```

## Normalizing entities

For dynamic applications, it can be useful to normalize entities.
