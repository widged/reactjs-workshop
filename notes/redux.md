
------------------------------------------------------------------------
https://medium.com/@stowball/a-dummys-guide-to-redux-and-thunk-in-react-d8904a7005d3

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

I had no idea why I'd want to use Redux when I started this course. This course really made it easy to understand the how & why of redux. Thanks Dan!

Managing state in an application is critical, and is often done haphazardly. Redux provides a state container for JavaScript applications that will help your applications behave consistently.

Redux is an evolution of the ideas presented by Facebook's Flux, avoiding the complexity found in Flux by looking to how applications are built with the Elm language.

Redux is useful for React applications, but React is not a requirement!

In this series, we will learn the basics of Redux, so that you can start using it to simplify your applications.

It's highly recommended that you have a quick read of the Redux documentation alongside or before you watch the series.

There are some amazing community notes on this course here on Github.

Once you are finished with this course be sure to check out part 2: building-react-applications-with-idiomatic-redux

https://egghead.io/courses/getting-started-with-redux

You are about to learn practical production ready techniques for building your React and Redux applications. You will explore advanced state management, middleware, React Router integration, and other common problems you are likely to encounter while building applications for your clients and customers.
Even if you have already spent time studying Redux, this course will show you better practices straight from the library's creator Dan Abramov.

https://egghead.io/courses/building-react-applications-with-idiomatic-redux

One of the main things often missing from Redux tutorials is the grand picture and where Redux fits in. Redux is an implementation of the Flux architecture — a pattern for passing data around in a React app.
Under classic Flux, app state is held within stores. Dispatched actions cause this state to change, afterwhich the views that listen to these state changes will re-render themselves accordingly:

Flux simplifies life by making data flow in a single direction. This reduces the spaghetti effect as the codebase grows and becomes more complex.

One of the difficulties with understanding Redux is the plethora of unintuitive terms like reducers, selectors and thunks. It’s easier to see where they all fit in by placing them on the Flux diagram. These are simply the technical names of the various Redux constructs that implement the different parts of the cycle:


-----



How do you bridge data coming from your React code to your Redux code and vise versa?

How does the state from your reducers and the functions from your action creators get used in your application? And how do you pass the necessary data to your action creators to update the store?

# Logic

How do you bridge data coming from your React code to your Redux code and vise versa?

How does the state from your reducers and the functions from your action creators get used in your application? And how do you pass the necessary data to your action creators to update the store?

A Store in Redux have a dispatch function which is only concerned with the main execution task you are interested in. You dispatch actions to your reducer functions to update state of the application. Redux reducer functions take a state and action parameter and return a new resultant state:

reducer:: state -> action -> state

You might dispatch an action that simply sends a message to remove an item in a list which could look like this:

{type: types.DELETE_ITEM, id: 1}

The store will dispatch this action object to all of it’s reducer functions which could affect state. However, the reducer functions are only concerned with executing logic around this deletion. They typically don’t care who did it, how long it took, or logging the before and after effects of the state changes. This is where middleware can help us to address these non-core concerns.


# Basic

The all state of the application in a single javascript object. The state is *read-only*. It cannot be edited directly. The only way to apply changes is by sending change requests by dispatching actions. And action is a special type of event. It is defined by a type (unique identifier) and a payload.

To understand the value of that approach, it is important to be aware of the difference between pure and impure functions. Impure functions have side effects. They interact with webservice apis, fetch data from databases, interact with the DOM.

The UI or View layer is most predictable when described as a pure function of the application state. Introduced in Elm. React was the first js framework to adopt. It has since been picked up by other frameworks like angular and ember.

State mutation in the app must be described as a pure function that takes the previous the previous state and the action being dispatched and returns the next state of the application. (reducer)

It has to be pure. It has to return a new object and not modify the existing object.



# strict unidirectional data flow.

Redux architecture revolves around a strict unidirectional data flow.

This means that all data in an application follows the same lifecycle pattern, making the logic of your app more predictable and easier to understand. It also encourages data normalization, so that you don't end up with multiple, independent copies of the same data that are unaware of one another.

# Single source of truth


Store. Though it is possible to rely on multiple store, the convention is to use only one. This guarantees a single source of truth.
STORF.


# The data lifecycle in any Redux app follows these 4 steps:

1. You call store.dispatch(action).

An action is a plain object describing what happened. For example:

```
 { type: 'LIKE_ARTICLE', articleId: 42 }
 { type: 'FETCH_USER_SUCCESS', response: { id: 3, name: 'Mary' } }
 { type: 'ADD_TODO', text: 'Read the Redux docs.' }
```

Think of an action as a very brief snippet of news. “Mary liked article 42.” or “‘Read the Redux docs.' was added to the list of todos.”

You can call store.dispatch(action) from anywhere in your app, including components and XHR callbacks, or even at scheduled intervals.

2. The Redux store calls the reducer function you gave it.

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

Note that a reducer is a pure function. It only computes the next state. It should be completely predictable: calling it with the same inputs many times should produce the same outputs. It shouldn't perform any side effects like API calls or router transitions. These should happen before an action is dispatched.

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


### Utils

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

### Misc


I'd say you're going to make the following compromises using it:

* You'll need to learn to avoid mutations. Flux is unopinionated about mutating data, but Redux doesn't like mutations, and many packages complementary to Redux assume you never mutate the state. You can enforce this with dev-only packages like redux-immutable-state-invariant, use Immutable.js, or trust yourself and your team to write non-mutative code, but it's something you need to be aware of, and this needs to be a conscious decision accepted by your team.
* You're going to have to carefully pick your packages. While Flux explicitly doesn't try to solve “nearby” problems such as undo/redo, persistence, or forms, Redux has extension points such as middleware and store enhancers, and it has spawned a young but rich ecosystem. This means most packages are new ideas and haven't received the critical mass of usage yet. You might depend on something that will be clearly a bad idea a few months later on, but it's hard to tell just yet.
* You won't have a nice Flow integration yet. Flux currently lets you do very impressive static type checks which Redux doesn't support yet. We'll get there, but it will take some time.

I think the first is the biggest hurdle for the beginners, the second can be a problem for over-enthusiastic early adopters, and the third is my personal pet peeve. Other than that, I don't think using Redux brings any particular downsides that Flux avoids, and some people say it even has some upsides compared to Flux.


----


Why I think Redux makes sense
Here’s how I would describe my React usage during the past 8 months:
As much as possible, focus on writing stateless functional components, since these components are pure (i.e. given the same input prop values, will always return the same UI representation). Pure components are easier to reason about and test.
Whenever I needed to incorporate state into my components, I carefully asked myself which component should actually manage this state. Should it be the immediate parent of a particular stateless component? Or should it be higher up in the hierarchy since other stateless components might need it too?
Answering the above question is a very important step in developing React applications — in fact, even if you use Redux (or some other Flux variant), you’ll still need to know the answer to this question because it’ll determine which components get promoted to Redux containers (such as smart components).
As my application grew larger, I noticed that there were lots of components that managed their own state sprinkled all throughout the application. I also noticed that I needed to refactor every so often because multiple components would need to access the same state. The typical pattern I saw was that I’d have to move the state up the component hierarchy so that the parent of those stateful components now managed that particular state.
As I encountered this pattern more and more, I started asking whether it’d be better to move all of the component’s state to the top of the component hierarchy, and then just pass a particular piece of the state to whichever downstream component needed it. The reason I thought this would be useful is because, aside from the top most component, every other downstream component could be stateless (caveat here: more often than not, you’ll probably still want to have some UI state managed by the particular component instead).
Drumroll please — introducing Redux
At the end of the day, what I was trying to achieve above was better separation of concerns.
React is a UI library. It should only deal with rendering the UI given a particular set of data. If the data changes, it should re-render to form a new UI.
However, as my application grew, I started sprinkling state and business logic all over the place. This made it more difficult to reuse components and started making my components really thick.
Redux tries to separate the application data and business logic into its own container so that React can manage just the view. This makes your software more flexible because you can potentially swap out React for some other view library.
I’m no Redux expert but here’s how I visualize its different parts
When you’re first learning Redux, there are several key concepts to understand: store, actions / action creators, and reducer functions. The official documentation is great, and I highly recommend reading through it and playing with the code. My examples below will make much more sense if you’ve read the docs first!
I’m a visual learner so here’s how I explained the concepts to myself:


Store — a basketball hoop
In Redux, your entire application state is managed by a single store. You can think of the store as basically a JavaScript object where each key is a particular slice of the application state you want to keep track of and each value is the corresponding value for that particular slice of state.
You might be asking what a store has to do with a basketball hoop? Well, if you allow me some flexibility in my analogy, just like how you can only score points in a basketball game by shooting a ball through the hoop, the only way you can modify your application state in Redux is by having Actions (see below) pass through the Store.
If we’re using more technical jargon here, the only way to modify state in Redux is to have actions dispatched to the store.

Actions — a basketball
We mentioned Actions above without explaining what they were yet but they’re simply POJOs (plain old JavaScript objects). Here’s a code example of how they might look:

When thinking about your application as a whole, you want to come up with all the different actions your application can take.
It’s important to note that actions are declarative — they describe what you can do in your app but not how to do it. Actions are purely data!
To reiterate, in order for your application to change its state, you have to “shoot” your action “through” the store :)

Reducers — the coach and the players on team
In the above section, we said that actions describe the different things your application can do. They don’t, however, describe HOW actions modify your application state. This is where reducers come into play.
A reducer is a pure function that takes the current state and an action as its two inputs, then outputs the next state.
It’s important that reducers are pure and without side effects. Every time you provide the same inputs, you should always get the same output. What’s cool about this is that — given an initial state and a list of actions — you’ll know exactly how the resulting state should look after every action.
While its possible to have a single reducer function manage the entire state transformation for every action, Redux emphasizes using reducer composition. This is just a fancy term for breaking down your one large reducer function into lots of smaller reducer functions that handle a particular slice of the overall application state.
Following my analogy, you can think of the overall combined reducer as the coach, and the smaller reducer functions as the players. Once the action is “shot through” the store, the combined reducer “catches” the action and “passes” the same action to each of the smaller reducer functions. Each smaller reducer function then examines the action and determines whether it wants to modify that part of the application state that it’s responsible for. And if it does, it’ll produce the new state.
Here’s some code:

Tying up loose ends
At this point, you might have a reasonable question: what happens after each sub reducer function produces it’s next state?
After each sub reducer function produces its corresponding next state, an updated application state object is produced and saved in the store. Remember that the store is the single source of truth for the application state, so after each action is run through the reducers, a new state is produced and saved in the store.
You might also be wondering how we start the process — how exactly are actions initially created?
Redux introduces another concept called Action Creators, which are functions that produce and return actions. These action creators are hooked up to React components so that when a user interacts with the UI, the action creators are invoked and create new actions that get dispatched to the store.
Conclusion
The goal of this post is not to teach you the ins and outs of Redux, but rather to help more visual learners enjoy seeing how the different parts of Redux interact with each other. Hopefully this post was able to shed some more light on that!
Note: I recently came across this video by Dan Abramov where he mentions one of the struggles I noticed when just using React without Redux. You essentially pass down lots of props from intermediate to child components, even when those intermediate components don’t need them. It’s a great video explaining the motivation behind Redux and higher order components in React!


------------

Resources

https://github.com/xgrommx/awesome-redux
https://github.com/markerikson/react-redux-links
https://medium.com/@sapegin/react-and-redux-single-page-applications-resources-22cd859b0c1d
