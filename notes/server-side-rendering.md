
### Note about Server Rendering

Async action creators are especially convenient for server rendering. You can create a store, dispatch a single async action creator that dispatches other async action creators to fetch data for a whole section of your app, and only render after the Promise it returns, completes. Then your store will already be hydrated with the state you need before rendering.

Thunk middleware isn't the only way to orchestrate asynchronous actions in Redux:

* You can use redux-promise or redux-promise-middleware to dispatch Promises instead of functions.
* You can use redux-observable to dispatch Observables.
* You can use the redux-saga middleware to build more complex asynchronous actions.
* You can use the redux-pack middleware to dispatch promise-based asynchronous actions.
* You can even write a custom middleware to describe calls to your API, like the real world example does.

It is up to you to try a few options, choose a convention you like, and follow it, whether with, or without the middleware.


### state rehydration?

The problem is that we added async actions, but don’t wait for them to complete on the server before sending out state to the client. You might think this doesn’t matter much, since we can just display a loading screen on the client. Better than hanging on the server right?
