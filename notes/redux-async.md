[WIP - Random notes] 

## Async Actions

You can return things from thunks. Thunks are basically async action creators. Returning promises from thunks is useful, because then you can chain together async functions.

Of course, after using many thunks and promises, and having errors constantly being swallowed, I really wish I had tried out something like redux-saga instead.

// ----

When you call an asynchronous API, there are two crucial moments in time: the moment you start the call, and the moment when you receive an answer (or a timeout).

Each of these two moments usually require a change in the application state; to do that, you need to dispatch normal actions that will be processed by reducers synchronously. Usually, for any API request you'll want to dispatch at least three different kinds of actions:

- An action informing the reducers that the request began. The reducers may handle this action by toggling an isFetching flag in the state. This way the UI knows it's time to show a spinner.

- An action informing the reducers that the request finished successfully. The reducers may handle this action by merging the new data into the state they manage and resetting isFetching. The UI would hide the spinner, and display the fetched data.

- An action informing the reducers that the request failed. The reducers may handle this action by resetting isFetching. Additionally, some reducers may want to store the error message so the UI can display it.


# Async Flow

Perhaps the trickiest part is making async requests and handling responses. While there are many examples, there is no well established pattern for making async requests and handling responses in Redux apps(just yet).

Without middleware, Redux store only supports synchronous data flow. This is what you get by default with createStore().

You may enhance createStore() with applyMiddleware(). It is not required, but it lets you express asynchronous actions in a convenient way.

Asynchronous middleware like redux-thunk or redux-promise wraps the store's dispatch() method and allows you to dispatch something other than actions, for example, functions or Promises. Any middleware you use can then interpret anything you dispatch, and in turn, can pass actions to the next middleware in the chain. For example, a Promise middleware can intercept Promises and dispatch a pair of begin/end actions asynchronously in response to each Promise.

When the last middleware in the chain dispatches an action, it has to be a plain object. This is when the synchronous Redux data flow takes place.

Check out the full source code for the async example.

### Async Action Creators

Finally, how do we use the synchronous action creators we defined earlier together with network requests? The standard way to do it with Redux is to use the Redux Thunk middleware. It comes in a separate package called redux-thunk. We'll explain how middleware works in general later; for now, there is just one important thing you need to know: by using this specific middleware, an action creator can return a function instead of an action object. This way, the action creator becomes a thunk.

When an action creator returns a function, that function will get executed by the Redux Thunk middleware. This function doesn't need to be pure; it is thus allowed to have side effects, including executing asynchronous API calls. The function can also dispatch actions—like those synchronous actions we defined earlier.

We can still define these special thunk action creators inside our actions.js file:

actions.js

```
import fetch from 'isomorphic-fetch'

export const REQUEST_POSTS = 'REQUEST_POSTS'
function requestPosts(subreddit) {
  return {
    type: REQUEST_POSTS,
    subreddit
  }
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS'
function receivePosts(subreddit, json) {
  return {
    type: RECEIVE_POSTS,
    subreddit,
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now()
  }
}

// Meet our first thunk action creator!
// Though its insides are different, you would use it just like any other action creator:
// store.dispatch(fetchPosts('reactjs'))

export function fetchPosts(subreddit) {

  // Thunk middleware knows how to handle functions.
  // It passes the dispatch method as an argument to the function,
  // thus making it able to dispatch actions itself.

  return function (dispatch) {

    // First dispatch: the app state is updated to inform
    // that the API call is starting.

    dispatch(requestPosts(subreddit))

    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.

    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.

    return fetch(`https://www.reddit.com/r/${subreddit}.json`)
      .then(response => response.json())
      .then(json =>

        // We can dispatch many times!
        // Here, we update the app state with the results of the API call.

        dispatch(receivePosts(subreddit, json))
      )

      // In a real world app, you also want to
      // catch any error in the network call.
  }
}
```

### Note on fetch

We use fetch API in the examples. It is a new API for making network requests that replaces XMLHttpRequest for most common needs. Because most browsers don't yet support it natively, we suggest that you use isomorphic-fetch library:

```
// Do this in every file where you use `fetch`
import fetch from 'isomorphic-fetch'
```

Internally, it uses whatwg-fetch polyfill on the client, and node-fetch on the server, so you won't need to change API calls if you change your app to be universal.

Be aware that any fetch polyfill assumes a Promise polyfill is already present. The easiest way to ensure you have a Promise polyfill is to enable Babel's ES6 polyfill in your entry point before any other code runs:

// Do this once before any other code in your app
import 'babel-polyfill'
How do we include the Redux Thunk middleware in the dispatch mechanism? We use the applyMiddleware() store enhancer from Redux, as shown below:

index.js
```
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware } from 'redux'
import { selectSubreddit, fetchPosts } from './actions'
import rootReducer from './reducers'

const loggerMiddleware = createLogger()

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
    loggerMiddleware // neat middleware that logs actions
  )
)

store.dispatch(selectSubreddit('reactjs'))
store.dispatch(fetchPosts('reactjs')).then(() =>
  console.log(store.getState())
)
The nice thing about thunks is that they can dispatch results of each other:
```

actions.js

```
import fetch from 'isomorphic-fetch'

export const REQUEST_POSTS = 'REQUEST_POSTS'
function requestPosts(subreddit) {
  return {
    type: REQUEST_POSTS,
    subreddit
  }
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS'
function receivePosts(subreddit, json) {
  return {
    type: RECEIVE_POSTS,
    subreddit,
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now()
  }
}

function fetchPosts(subreddit) {
  return dispatch => {
    dispatch(requestPosts(subreddit))
    return fetch(`https://www.reddit.com/r/${subreddit}.json`)
      .then(response => response.json())
      .then(json => dispatch(receivePosts(subreddit, json)))
  }
}

function shouldFetchPosts(state, subreddit) {
  const posts = state.postsBySubreddit[subreddit]
  if (!posts) {
    return true
  } else if (posts.isFetching) {
    return false
  } else {
    return posts.didInvalidate
  }
}

export function fetchPostsIfNeeded(subreddit) {

  // Note that the function also receives getState()
  // which lets you choose what to dispatch next.

  // This is useful for avoiding a network request if
  // a cached value is already available.

  return (dispatch, getState) => {
    if (shouldFetchPosts(getState(), subreddit)) {
      // Dispatch a thunk from thunk!
      return dispatch(fetchPosts(subreddit))
    } else {
      // Let the calling code know there's nothing to wait for.
      return Promise.resolve()
    }
  }
}
```


This lets us write more sophisticated async control flow gradually, while the consuming code can stay pretty much the same:

index.js

```
store.dispatch(fetchPostsIfNeeded('reactjs')).then(() =>
  console.log(store.getState())
)
```


---


###  PATTERN: Dealing With Async Actions

If component is loading an object(e.g. list of Posts) via AJAX call to the server, that object’s state should keep track of all the potential states. [source](https://medium.com/@rajaraodv/a-guide-for-building-a-react-redux-crud-app-7fe0b8943d0f)

Initial state for such objects should look like: 

`{objName: {obj:null, loading: false, error:null}}`.

[source](https://medium.com/@rajaraodv/a-guide-for-building-a-react-redux-crud-app-7fe0b8943d0f)

Further, such components should dispatch up to 4 actions such as  `“FETCH_OBJ”`(for loading), `“FETCH_OBJ_SUCCESS”`, `“FETCH_OBJ_FAILURE”` and `“OBJ_RESET” `(to cleanup dirty previous state). 

1. FETCH_OBJ — Dispatch this to make the server request and also let other components know we are loading. This helps current/other components show “loading” or hide or do something. 
2. FETCH_OBJ_SUCCESS: Dispatch this when you get successful response. This is to show the actual data and also to cancel “loading”
3. FETCH_OBJ_FAILURE: Dispatch this when you get a failed response. This is to show some error message and also to cancel “loading”.
4. RESET_OBJ: Dispatch this to reset the component’s state after success/failure. This is optional but can be useful when you want to reuse a “dirty” component from previous AJAX request.

| ACTION  | PAYLOAD   |  RESULTING STATE |
| FETCH_OBJ  | `dispatch({“type”: “FETCH_POSTS”, loading: true})`  | `{postList: {posts:null, error: null, loading: true}}`  |
| FETCH_OBJ_SUCCESS  | `dispatch({"type": "FETCH_POSTS_SUCCESS", "posts":[post1, post2])`  | `{postsList:{posts:[post1, post2], error:null, loading: false}}`  |
| FETCH_OBJ_FAILURE  | `dispatch({"type": "FETCH_POSTS_FAILURE", "error": "Error message"})`  | `{postList:{posts:null, error:{msg: "Error msg"}, loading: false}}`  |
| RESET_OBJ  | `dispatch({"type": "RESET_POST", loading: false, "post": null, "error": "Error message"})`  | `{postList:{post:null, error:null, loading: false}}`  |

(new state: state once Redux gets this and passes it through reducers)


### STEP 3 — List State and Actions For Each Component (AND For Each Phase)

Take a look at each component one by one and each phase and list of state and actions.

We have 4 components: 1. PostsList, 2. PostDetails 3. PostForm and 4. Header components.

3.1 PostList Component — List State And Actions

States:
List out various data that may change the display of the component in all phases of the component.
Shows list of Posts. Let’s call the state as “posts” (an array).
Shows “Loading..”, if it’s in the processing fetching the posts. Let’s call this state “loading”(boolean)
Shows “Error” if there is an error. Let’s call this state as “error”(null or error info).
Since all the above are related to PostList, let’s put them in a single state object called postList.
{ postsList: {posts: [], error:null, loading: false} //initial state
Actions:
This component makes a “AJAX” call to load posts, so we’ll use the above mentioned pattern and create 4 actions.
1.Asks server for list of posts. Let’s call this action as: “FETCH_POSTS”.

```
export function fetchPosts() {
 const request = axios.get(`${ROOT_URL}/posts`);
return { type: FETCH_POSTS, payload: request };
}
```

2.Tells every component that it received posts (success case). Let’s call this “FETCH_POSTS_SUCCESS”

```
export function fetchPostsSuccess(posts) {
 return {
 type: FETCH_POSTS_SUCCESS,
 payload: posts
 };
}
```

3.Tells every component that there was an error(failure case). Let’s call this “FETCH_POSTS_FAILURE”
```
export function fetchPostsFailure(error) {
 return {
 type: FETCH_POSTS_FAILURE,
 payload: error
 };
}
```

4. Resetting data is not required because this is the 1st page (you’ll see how this is useful in other 2 pages)
3.2 PostDetails Component — List State And Actions
Note: You can click on the pictures to zoom and read

3.3 PostForm Component — State And Actions

3.4 Header Component — List State And Actions

### STEP 4 — Create Action Creators For Each Action

We have a total of 12 actions(4 actions x 3 pages), create action creators for each one. Please see the source code here.
```
//Example Action creators...
export function fetchPosts() {
 const request = axios.get(`${ROOT_URL}/posts`);
return {
 type: FETCH_POSTS,
 payload: request
 };
}
export function fetchPostsSuccess(posts) {
 return {
 type: FETCH_POSTS_SUCCESS,
 payload: posts
 };
}
...
```

Redux Term: “Reducers”
Reducers are functions that take “state” from Redux and “action” JSON object and returns a new “state” to be stored back in Redux.

1. Reducer functions are called by the “Container” containers when there is a user or server action.
2. If the reducer changes the state, Redux passes the new state to each component and React re-renders each component
The below function takes the current "postsList" inside "...state" and merges new "postList" and creates a **new** state(json), if the 

```
action is "FECTH_POSTS_SUCCESS"
case FETCH_POSTS_SUCCESS:
 return { …state, postsList: {posts: action.payload, error:null,
                              loading: false}
        };
```

### STEP 5 — Write Reducers For Each Action

We have 12 actions, we need to write reducers for each one of them.
Please look at the source code for details here.
Redux Term: “Presentational” and “Container” Components
Keeping React and Redux logic inside each component can make it messy, so Redux recommends creating a dummy presentation only component called “Presentational” component and a parent wrapper component called “Container” component that deals w/ Redux, dispatch “Actions” and more.

The parent Container then passes the data to the presentational component, handle events, deal with React on behalf of Presentational component.

Legend: Yellow dotted lines = “Presentational” components. Black dotted lines = “Container” components.
STEP 6 — Implement Every Presentational Component
We have 4 components: PostsList, PostDetails, PostForm and Header. Let’s create presentational components for each one.
6.1 Implement Presentational Component — PostsList
Note: You can click on the pictures to zoom and read

6.2 Implement Presentational Component — PostDetails

6.3 Implement Presentational Component — PostForm

Note: In the actual code, I am using the awesome redux-form library for form-validation. I’ll blog about it in a different post.
6.4 Implement Presentational Component — Header

Note: You can click on the pictures to zoom and read
STEP 7 — Create Container Component For Some/All Presentational Component
We have 4 components: PostList, PostDetails, PostForm and Header. Let’s create container components for each one.
7.1 Create Container Component — PostsListContainer

7.2 Create Container Component — PostDetailsContainer

7.3 Create Container Component — PostFormContainer

7.4 Create Container Component — HeaderContainer

STEP 8 — Finally Bring Them All Together
Below code is a simplified version of wiring everything together. Please see source code of the main index.js and reducers.js to get started.
import React from 'react'; <-- Main React lib
import ReactDOM from 'react-dom'; <-- Main React DOM lib
import { Provider } from 'react-redux';<-- Injects Redux to comps
import { createStore, applyMiddleware } from 'redux';<- Redux
import { Router, browserHistory } from 'react-router';<- Navigation
import reducers from './reducers'; <- Import reducers
import promise from 'redux-promise';
//Configure middleware w/ redux-promise for AJAX requests
const createStoreWithMiddleware = applyMiddleware(
  promise
)(createStore);
const store = createStoreWithMiddleware(reducers);
ReactDOM.render(
  <Provider store={store}> <- Inject global redux state to comps
    <Router history={browserHistory}>
       <Route path=”/” component={App}> <- Wrapper for all pages
         <IndexRoute component={PostsIndex} /> <-wrapper Index page
         <Route path=”posts/new” component={PostsNew} /> <- New page
         <Route path=”posts/:id” component={PostsShow} /> <-Details
       </Route>
    </Router>
</Provider>
  , document.getElementById('body'));
That’s it for now!


## Different Async Approaches


https://medium.com/react-native-training/redux-4-ways-95a130da0cdc


---

https://github.com/markerikson/react-redux-links/blob/master/redux-side-effects.md

### Redux Side Effects

### Basic Async Concepts

Stack Overflow: Dispatching Redux Actions with a Timeout
http://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559
Dan Abramov explains the basics of managing async behavior in Redux, walking through a progressive series of approaches (inline async calls, async action creators, thunk middleware).

Stack Overflow: Why do we need middleware for async flow in Redux?
http://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594
Dan Abramov gives reasons for using thunks and async middleware, and some useful patterns for using thunks.

Pure Functionality and Side Effects with Redux
https://blog.hivejs.org/building-the-ui-2/
An overview of what side effects are, how they fit into Redux, and several approaches for managing them.

"Async Redux workflow: calling actions outside Redux?"
https://www.reddit.com/r/reactjs/comments/4upe9t/async_redux_workflow_calling_actions_outside_redux/d5sgy5s?context=3
A comment explaining why using action creator functions is a good practice

Why doesn't Redux support AJAX out of the box?
http://goshakkk.name/redux-no-ajax-by-default/
Looks at how AJAX calls fit into a Redux application

Adding Customized Asynchrony to Redux
https://anyperk.engineering/im-lauren-and-i-m-a-frontend-apprentice-here-at-anyperk-a1a40106d231
A quick introduction to some of the libraries that can be used to manage asynchronous behavior in Redux.

### Thunk

A Dummy's Guide to Redux and Thunk in React
https://medium.com/@stowball/a-dummys-guide-to-redux-and-thunk-in-react-d8904a7005d3
A tutorial that shows how to take a React component that does its own data fetching, and rework it to use accept data from Redux and use a thunk action creator instead.

What the heck is a "thunk"?
https://daveceddia.com/what-is-a-thunk/
A quick explanation for what the word "thunk" means in general, and for Redux specifically..

Understanding how redux-thunk works
https://medium.com/@gethylgeorge/understanding-how-redux-thunk-works-72de3bdebc50
An attempt to explain both redux-thunk and Redux's applyMiddleware enhancer, by rewriting the original implementations to add logging and rework names for ease of understanding.

Async Actions with Redux Thunk Demystified
http://blog.jakoblind.no/2017/04/25/async-actions-with-redux-thunk-demystified/
A quick look at the source code for redux-thunk, how it works, and how to use it.

### Side Effect Approach Comparisons

Redux side effects and you
https://medium.com/javascript-and-opinions/redux-side-effects-and-you-66f2e0842fc3
Thoughts on the proliferation of new side effect libs for Redux, and some comparisons of the commonly used approaches.

"Controversial opinion: redux-thunk is too powerful"
https://twitter.com/intelligibabble/status/800103510624727040
https://twitter.com/dan_abramov/status/800310164792414208
Some discussion on the pros and cons of redux-thunk's flexibility and usage, as well as possible issues with multiple dispatches in a row.

Idiomatic Redux: Thoughts on Thunks, Sagas, Abstractions, and Reusability
http://blog.isquaredsoftware.com/2017/01/idiomatic-redux-thoughts-on-thunks-sagas-abstraction-and-reusability/
A response to several "thunks are bad" concerns, arguing that thunks (and sagas) are still a valid approach for managing complex sync logic and async side effects.

What are the benefits, pros, and cons of redux-thunk over redux-saga? https://hashnode.com/post/what-are-the-benefits-of-redux-thunk-over-redux-saga-what-pros-and-cons-do-they-have-over-each-other-ciqvyydh7065w3g53ffalif61
An excellent discussion of where side effects belong in a Redux app, and how thunks and sagas can be used to handle async logic.

Keeping Redux in check
https://medium.com/@georgeleeme/keeping-redux-in-check-78534504b215
Some tips on use of the Flux Standard Actions convention, and comparison of using redux-thunk vs redux-promise.

"Argument: We should switch from thunks to sagas"
http://en.arguman.org/we-should-switch-from-redux-thunk-to-redux-saga
An debate flowchart with arguments for and against using thunks and sagas

The Evolution of Redux Action Creators
https://medium.com/@northerneyes/the-evolution-of-redux-action-creators-2973018bf2ae
A comparison of ways to make action creation testable, looking at redux-thunk, a custom thunk-like middleware, and redux-saga

What is the right way to do asynchronous operations in Redux?
https://decembersoft.com/posts/what-is-the-right-way-to-do-asynchronous-operations-in-redux/
An excellent look at the most popular libraries for Redux side effects, with comparisons of how each one works.

Redux 4 Ways
https://medium.com/react-native-training/redux-4-ways-95a130da0cdc
Side-by-side comparisons of implementing some basic data fetching using thunks, sagas, observables, and a promise middleware

3 Common Approaches to Side-Effects in Redux
https://goshakkk.name/redux-side-effect-approaches/
An overview of what "side effects" are, how they relate to Redux, and the most common ways to handle side effects in a Redux app


Redux: Thunk vs Saga
http://blog.jakegardner.me/redux-thunk-vs-saga/
A couple quick examples showing how to use thunks and sagas for the same task


#### Sagas

Master Complex Redux Workflows with Sagas
http://konkle.us/master-complex-redux-workflows-with-sagas/
Describes what sagas are, how Redux-Saga uses generators to run sagas, some potential concerns, and how to use them.

Stack Overflow: Why do we need middleware for async flux in Redux?
http://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34623840#34623840
A comparison of imperative thunks vs declarative sagas, and some of the benefits that sagas can provide for testing and decoupling of logic.

Managing Side Effects in React + Redux using Sagas
http://jaysoo.ca/2016/01/03/managing-processes-in-redux-using-sagas/
Demonstrates various ways to implement a Timer app as a state machine, including using sagas to manage the periodic updates.

Persist Redux State By Using Sagas
http://engineering.invisionapp.com/post/persist-redux-state-by-using-sagas/
A very well-written set of examples showing how to use sagas to implement some complex store persistence logic.

Handling async in Redux with Sagas
http://wecodetheweb.com/2016/10/01/handling-async-in-redux-with-sagas/
Covers the basic concepts and syntax of sagas, and how they can improve testability. (Updated version of a 2015 post, covering the latest version of redux-saga.)

Redux Saga conceptual diagram
https://twitter.com/kuy/status/731484272234663937
A useful diagram illustrating the various things a saga can do

"Redux Sagas benefits?"
https://www.reddit.com/r/reactjs/comments/4ng8rr/redux_sagas_benefits/
Discussion of when and why you might want to use sagas, with some great examples in the comments.

Manage Side Effects Efficiently with Redux Saga
https://youtu.be/QJVdcIlqGwc
A presentation describing the concepts of generators and sagas.

Redux Saga conceptual diagram
https://qiita-image-store.s3.amazonaws.com/0/69860/8cc1a873-c675-9009-570d-9684da4a704f.png
A nifty diagram from @kuy illustrating the general interaction of Redux Saga's async flow operators

Async Operations using Redux-Saga
https://medium.com/@andresmijares25/async-operations-using-redux-saga-2ba02ae077b3
An example of using Redux-Saga to coordinate multiple async calls based on another article's flight data scenario.

Should I use redux-saga or not?
https://speakerdeck.com/kuy/should-i-use-redux-saga-or-not
A presentation from Yuki Kodama, comparing side effect approaches. In Japanese, but still has a number of useful diagrams that can be understood by English speakers.

Interview with Redux-Saga Author Yassine Eloaufi
http://survivejs.com/blog/redux-saga-interview/
An interview with the author of Redux-Saga, where he describes some of its concepts and history

Lazy registration with Redux and Sagas
http://goshakkk.name/lazy-auth-redux-saga-flow/
Examples of using Redux-Saga to implement an async series of user interactions.

A Saga that led Xero to Redux
https://devblog.xero.com/a-saga-that-led-xero-to-redux-aa1361b9a800
Examples of how Xero's async logic for their dashboard evolved over team, from nested callbacks to promises to Redux with sagas

The Three 'R's: Refactoring, React, and Redux for robust async JS
https://devblog.xero.com/the-three-rs-refactoring-react-and-redux-for-robust-async-js-252648a8632f
More information from Xero on how they have used sagas for async workflows, including splitting code up into smaller sagas that can be composed.

4 Quick Tips for Managing Many Sagas in a React-Redux-Saga App
https://decembersoft.com/posts/4-tips-for-managing-many-sagas-in-a-react-redux-saga-app/
Some useful suggestions for structuring and organizing sagas

Implementing feature flags using React and Redux Saga
http://blog.launchdarkly.com/implementing-feature-flags-in-single-page-apps-using-react-and-redux-saga/
A quick example of how to use sagas to manage feature flag API requests

### Other Side Effect Approaches

Epic Middleware in Redux
https://medium.com/@kevinsalter/epic-middleware-in-redux-e4385b6ff7c6
Discussion and examples of using Redux-Observable and RxJS to create "epics" which can transform actions.

Better async Redux
https://blog.scottnonnenberg.com/better-async-redux-i18n-and-node-js-versions/
Comparisons and examples of using Redux-Loop for declarative side effects

Action Streams and Redux
https://medium.com/@markusctz/action-streams-and-redux-77f8ac99c2e9
Examples of how Redux-Observable can simplify complex async logic

A simplified approach to calling APIs with Redux
http://www.sohamkamani.com/blog/2016/06/05/redux-apis/
A well-written example of creating a "data service" middleware that handles API requests, as well as examples of handling some request status state.

Elm Architecture with Redux
https://smallbusinessforum.co/elm-architecture-with-react-redux-redux-loop-645a67070b1a
A short look at how Elm handles side effects, and how Redux-Loop can help implement a similar approach in Redux

----

http://blog.isquaredsoftware.com/series/practical-redux/

Practical Redux, Part 8: Form Draft Data Management
Generic entity reducer logic, form current/draft data management, and form reset handling

Practical Redux, Part 7: Form Change Handling, Data Editing, and Feature Reducers
Techniques for managing form events, data editing capabilities, and reducer structures for features

Practical Redux, Part 6: Connected Lists, Forms, and Performance
Connecting lists and forms, performance guidelines, editing features, and UI state

Practical Redux, Part 5: Loading and Displaying Data
Sourcemaps, sample data, basic data management, and selection handling

Practical Redux, Part 4: UI Layout and Project Structure
UI libraries, folder structures, tab panel management, and initial layout with mock contents

Practical Redux, Part 3: Project Planning and Setup
Initial steps for our sample application

Practical Redux, Part 2: Redux-ORM Concepts and Techniques
Useful techniques for using Redux-ORM to help manage your normalized state, part 2:
In-depth examples of how I use Redux-ORM

Practical Redux, Part 1: Redux-ORM Basics
Useful techniques for using Redux-ORM to help manage your normalized state, part 1:
Redux-ORM use cases and basic usage

Practical Redux, Part 0: Introduction
First in a series covering Redux techniques based on my own experience




## Asynchronous Middleware

Redux middleware can be used to work with actions that involve some sort of asynchronous execution. 

In particular look at redux-thunk for more details. Let’s say you have an action creator that has some async functionality to get stock quote information:

```
function fetchQuote(symbol) {
   requestQuote(symbol);
   return fetch(`http://www.google.com/finance/info?q=${symbol}`)
      .then(req => req.json())
      .then(json => showCurrentQuote(symbol, json));

}
```

There is no obvious way here to dispatch an action that would be returned from the fetch which is Promise based. Plus we do not have a handle to the dispatch function. Therefore, we can use the redux-thunk middleware to defer execution of these operations. By wrapping the execution in a function you can delay this execution.

```
function fetchQuote(symbol) {
  return dispatch => {
    dispatch(requestQuote(symbol));
    return fetch(`http://www.google.com/finance/info?q=${symbol}`)
      .then(req => req.json())
      .then(json => dispatch(showCurrentQuote(symbol, json)));
  }
}
```

Remember that the applyMiddleware function will inject the dispatch and the getState functions as parameters into the redux-thunk middleware. Now you can dispatch the resultant action objects to your store which contains reducers. Here is the middleware function for redux-thunk that does this for you:

```
export default function thunkMiddleware({ dispatch, getState }) {
  return next =>
     action =>
       typeof action === ‘function’ ?
         action(dispatch, getState) :
         next(action);
}
```


This should be familiar to you now that you have already seen how Redux middleware works. If the action is a function it will be called with the dispatch and getState function. Otherwise, this is a normal action that needs to be dispatched to the store. Also check out the Async example in the Redux repo for more details. Another middleware alternative for working with Promises in your actions is redux-promise. I think it is just a matter of preference around which middleware solution you choose.

