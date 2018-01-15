# redux


## Introduction

Redux tries to separate the application data and business logic into its own container so that React can manage just the view. This makes your software more flexible because you can potentially swap out React for some other view library.

Redux is an evolution of the ideas presented by Facebook's Flux, avoiding the complexity found in Flux by looking to how applications are built with the Elm language. [source](https://egghead.io/courses/getting-started-with-redux)

Redux is useful for React applications, but React is not a requirement!  [source](https://egghead.io/courses/getting-started-with-redux)

## State Management

Managing state in an application is critical, and is often done haphazardly. Redux provides a state container for JavaScript applications that will help your applications behave consistently.

The state is held within stores. Redux is makes state changes predictable and transparent. The state can change only as a result of actions dispatched to it. Every time an action is dispatched, the new state is computed and saved, afterwhich the views that listen to these state changes will re-render themselves accordingly. Data is made to flow in a single direction. This greatly minimises the risk of unwanted effect as the application grows in complexity.

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

1. State (store). All of the application's state is held in a single javascript object. The state is *read-only*. It cannot be edited directly. The state can only change as a consequence of specific actions being dispatched to the store.

2. Action. An action is a special type of event. It is defined by a type (unique identifier) and a payload. You might dispatch an action that simply sends a message to remove an item in a list which could look like this: `{type: types.DELETE_ITEM, id: 1}`

3. Reducers reacting to actions. When an action is received, the store will dispatch this action object to all of it’s reducer functions, leading to an eventual update of the state.

4.  Recomputation of the state. Reducer functions take a state (from a relevant part of the store) and action parameter and return a new resultant state.




## In Details

The data lifecycle in any Redux app follows these 4 steps:

0. store

In Redux, your entire application state is managed by a single store. You can think of the store as basically a JavaScript object where each key is a particular slice of the application state you want to keep track of and each value is the corresponding value for that particular slice of state.

1. You call store.dispatch(action).


Actions are the only way to get data into the store, so any data, whether from the UI events, network callbacks, or other sources such as WebSockets needs to eventually be dispatched as actions.

Actions are simply POJOs (plain old JavaScript objects) describing a change in a way that makes sense for your application. For example:

```
 { type: 'LIKE_ARTICLE', articleId: 42 }
 { type: 'FETCH_USER_SUCCESS', response: { id: 3, name: 'Mary' } }
 { type: 'ADD_TODO', text: 'Read the Redux docs.' }
```

Actions must have a type field that indicates the type of action being performed. Types can be defined as constants and imported from another module. It's better to use strings for type than Symbols because strings are serializable. Other than type, the structure of an action object is really up to you. If you're interested, check out Flux Standard Action for recommendations on how actions could be constructed.

Actions describe the fact that something happened. Think of an action as a very brief snippet of news. “Mary liked article 42.” or “‘Read the Redux docs.' was added to the list of todos.”.

Actions are purely data! They are strictly declarative — they describe what you can do in your app. Actions do not specify how the application's state changes in response. This is the job of reducers.

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


----

https://medium.com/javascript-scene/10-tips-for-better-redux-architecture-69250425af44

### Benefits of Redux

There are a couple important goals for Redux that you need to keep in mind:

- Deterministic View Renders
- Deterministic State Reproduction

Determinism is important for application testability and diagnosing and fixing bugs. If your application views and state are nondeterministic, it’s impossible to know whether or not the views and state will always be valid. You might even say that nondeterminism is a bug in itself.

But some things are inherently nondeterministic. Things like the timing of user input and network I/O. So how can we ever know if our code really works? Easy: Isolation.

The main purpose of Redux is to isolate state management from I/O side effects such as rendering the view or working with the network. When side-effects are isolated, code becomes much more simple. It’s a lot easier to understand and test your business logic when it’s not all tangled up with network requests and DOM updates.

When your view render is isolated from network I/O and state updates, you can achieve a deterministic view render, meaning: given the same state, the view will always render the same output. It eliminates the possibility of problems such as race conditions from asynchronous stuff randomly wiping out bits of your view, or mutilating bits of your state as your view is in the process of rendering.

When a newbie thinks about creating a view, they might think, “This bit needs the user model, so I’ll launch an async request to fetch that and when that promise resolves, I’ll update the user component with their name. That bit over there requires the to-do items, so we’ll fetch that, and when the promise resolves, we’ll loop over them and draw them to the screen.”

There are a few major problems with this approach:

You never have all the data you need to render the complete view at any given moment. You don’t actually start to fetch data until the component starts to do its thing.

Different fetch tasks can come in at different times, subtly changing the order that things happen in the view render sequence. To truly understand the render sequence, you have to have knowledge of something you can’t predict: the duration of each async request. Pop quiz: In the above scenario, what renders first, the user component or the to-do items? Answer: It’s a race!

Sometimes event listeners will mutate the view state, which might trigger another render, further complicating the sequence.

The key problem with storing your data in the view state and giving async event listeners access to mutate that view state is this:

“Nondeterminism = parallel processing + shared state” ~ Martin Odersky (Scala designer)

Mingling data fetching, data manipulation and view render concerns is a recipe for time-traveling spaghetti.

I know that sounds kinda cool in a B-movie sci-fi kinda way, but believe me, time-traveling spaghetti is the worst tasting kind there is!

What the flux architecture does is enforce a strict separation and sequence, which obeys these rules every time:

First, we get into a known, fixed state…

Then we render the view. Nothing can change the state again for this render loop.

Given the same state, the view will always render the same way.

Event listeners listen for user input and network request handlers. When they get them, actions are dispatched to the store.

When an action is dispatched, the state is updated to a new known state and the sequence repeats. Only dispatched actions can touch the state.


With the Redux architecture, the view listens for user input, translates those into action objects, which get dispatched to the store. Reducers are called. The store updates the application state and notifies the view to render again.

An action object is a transaction record. A record of the change to be made. Action objects add a transaction history to your application state.

What action objects give you is the ability to keep a running log of all state transactions. That log can be used to reproduce the state in a deterministic way, meaning:

Given the same initial state and the same transactions in the same order, you always get the same state as a result.

This has important implications:

- Easy testability
- Easy undo/redo
- Time travel debugging
- Durability — Even if the state gets wiped out, if you have a record of every transaction, you can reproduce it.

Who doesn’t want to have a mastery over space and time? Transactional state gives you time-traveling superpowers:

###  Some Apps Don’t Need Redux

If:
- User workflows are simple
- Users don’t collaborate
- You don’t need to manage server side events (SSE) or websockets
- You fetch data from a single data source per view

It may be that sequence of events in the app is probably sufficiently simple that the benefits of transactional state are not worth the extra effort.

However, as the complexity of your app grows, as the complexity of view state management grows, you could benefit enough from a transactional state model to make it worth the effort. Redux might be a good fit for you.

###  Understand Reducers

Redux =  and transactional state with action objects + Functional Programming

Action objects don’t say anything about how to handle action objects. That’s where Redux comes in. The primary building block of Redux state management is the reducer function. What’s a reducer function?

In functional programming, the common utility `reduce()` or `fold()` is used to apply a reducer function to each value in a list of values in order to accumulate a single output value. Here’s an example of a summing reducer applied to a JavaScript array with `Array.prototype.reduce()`:

```
const initialState = 0;
const reducer = (state = initialState, data) => state + data;
const total = [0, 1, 2, 3].reduce(reducer);
console.log(total); // 6
```

Instead of operating on arrays, Redux applies reducers to a stream of action objects. Remember, an action object looks like this:

```
{
  type: ADD_TODO,
  payload: 'Learn Redux'
}
```

Let’s turn the summing reducer above into a Redux-style reducer:

```
const defaultState = 0;
const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'ADD': return state + action.payload;
    default: return state;
  }
};
```

Now we can apply it to some test actions:

```
const actions = [
  { type: 'ADD', payload: 0 },
  { type: 'ADD', payload: 1 },
  { type: 'ADD', payload: 2 }
];

const total = actions.reduce(reducer, 0); // 3
```

### Reducers Must be Pure Functions

In order to achieve deterministic state reproduction, reducers must be pure functions. No exceptions. A pure function:

- Given the same input, always returns the same output.
- Has no side-effects.

Importantly in JavaScript, all non-primitive objects are passed into functions as references. In other words, if you pass in an object, and then directly mutate a property on that object, the object changes outside the function as well. That’s a side-effect. You can’t know the full meaning of calling the function without also knowing the full history of the object you passed in. That’s bad.
Reducers should return a new object, instead. You can do that with `Object.assign({}, state, { thingToChange })`, for instance.

Array parameters are also references. You can’t just `.push()` new items to an array in a reducer, because `.push()` is a mutating operation. Likewise, so are `.pop()`, `.shift()`, `.unshift()`, `.reverse()`, `.splice()`, and any other mutator method.
If you want to be safe with arrays, you need to restrict the operations you perform on the state to the safe accessor methods. Instead of `.push()`, use `.concat()`.
Take a look at the `ADD_CHAT` case in this chat reducer:

As you can see, a new object is created with `Object.assign()`, and we append to the array with `.concat()` instead of `.push()`.

Personally, I don’t like to worry about accidentally mutating my state, so lately I’ve been experimenting with using immutable data APIs with Redux. If my state is an immutable object, I don’t even need to look at the code to know that the object isn’t being accidentally mutated. I came to this conclusion after working on a team and discovering bugs from accidental state mutations.

There’s a lot more to pure functions than this. If you’re going to use Redux for production apps, you really need a good grasp of what pure functions are, and other things you need to be mindful of (such as dealing with time, logging, & random numbers). For more on that, see “Master the JavaScript Interview: What is a Pure Function?”.

### Reducers Must be the Single Source of Truth

All state in your app should have a single source of truth, meaning that the state is stored in a single place, and anywhere else that state is needed should access the state by reference to its single source of truth.
It’s OK to have different sources of truth for different things. For example, the URL could be the single source of truth for the user request path and URL parameters. Maybe your app has a configuration service which is the single source of truth for your API URLs. That’s fine. However…
When you store any state in a Redux store, any access to that state should be made through Redux. Failing to adhere to this principle can result in stale data or the kinds of shared state mutation bugs that Flux and Redux were invented to solve.

In other words, without the single source of truth principle, you potentially lose:

- Deterministic view render
- Deterministic state reproduction
- Easy undo/redo
- Time travel debugging
- Easy testability

Either Redux or don’t Redux your state. If you do it half way, you could undo all of the benefits of Redux.


### Use Constants for Action Types

I like to make sure that actions are easy to trace to the reducer that employs them when you look at the action history. If all your actions have short, generic names like `CHANGE_MESSAGE`, it becomes harder to understand what’s going on in your app. However, if action types have more descriptive names like `CHAT::CHANGE_MESSAGE`, it’s obviously a lot more clear what’s going on.

Also, if you make a typo and dispatch an undefined action constant, the app will throw an error to alert you of the mistake. If you make a typo with an action type string, the action will fail silently.

Keeping all the action types for a reducer gathered in one place at the top of the file can also help you:
- Keep names consistent
- Quickly understand the reducer API
- See what’s changed in pull requests

### Use Action Creators to Decouple Action Logic from Dispatch Callers

When I tell people that they can’t generate IDs or grab the current time in a reducer, I get funny looks. If you’re staring at your screen suspiciously right now rest assured: you’re not alone.

So where is a good place to handle impure logic like that without repeating it everywhere you need to use the action? In an action creator.
- Action creators have other benefits, as well:
- Keep action type constants encapsulated in your reducer file so you don’t have to import them anywhere else.
- Make some calculations on inputs prior to dispatching the action.

### Reduce boilerplate

Let’s use an action creator to generate the `ADD_CHAT` action object:

```
// Action creators can be impure.
export const addChat = ({
  // cuid is safer than random uuids/v4 GUIDs
  // see usecuid.org
  id = cuid(),
  msg = '',
  user = 'Anonymous',
  timeStamp = Date.now()
} = {}) => ({
  type: ADD_CHAT,
  payload: { id, msg, user, timeStamp }
});
```

As you can see above, we’re using cuid to generate random ids for each chat message, and `Date.now()` to generate the time stamp. Both of those are impure operations which are not safe to run in the reducer — but it’s perfectly OK to run them in action creators.

### Reduce Boilerplate with Action Creators

Some people think that using action creators adds boilerplate to the project. On the contrary, you’re about to see how I use them to greatly reduce the boilerplate in my reducers.

Tip: If you store your constants, reducer, and action creators all in the same file, you’ll reduce boilerplate required when you import them from separate locations.

Imagine we want to add the ability for a chat user to customize their user name and availability status. We could add a couple action type handlers to the reducer like this:

```
const chatReducer = (state = defaultState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case ADD_CHAT:
      return Object.assign({}, state, {
        chatLog: state.chatLog.concat(payload)
      });
    case CHANGE_STATUS:
      return Object.assign({}, state, {
        statusMessage: payload
      });
    case CHANGE_USERNAME:
      return Object.assign({}, state, {
        userName: payload
      });
    default: return state;
  }
};
```

For larger reducers, this could grow to a lot of boilerplate. Lots of the reducers I’ve built can get much more complex than that, with lots of redundant code. What if we could collapse all the simple property change actions together?
Turns out, that’s easy:

```
const chatReducer = (state = defaultState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case ADD_CHAT:
      return Object.assign({}, state, {
        chatLog: state.chatLog.concat(payload)
      });

    // Catch all simple changes
    case CHANGE_STATUS:
    case CHANGE_USERNAME:
      return Object.assign({}, state, payload);

    default: return state;
  }
};
```

Even with the extra spacing and the extra comment, this version is shorter — and this is only two cases. The savings can really add up.
Isn’t switch…case dangerous? I see a fall through!
You may have read somewhere that `switch` statements should be avoided, specifically so that we can avoid accidental fall through, and because the list of cases can become bloated. You may have heard that you should never use fall through intentionally, because it’s hard to catch accidental fall-through bugs. That’s all good advice, but let’s think carefully about the dangers I mentioned above:

* Reducers are composable, so case bloat is not a problem. If your list of cases gets too large, break off pieces and move them into separate reducers.
Every case body returns, so accidental fall through should never happen. None of the grouped fall through cases should have bodies other than the one performing the catch.
* Redux uses `switch..case` well. I’m officially changing my advice on the matter. As long as you follow the simple rules above (keep switches small and focused, and return from every case with its own body), `switch` statements are fine.

You may have noticed that this version requires a different payload. This is where your action creators come in:

```
export const changeStatus = (statusMessage = 'Online') => ({
  type: CHANGE_STATUS,
  payload: { statusMessage }
});

export const changeUserName = (userName = 'Anonymous') => ({
  type: CHANGE_USERNAME,
  payload: { userName }
});
```

As you can see, these action creators are making the translation between the arguments, and the state shape. But that’s not all they’re doing…

### Use ES6 Parameter Defaults for Signature Documentation

If you’re using Tern.js with an editor plugin (available for popular editors like Sublime Text and Atom), it’s going to read those ES6 default assignments and infer the required interface of your action creators, so when you’re calling them, you can get intellisense and autocomplete. This takes cognitive load off developers, because they won’t have to remember the required payload type or check the source code when they forget.
If you’re not using a type inference plugin such as Tern, TypeScript, or Flow, you should be.
Note: I prefer to rely on inference provided by default assignments visible in the function signature as opposed to type annotations, because:
You don’t have to use a Flow or TypeScript to make it work: Instead you use standard JavaScript.
If you are using TypeScript or Flow, annotations are redundant with default assignments, because both TypeScript and Flow infer the type from the default assignment.
I find it a lot more readable when there’s less syntax noise.
You get default settings, which means, even if you’re not stopping the CI build on type errors (you’d be surprised, lots of projects don’t), you’ll never have an accidental `undefined` parameter lurking in your code.

### Use Selectors for Calculated State and Decoupling

Imagine you’re building the most complex chat app in the history of chat apps. You’ve written 500k lines of code, and THEN the product team throws a new feature requirement at you that’s going to force you to change the data structure of your state.
No need to panic. You were smart enough to decouple the rest of the app from the shape of your state with selectors. Bullet: dodged.

For almost every reducer I write, I create a selector that simply exports all the variables I need to construct the view. Let’s see what that might look like for our simple chat reducer:

```
export const getViewState = state => Object.assign({}, state);
```

Yeah, I know. That’s so simple it’s not even worth a gist. You might be thinking I’m crazy now, but remember that bullet we dodged before? What if we wanted to add some calculated state, like a full list of all the users who’ve chatted during this session? Let’s call it `recentlyActiveUsers`.
This information is already stored in our current state — but not in a way that’s easy to grab. Let’s go ahead and grab it in `getViewState()`:

```
export const getViewState = state => Object.assign({}, state, {
  // return a list of users active during this session
  recentlyActiveUsers: [...new Set(state.chatLog.map(chat => chat.user))]
});
```

If you put all your calculated state in selectors, you:
Reduce the complexity of your reducers & components
Decouple the rest of your app from your state shape
Obey the single source of truth principle, even within your reducer

### Use TDD: Write Tests First

Many studies have compared test-first to test-after methodologies, and to no tests at all. The results are clear and dramatic: Most of the studies show between 40–80% reduction in shipping bugs as a result of writing tests before you implement features.
TDD can effectively cut your shipping bug density in half, and there’s plenty of evidence to back up that claim.

While writing the examples in this article, I started all of them with unit tests.
To avoid fragile tests, I created the following factories that I used to produce expectations:

```
const createChat = ({
  id = 0,
  msg = '',
  user = 'Anonymous',
  timeStamp = 1472322852680
} = {}) => ({
  id, msg, user, timeStamp
});

const createState = ({
  userName = 'Anonymous',
  chatLog = [],
  statusMessage = 'Online',
  currentChat = createChat()
} = {}) => ({
  userName, chatLog, statusMessage, currentChat
});
```

Notice these both provide default values, which means I can override properties individually to create only the data I’m interested in for any particular test.
Here’s how I used them:

```
describe('chatReducer()', ({ test }) => {
  test('with no arguments', ({ same, end }) => {
    const msg = 'should return correct default state';

    const actual = reducer();
    const expected = createState();

    same(actual, expected, msg);
    end();
  });
});
```

Note: I use tape for unit tests because of its simplicity. I also have 2–3 years’ experience with Mocha and Jasmine, and miscellaneous experience with lots of other frameworks. You should be able to adapt these principles to whatever framework you choose.

Note the style I’ve developed to describe nested tests. Probably due to my background using Jasmine and Mocha, I like to start by describing the component I’m testing in an outer block, and then in inner blocks, describe what I’m passing to the component. Inside, I make simple equivalence assertions which you can do with your testing library’s `deepEqual()` or `toEqual()` functions.

As you can see, I use isolated test state and factory functions instead of utilities like `beforeEach()` and `afterEach()`, which I avoid because they can encourage inexperienced developers to employ shared state in the test suite (that’s bad).
As you’ve probably guessed, I have three different kinds of tests for each reducer:
Direct reducer tests, which you’ve just seen an example of. These essentially test that the reducer produces the expected default state.

Action creator tests, which test each action creator by applying the reducer to the action using some predetermined state as a starting point.

Selector tests, which tests the selectors to ensure that all expected properties are there, including computed properties with expected values.

You’ve already seen a reducer test. Let’s look at some other examples.


Action Creator Tests

```
describe('addChat()', ({ test }) => {
  test('with no arguments', ({ same, end}) => {
    const msg = 'should add default chat message';

    const actual = pipe(
      () => reducer(undefined, addChat()),
      // make sure the id and timestamp are there,
      // but we don't care about the values
      state => {
        const chat = state.chatLog[0];
        chat.id = !!chat.id;
        chat.timeStamp = !!chat.timeStamp;
        return state;
      }
    )();

    const expected = Object.assign(createState(), {
      chatLog: [{
        id: true,
        user: 'Anonymous',
        msg: '',
        timeStamp: true
      }]
    });

    same(actual, expected, msg);
    end();
  });


  test('with all arguments', ({ same, end}) => {
    const msg = 'should add correct chat message';

    const actual = reducer(undefined, addChat({
      id: 1,
      user: '@JS_Cheerleader',
      msg: 'Yay!',
      timeStamp: 1472322852682
    }));
    const expected = Object.assign(createState(), {
      chatLog: [{
        id: 1,
        user: '@JS_Cheerleader',
        msg: 'Yay!',
        timeStamp: 1472322852682
      }]
    });

    same(actual, expected, msg);
    end();
  });
});
```

This example is interesting for a couple of reasons. The `addChat()` action creator is not pure. That means that unless you pass in value overrides, you can’t make a specific expectation for all the properties produced. To deal with this, we used a pipe, which I sometimes use to avoid creating extra variables that I don’t really need. I used it to ignore the generated values. We still make sure they exist, but we don’t care what the values are. Note that I’m not even checking the type. We’re trusting type inference and default values to take care of that.
A pipe is a functional utility that lets you shuttle some input value through a series of functions which each take the output of the previous function and transform it in some way. I use lodash pipe from `lodash/fp/pipe`, which is an alias for `lodash/flow`. Interestingly, `pipe()` itself can be created with a reducer function:

```
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const fn1 = s => s.toLowerCase();
const fn2 = s => s.split('').reverse().join('');
const fn3 = s => s + '!'

const newFunc = pipe(fn1, fn2, fn3);
const result = newFunc('Time'); // emit!
```

I tend to use `pipe()` a lot in the reducer files as well to simplify state transitions. All state transitions are ultimately data flows moving from one data representation to the next. That’s what `pipe()` is good at.
Note that the action creator lets us override all the default values, too, so we can pass specific ids and time stamps and test for specific values.

Selector Tests

Lastly, we test the state selectors and make sure that computed values are correct and that everything is as it should be:

```
describe('getViewState', ({ test }) => {
  test('with chats', ({ same, end }) => {
    const msg = 'should return the state needed to render';
    const chats = [
      createChat({
        id: 2,
        user: 'Bender',
        msg: 'Does Barry Manilow know you raid his wardrobe?',
        timeStamp: 451671300000
      }),
      createChat({
        id: 2,
        user: 'Andrew',
        msg: `Hey let's watch the mouth, huh?`,
        timeStamp: 451671480000 }),
      createChat({
        id: 1,
        user: 'Brian',
        msg: `We accept the fact that we had to sacrifice a whole Saturday in
              detention for whatever it was that we did wrong.`,
        timeStamp: 451692000000
      })
    ];

    const state = chats.map(addChat).reduce(reducer, reducer());

    const actual = getViewState(state);
    const expected = Object.assign(createState(), {
      chatLog: chats,
      recentlyActiveUsers: ['Bender', 'Andrew', 'Brian']
    });

    same(actual, expected, msg);
    end();
  });
});
```

Notice that in this test, we’ve used `Array.prototype.reduce()` to reduce over a few example `addChat()` actions. One of the great things about Redux reducers is that they’re just regular reducer functions, which means you can do anything with them that you’d do with any other reducer function.
Our `expected` value checks that all our chat objects are in the log, and that the recently active users are listed correctly.
Not much else to say about that.

Redux Rules

If you use Redux correctly, you’re going to get major benefits:
* Eliminate timing dependency bugs
* Enable deterministic view renders
* Enable deterministic state reproduction
* Enable easy undo/redo features
* Simplify debugging
* Become a time traveler

But for any of that to work, you have to remember some rules:
* Reducers must be pure functions
* Reducers must be the single source of truth for their state
* Reducer state should always be serializable
* Reducer state should not contain functions

Also keep in mind:
* Some Apps don’t need Redux
* Use constants for action types
* Use action creators to decouple action logic from dispatch callers
* Use ES6 parameter defaults for self-describing signatures
* Use selectors for calculated state and decoupling

Always use TDD!


// ---


## Redux App Code Structure


Our approach starts from the need to isolate the React code into a single folder — called views — and the redux code into a separate folder — called redux. This first level split gives us the flexibility to organize the two separate parts of the app completely different.
Inside the views folder, we prefer a function-first approach in structuring files. This feels very natural in the context of React: pages, layouts, components, enhancers etc.


### duck
-- actions.js
-- index.js
-- operation.js
-- reducers.js
-- selectors.js
-- tests.js
-- types.js
-- utils.js

#### Types

The types file contains the names of the actions that you are dispatching in your application. As a good practice, you should try to scope the names based on the feature they belong to. This helps when debugging more complex applications.

```
const QUACK = "app/duck/QUACK";
const SWIM = "app/duck/SWIM";

export default {
    QUACK,
    SWIM
};
```

#### Actions

This file contains all the action creator functions.

```
import types from "./types";

const quack = ( ) => ( {
    type: types.QUACK
} );

const swim = ( distance ) => ( {
    type: types.SWIM,
    payload: {
        distance
    }
} );

export default {
    swim,
    quack
};
```

Notice how all the actions are represented by functions, even if they are not parametrized. A consistent approach is more than needed in a large codebase.

#### Operations

To represent chained operations you need a redux middleware to enhance the dispatch function. Some popular examples are: redux-thunk, redux-saga or redux-observable.
In our case, we use redux-thunk. We want to separate the thunks from the action creators, even with the cost of writing extra code. So we define an operation as a wrapper over actions.
If the operation only dispatches a single action — doesn’t actually use redux-thunk — we forward the action creator function. If the operation uses a thunk, it can dispatch many actions and chain them with promises.

```
import actions from "./actions";

// This is a link to an action defined in actions.js.
const simpleQuack = actions.quack;

// This is a thunk which dispatches multiple actions from actions.js
const complexQuack = ( distance ) => ( dispatch ) => {
    dispatch( actions.quack( ) ).then( ( ) => {
        dispatch( actions.swim( distance ) );
        dispatch( /* any action */ );
    } );
}

export default {
    simpleQuack,
    complexQuack
};
```

Call them operations, thunks, sagas, epics, it’s your choice. Just find a naming convention and stick with it.

At the end, when we discuss the index, we’ll see that the operations are part of the public interface of the duck. Actions are encapsulated, operations are exposed.

#### Reducers

If a feature has more facets, you should definitely use multiple reducers to handle different parts of the state shape. Additionally, don’t be afraid to use combineReducers as much as needed. This gives you a lot of flexibility when working with a complex state shape.

```
import { combineReducers } from "redux";
import types from "./types";

/* State Shape
{
    quacking: bool,
    distance: number
}
*/

const quackReducer = ( state = false, action ) => {
    switch( action.type ) {
        case types.QUACK: return true;
        /* ... */
        default: return state;
    }
}

const distanceReducer = ( state = 0, action ) => {
    switch( action.type ) {
        case types.SWIM: return state + action.payload.distance;
        /* ... */
        default: return state;
    }
}

const reducer = combineReducers( {
    quacking: quackReducer,
    distance: distanceReducer
} );

export default reducer;
```

In a large scale application, your state tree will be at least 3 level deep. Reducer functions should be as small as possible and handle only simple data constructs. The combineReducers utility function is all you need to build a flexible and maintainable state shape.

Check out the complete example project and look how combineReducers is used. Once in the reducers.js files and then in the store.js file, where we put together the entire state tree.

#### Selectors

Together with the operations, the selectors are part of the public interface of a duck. The split between operations and selectors resembles the CQRS pattern.
Selector functions take a slice of the application state and return some data based on that. They never introduce any changes to the application state.

```
function checkIfDuckIsInRange( duck ) {
    return duck.distance > 1000;
}

export default {
    checkIfDuckIsInRange
};
```

#### Index

This file specifies what gets exported from the duck folder. It will:
* export as default the reducer function of the duck.
* export as named exports the selectors and the operations.
* export the types if they are needed in other ducks.

```
import reducer from "./reducers";

export { default as duckSelectors } from "./selectors";
export { default as duckOperations } from "./operations";
export { default as duckTypes } from "./types";

export default reducer;
```

#### Tests

A benefit of using Redux and the ducks structure is that you can write your tests next to the code you are testing.

Testing your Redux code is fairly straight-forward:

```
import expect from "expect.js";
import reducer from "./reducers";
import actions from "./actions";

describe( "duck reducer", function( ) {
    describe( "quack", function( ) {
        const quack = actions.quack( );
        const initialState = false;

        const result = reducer( initialState, quack );

        it( "should quack", function( ) {
            expect( result ).to.be( true ) ;
        } );
    } );
} );
```

Inside this file you can write tests for reducers, operations, selectors, etc.
I could write a whole different article about the benefits of testing your code, there are so many of them. Just do it!
