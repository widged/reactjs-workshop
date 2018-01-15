
### Note about Server Rendering

Async action creators are especially convenient for server rendering. You can create a store, dispatch a single async action creator that dispatches other async action creators to fetch data for a whole section of your app, and only render after the Promise it returns, completes. Then your store will already be hydrated with the state you need before rendering.


### state rehydration?

The problem is that we added async actions, but don’t wait for them to complete on the server before sending out state to the client. You might think this doesn’t matter much, since we can just display a loading screen on the client. Better than hanging on the server right?
