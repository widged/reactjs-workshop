# redux


## Introduction

Redux tries to separate the application data and business logic into its own container so that React can manage just the view. This makes your software more flexible because you can potentially swap out React for some other view library.

Redux is an evolution of the ideas presented by Facebook's Flux, avoiding the complexity found in Flux by looking to how applications are built with the Elm language. [source](https://egghead.io/courses/getting-started-with-redux)

Redux is useful for React applications, but React is not a requirement!  [source](https://egghead.io/courses/getting-started-with-redux)

## State Management

Managing state in an application is critical, and is often done haphazardly. Redux provides a state container for JavaScript applications that will help your applications behave consistently.

The state is held within stores. Dispatched actions cause this state to change, afterwhich the views that listen to these state changes will re-render themselves accordingly. Data is made to flow in a single direction. This greatly minimises the risk of unwanted effect as the application grows in complexity. 

One of the difficulties with understanding Redux is the necessity to cover production ready techniques for building your React and Redux applications: Advanced state management, middleware, React Router integration. [source](https://egghead.io/courses/building-react-applications-with-idiomatic-redux). 

And add to that a plethora of unintuitive terms like reducers, selectors and thunks. 

## At a glance

------------------------------------------------------------------------
(source: https://medium.com/@stowball/a-dummys-guide-to-redux-and-thunk-in-react-d8904a7005d3)

There are a few core principles to Redux which we need to understand:

* There is 1 global state object that manages the state for your entire application. In this example, it will behave identically to our initial component’s state. It is the single source of truth.
* The only way to modify the state is through emitting an action, which is an object that describes what should change. Action Creators are the functions that are dispatched to emit a change – all they do is return an action.
* When an action is dispatched, a Reducer is the function that actually changes the state appropriate to that action – or returns the existing state if the action is not applicable to that reducer.
* Reducers are “pure functions”. They should not have any side-effects nor mutate the state — they must return a modified copy.
* Individual reducers are combined into a single rootReducer to create the discrete properties of the state.
* The Store is the thing that brings it all together: it represents the state by using the rootReducer, any middleware (Thunk in our case), and allows you to actually dispatch actions.
* For using Redux in React, the <Provider /> component wraps the entire application and passes the storedown to all children.

This should all become clearer as we start to convert our application to use Redux.

------------------------------------------------------------------------


# Logic

## Basic

reducer:: state -> action -> state

1. State (store). All of the application's state is held in a single javascript object. The state is *read-only*. It cannot be edited directly. The only way to apply changes is by sending change requests by dispatching actions. 

2. Action. An action is a special type of event. It is defined by a type (unique identifier) and a payload. You might dispatch an action that simply sends a message to remove an item in a list which could look like this: `{type: types.DELETE_ITEM, id: 1}`

3. Reducers reacting to actions. When an action is received, the store will dispatch this action object to all of it’s reducer functions, leading to an eventual update of the state. 

4.  Recomputation of the state. Reducer functions take a state (from a relevant part of the store) and action parameter and return a new resultant state.




## In Details

The data lifecycle in any Redux app follows these 4 steps:

0. store

In Redux, your entire application state is managed by a single store. You can think of the store as basically a JavaScript object where each key is a particular slice of the application state you want to keep track of and each value is the corresponding value for that particular slice of state.

1. You call store.dispatch(action).

The only way you can modify your application state in Redux is by having Actions dispatched to the Store. Actions are simply POJOs (plain old JavaScript objects). It’s important to note that actions are declarative — they describe what you can do in your app but not how to do it. Actions are purely data! 

An action is a plain object describing a change. For example:

```
 { type: 'LIKE_ARTICLE', articleId: 42 }
 { type: 'FETCH_USER_SUCCESS', response: { id: 3, name: 'Mary' } }
 { type: 'ADD_TODO', text: 'Read the Redux docs.' }
```

Think of an action as a very brief snippet of news. “Mary liked article 42.” or “‘Read the Redux docs.' was added to the list of todos.”

You can call store.dispatch(action) from anywhere in your app, including components and XHR callbacks, or even at scheduled intervals.

2. The Redux store calls the reducer function you gave it.

Actions provide data. Reducers describe HOW the application state get to be modified as a function of these data. A reducer is a pure function that takes the current state and an action as its two inputs, then outputs the next state.

The store will pass two arguments to the reducer: the current state tree and the action. For example, in the todo app, the root reducer might receive something like this:

```
 // The current application state (list of todos and chosen filter)
 let previousState = {
   visibleTodoFilter: 'SHOW_ALL',
   todos: [
     {
       text: 'Read the docs.',
       complete: false
     }
   ]
 }

 // The action being performed (adding a todo)
 let action = {
   type: 'ADD_TODO',
   text: 'Understand the flow.'
 }

 // Your reducer returns the next application state
 let nextState = todoApp(previousState, action)
```

A reducer must be a pure function. It only computes the next state. It should be completely predictable: calling it with the same inputs many times should produce the same outputs. It shouldn't perform any side effects like API calls or router transitions. These should happen before an action is dispatched.

After each sub reducer function produces its corresponding next state, an updated application state object is produced and saved in the store. Remember that the store is the single source of truth for the application state, so after each action is run through the reducers, a new state is produced and saved in the store.



3. The root reducer may combine the output of multiple reducers into a single state tree.

How you structure the root reducer is completely up to you. Redux ships with a combineReducers() helper function, useful for “splitting” the root reducer into separate functions that each manage one branch of the state tree.

Here's how combineReducers() works. Let's say you have two reducers, one for a list of todos, and another for the currently selected filter setting:

```
 function todos(state = [], action) {
   // Somehow calculate it...
   return nextState
 }

 function visibleTodoFilter(state = 'SHOW_ALL', action) {
   // Somehow calculate it...
   return nextState
 }

 let todoApp = combineReducers({
   todos,
   visibleTodoFilter
 })
```

When you emit an action, todoApp returned by combineReducers will call both reducers:

 let nextTodos = todos(state.todos, action)
 let nextVisibleTodoFilter = visibleTodoFilter(state.visibleTodoFilter, action)
It will then combine both sets of results into a single state tree:

```
 return {
   todos: nextTodos,
   visibleTodoFilter: nextVisibleTodoFilter
 }
```

While combineReducers() is a handy helper utility, you don't have to use it; feel free to write your own root reducer!

4. The Redux store saves the complete state tree returned by the root reducer.

This new tree is now the next state of your app! Every listener registered with store.subscribe(listener) will now be invoked; listeners may call store.getState() to get the current state.

Now, the UI can be updated to reflect the new state. If you use bindings like React Redux, this is the point at which component.setState(newState) is called.


## Notes

When using Redux, keep the following in mind. 

### State mutation in the app must be described as a pure function

The UI or View layer is most predictable when described as a pure function of the application state. State mutation in the app must be described as a pure function that takes the previous the previous state and the action being dispatched and returns the next state of the application. (reducer). Each reducer function has to be pure. It has to return a new object and not modify the existing object.

To understand the value of that approach, it is important to be aware of the difference between pure and impure functions. Impure functions have side effects. They interact with webservice apis, fetch data from databases, interact with the DOM.

To guarantee that no mutation takes place, use libraries like `immutable.js` or `deep-freeze`, or trust yourself and your team to write non-mutative code, but it's something you need to be aware of, and this needs to be a conscious decision accepted by your team.

// It’s important that reducers are pure and without side effects. Every time you provide the same inputs, you should always get the same output. What’s cool about this is that — given an initial state and a list of actions — you’ll know exactly how the resulting state should look after every action.

### strict unidirectional data flow.

Redux architecture revolves around a strict unidirectional data flow.

This means that all data in an application follows the same lifecycle pattern, making the logic of your app more predictable and easier to understand. It also encourages data normalization, so that you don't end up with multiple, independent copies of the same data that are unaware of one another.

### Single source of truth

Though it is possible to rely on multiple store, the convention is to use only one. This guarantees a single source of truth.
STORF.

## Reducer Composition

While its possible to have a single reducer function manage the entire state transformation for every action, Redux emphasizes using reducer composition. This is just a fancy term for breaking down your one large reducer function into lots of smaller reducer functions that handle a particular slice of the overall application state.

## Actions Creators

Action Creators are functions that produce and return actions. These action creators are hooked up to React components so that when a user interacts with the UI, the action creators are invoked and create new actions that get dispatched to the store.

# Tips

* As much as possible, focus on writing stateless functional components, since these components are pure (i.e. given the same input prop values, will always return the same UI representation). Pure components are easier to reason about and test.

* Carefully determine which component should manage this state change. It is worthwile reading about smart vs dumb components. 



## Utils

### deep-freeze
deep-freeze to ensure code is free of mutations

deepFreeze(array)

function compose(…funcs) {
   if (funcs.length === 0) {
     return arg => arg
   }
   if (funcs.length === 1) {
     return funcs[0]
   }
   const last = funcs[funcs.length — 1]
   const rest = funcs.slice(0, -1)
   return (…args) => rest.reduceRight((composed, f) => f(composed),    last(…args))
 }


console.error vs. console.log
Don’t use console.log for everything. If you have an error that you want to print out, use console.error. You get a nice red print out with a stack trace in your console.

### Reselect

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


## Resources

https://github.com/xgrommx/awesome-redux
https://github.com/markerikson/react-redux-links
https://medium.com/@sapegin/react-and-redux-single-page-applications-resources-22cd859b0c1d


