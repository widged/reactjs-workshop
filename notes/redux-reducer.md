# Redux :: Reducers

```
function todoApp(state = initialState, action) {
  // For now, don't handle any actions
  // and just return the state given to us.
  return state
}
```

When the store needs to know how an action changes the state, it asks the reducers. 

## Reducers are pure functions

Reducers don’t change the state that has been passed in to them. Instead, they make a copy and make all their changes on the copy.

## Reducer Composition

In Redux, reducers can be nested via functional composition, just like React components can be nested.

If you have a large application, you might have a whole tree of reducers.

The root reducer takes charge and slices the state up based on the state object’s keys. It passes each slice of state to the reducer that knows how to handle it.

This is one of the key ideas of Redux. The state object isn’t manipulated directly. Instead, each slice is copied and then all of the slices are combined into a new state object.

The reducers pass their copies back to the root reducer, which pastes the copies together to form the updated state object. Then the root reducer sends the new state object back to the store, and the store makes it the new official state.

`combineReducers()` is used for reducer composition.

```
// reducers.js
import { combineReducers } from 'redux'
import {
  SELECT_SUBREDDIT, INVALIDATE_SUBREDDIT,
  REQUEST_POSTS, RECEIVE_POSTS
} from '../actions'

function selectedSubreddit(state = 'reactjs', action) {
  switch (action.type) {
    case SELECT_SUBREDDIT:
      return action.subreddit
    default:
      return state
  }
}

function posts(state = {
  isFetching: false,
  didInvalidate: false,
  items: []
}, action) {
  switch (action.type) {
    case INVALIDATE_SUBREDDIT:
      return Object.assign({}, state, {
        didInvalidate: true
      })
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      })
    case RECEIVE_POSTS:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt
      })
    default:
      return state
  }
}

function postsBySubreddit(state = {}, action) {
  switch (action.type) {
    case INVALIDATE_SUBREDDIT:
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        [action.subreddit]: posts(state[action.subreddit], action)
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  postsBySubreddit,
  selectedSubreddit
})

export default rootReducer
```

In this code, there are two interesting parts:

We use ES6 computed property syntax so we can update state[action.subreddit] with Object.assign() in a terse way. This:

```
return Object.assign({}, state, {
  [action.subreddit]: posts(state[action.subreddit], action)
})
```

is equivalent to this:

```
let nextState = {}
nextState[action.subreddit] = posts(state[action.subreddit], action)
return Object.assign({}, state, nextState)
```

We extracted posts(state, action) that manages the state of a specific post list. This is just reducer composition! It is our choice how to split the reducer into smaller reducers, and in this case, we're delegating updating items inside an object to a posts reducer. The real world example goes even further, showing how to create a reducer factory for parameterized pagination reducers.
Remember that reducers are just functions, so you can use functional composition and higher-order functions as much as you feel comfortable.

## API

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

### Reducer

```
function todoApp(state = initialState, action) {
  // For now, don't handle any actions
  // and just return the state given to us.
  return state
}
```

### Selectors

Selectors are one of the most important constructs in Redux that people tend to overlook. A selector is a pure function that takes the global state as argument and returns some transformation over it. Selectors are tightly coupled to reducers and are located inside reducer.js. They allow us to perform a few calculations on data before it’s being consumed by the view. In our methodology, we take this idea even further. Every time anyone needs to access part of the state (like in mapStatetoProps), they need to go through a selector.

Why? The idea is to encapsulate the internal structure of the app state and hide it from views. Imagine that we decide later on to change the internal state structure. We wouldn’t want to go over all the views in our app and refactor them. Passing through a selector will allow us to confine the refactoring to the reducer only.


### Conventions


### A reducer a “pure” function that returns a new value of the state if altered

Redux takes a given state (object) and passes it to each reducer in a loop. And it expects a brand new object from the reducer if there are any changes. And it also expects to get the old object back if there are no changes.

Redux simply checks whether the old object is the same as the new object by comparing the memory locations of the two objects. So if you mutate the old object’s property inside a reducer, the “new state” and the “old state” will both point to the same object. Hence Redux thinks nothing has changed! So this won’t work.

The alternative would be to deep-compare the new state and the old state. This is a very expensive operation.


### A reducer must return the initial state when receiving undefined as state argument

If the reducer receives undefined as the state argument it must returns what it considers to be the initial state of the application.




## Easily supported features

### Undo/Redo 

This pattern also enables wonderful features like no-user-code undo/redo. Can you imagine plugging Undo/Redo into a Flux app being two lines of code? Hardly. With Redux, it is—again, thanks to reducer composition pattern. I need to highlight there's nothing new about it—this is the pattern pioneered and described in detail in Elm Architecture which was itself influenced by Flux.

### Server side rendering

Server side rendering. Redux just goes further: since there is just a single store (managed by many reducers), you don't need any special API to manage the (re)hydration. You don't need to “flush” or “hydrate” stores—there's just a single store, and you can read its current state, or create a new store with a new state. Each request gets a separate store instance. Read more about server rendering with Redux.

### Memoization

Just as a database view can be materialized by creating an index on it, we have a (somewhat) similar way to avoid recomputing function calls in JavaScript: memoization. Since our selector here is just a regular function, we can memoize it as we can any other function. Of course we don’t want to manually do this; fortunately there’s a library we can use to do it for us: reselect.

### Hot reloading

### Reloading reducers

Possible to change reducer code on the fly or even “change the past” by crossing out actions, and see the state being recalculated.

When Redux needs to reload the reducer code, it calls replaceReducer(), and the app runs with the new code. In Flux, data and functions are entangled in Flux stores, so you can't “just replace the functions”. Moreover, you'd have to somehow re-register the new versions with the Dispatcher—something Redux doesn't even have.

## Tips

Services must be completely stateless.
