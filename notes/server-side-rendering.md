state rehydration?
Yes. Let’s fix it.
The problem is that we added async actions, but don’t wait for them to complete on the server before sending out state to the client. You might think this doesn’t matter much, since we can just display a loading screen on the client. Better than hanging on the server right?
