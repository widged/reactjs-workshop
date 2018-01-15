[WIP - Random notes] 

# Redux : Connect

The react-redux library `connect()` method connects a React component to a Redux store. It generates a container component. It takes care of subscribing (responding to state changes) and dispatching for you without having to hook into the React component lifecycle methods (componentDidMount and componentWillUnmount)

Simply think of connect as a wrapper component that takes props as parameters, which in return supplies actions and state to the provided React component via props and automatically triggers a re-render when the props change.

Any component wrapped with connect() call will receive a dispatch function as a prop, and any state it needs from the global state. In most cases you will only pass the first argument to connect(), which is a function we call a selector. This function takes the global Redux store’s state, and returns the props you need for the component. In the simplest case, you can just return the state given to you (i.e. pass identity function), but you may also wish to transform it first. [source](https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f)

Connect is a facade around `connectAdvanced`, providing a convenient API for the most common use cases.

It does not modify the component class passed to it; instead, it returns a new, connected component class for you to use.




It has the following API
-	mapStateToProps
-	mapDispatchToProps
-	mergeProps — optional
-	options — optional


## API

https://github.com/reactjs/react-redux/blob/master/docs/api.md

## `connect()`


connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])(component)

Connect returns a function that accepts a react component. It has 4 arguments.

* mapStateToProps - function, mandatory
* mapDispatchToProps - function or object, mandotory
* mergeProps — function, optional
* options — object, optional

When applied to a component, it returns a component connected to the store that renders the specified component.

#### mapStateToProps

The function `mapStateToProps` connects state from the store to corresponding props. This make it possible to access your reducer state objects from within your React components.
As connect subscribes to the store automatically, a new render of the connected component triggered anytime a change of state triggers a change of value for any of the properties passed to the component.

`mapStateToProps` returns an object, where keys are the prop names passed to the connected component and the value a reducer function.

```
const mapStateToProps = ({ reducer1, reducer2}) => ({reducer1, reducer2 });
```
//------

To use connect(), you need to define a special function called `mapStateToProps` that tells how to transform the current Redux store state into the props you want to pass to a presentational component you are wrapping. For example, `VisibleTodoList` needs to calculate todos to pass to the `TodoList`, so we define a function that filters the `state.todos` according to the `state.visibilityFilter`, and use it in its mapStateToProps:

```
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
  }
}

const mapStateToProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}
```


`[mapStateToProps(state, [ownProps]): stateProps] (Function)`

If this argument is specified, the new component will subscribe to Redux store updates. This means that any time the store is updated, mapStateToProps will be called. The results of mapStateToProps must be a plain object*, which will be merged into the component’s props. If you don't want to subscribe to store updates, pass null or undefined in place of mapStateToProps. If ownProps is specified as a second argument, its value will be the props passed to your component, and mapStateToProps will be additionally re-invoked whenever the component receives new props (e.g. if props received from a parent component have shallowly changed, and you use the ownProps argument, mapStateToProps is re-evaluated).

Note: in advanced scenarios where you need more control over the rendering performance, mapStateToProps() can also return a function. In this case, that function will be used as mapStateToProps() for a particular component instance. This allows you to do per-instance memoization. You can refer to #279 and the tests it adds for more details. Most apps never need this.

The mapStateToProps function takes a single argument of the entire Redux store’s state and returns an object to be passed as props. It is often called a selector. Use reselect to efficiently compose selectors and compute derived data.

#### mapDispatchToProps

`mapDispatchToProps` can either be a function or an object.

As the only way to change the application state is by dispatching an action, this allows to create named function for handling dispatch calls (i.e.: action creator).

When the name funtion is called with arguments, the associated named function will be called with the current getState() result and the given action synchronously. Its return value will be considered the next state.

```
import {actionCreator1, actionCreator2} from '../actions/main.js';

const bindActionsToDispatch = (dispatch) => ({
    actionCreator1 : () => {dispatch(actionCreator1())},
    actionCreator2 : (e) => {dispatch(actionCreator2(e))}
});
```

//------

In addition to reading the state, container components can dispatch actions. In a similar fashion, you can define a function called `mapDispatchToProps()` that receives the dispatch() method and returns callback props that you want to inject into the presentational component. For example, we want the VisibleTodoList to inject a prop called `onTodoClick` into the `TodoList` component, and we want onTodoClick to dispatch a `TOGGLE_TODO` action:

```
const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch(toggleTodo(id))
    }
  }
}
```

Finally, we create the VisibleTodoList by calling connect() and passing these two functions:

```
import { connect } from 'react-redux'

const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)

export default VisibleTodoList
```



//------

`[mapDispatchToProps(dispatch, [ownProps]): dispatchProps] (Object or Function)`

If an object is passed, each function inside it is assumed to be a Redux action creator. An object with the same function names, but with every action creator wrapped into a dispatch call so they may be invoked directly, will be merged into the component’s props. If a function is passed, it will be given dispatch. If you don't want to subscribe to store updates, pass null or undefined in place of mapStateToProps. It’s up to you to return an object that somehow uses dispatch to bind action creators in your own way. (Tip: you may use the bindActionCreators() helper from Redux.) If you omit it, the default implementation just injects dispatch into your component’s props. If ownProps is specified as a second argument, its value will be the props passed to your component, and mapDispatchToProps will be re-invoked whenever the component receives new props.

Note: in advanced scenarios where you need more control over the rendering performance, mapDispatchToProps() can also return a function. In this case, that function will be used as mapDispatchToProps() for a particular component instance. This allows you to do per-instance memoization. You can refer to #279 and the tests it adds for more details. Most apps never need this.

###### bindActionCreators

`mapDispatchToProps` is not the only way of bind dispatch and action creators, there is another way called `bindActionCreators`.

```
import { bindActionCreators } from 'redux';
import * as TodoActionCreators from './TodoActionCreators';

let boundActionCreators = bindActionCreators(TodoActionCreators, dispatch)
```

The only use case for bindActionCreators is when you want to pass some action creators down to a component that isn't aware of Redux, and you don't want to pass dispatch or the Redux store to it.



#### mergeProps


`mergeProps` is an optional parameter and is a function. The documentation on this particular function does not explain much as to it’s purpose and use cases. Hence adding to the mystery of the connect function.

If it is used, this function is passed the result of `mapStateToProps`(), `mapDispatchToProps`(), and the parent props. With this data available, it is easy to use props inherited from connect’s parent and combine them with an action creator. For example, if you are working with React Router, the variables assigned in the route path are passed as props to the connect function, if it is the connect function’s parent. You could then use those props and pass it along to your action creators to update your store with the needed URL parameters.

```
const mergeProps = (state, actions, {notebook, note}) => ({
    ...state,
    ...actions,
    onLoad: notebook && note
      ? () => {
        return Promise.all([
          actions.initActiveNotebookAndNote({notebook, note})
        ])
      }
      : actions.onLoad
})
```

The above code is receiving state from mapStateToProps, actions from mapDispatchToProps, and is creating a new prop called ‘onLoad’. This prop ‘onLoad’ is combining or ‘merging’ (as it’s name states) props from it’s parent component (React Router) and an action creator together. That action creator can be used to update data within a Reducer:

```
export const initActiveNotebookAndNote = ({notebook, note}) => ({
 type: SET_CURRENT_NOTE,
 notebook,
 note
});
```

`[mergeProps(stateProps, dispatchProps, ownProps): props] (Function)`

If specified, it is passed the result of mapStateToProps(), mapDispatchToProps(), and the parent props. The plain object you return from it will be passed as props to the wrapped component. You may specify this function to select a slice of the state based on props, or to bind action creators to a particular variable from props. If you omit it, Object.assign({}, ownProps, stateProps, dispatchProps) is used by default.

#### options

The options parameter is an object. It is used to customize the behavior of the connect function. The acceptable ‘options’ are the following:

* pure- Boolean, if true connect() will avoid re-rendering (will not update)
* areStatesEqual- Compares new store state vs. old*
* areOwnPropsEqual- Compares new props vs. old*
* areStatePropsEqual- Compares new mapStateToProps vs. old*
* areMergedPropsEqual- Compares new mergeProps vs. old*

(*Only when pure functions)

These options are not commonly used and are best explained by Redux:

You may wish to override `areStatesEqual` if your `mapStateToProps` function is computationally expensive and is also only concerned with a small slice of your state. For example: areStatesEqual: (prev, next) => prev.entities.todos === next.entities.todos; this would effectively ignore state changes for everything but that slice of state.

You may wish to override `areStatesEqual` to always return false (areStatesEqual: () => false) if you have impure reducers that mutate your store state. (This would likely impact the other equality checks is well, depending on your mapStateToProps function.)

You may wish to override `areOwnPropsEqual` as a way to whitelist incoming props. You'd also have to implement mapStateToProps, mapDispatchToProps and mergeProps to also whitelist props. (It may be simpler to achieve this other ways, for example by using recompose's mapProps.)

You may wish to override `areStatePropsEqual` to use strictEqual if your mapStateToProps uses a memoized selector that will only return a new object if a relevant prop has changed. This would be a very slight performance improvement, since would avoid extra equality checks on individual props each time mapStateToProps is called.

You may wish to override `areMergedPropsEqual` to implement a deepEqual if your selectors produce complex props. ex: nested objects, new arrays, etc. (The deep equal check should be faster than just re-rendering.)


`[options] (Object)`

If specified, further customizes the behavior of the connector. In addition to the options passable to connectAdvanced() (see those below), connect() accepts these additional options:

- [pure] (Boolean): If true, connect() will avoid re-renders and calls to mapStateToProps, mapDispatchToProps, and mergeProps if the relevant state/props objects remain equal based on their respective equality checks. Assumes that the wrapped component is a “pure” component and does not rely on any input or state other than its props and the selected Redux store’s state. Default value: true
- [areStatesEqual] (Function): When pure, compares incoming store state to its previous value. Default value: strictEqual (===)
- [areOwnPropsEqual] (Function): When pure, compares incoming props to its previous value. Default value: shallowEqual
- [areStatePropsEqual] (Function): When pure, compares the result of mapStateToProps to its previous value. Default value: shallowEqual
- [areMergedPropsEqual] (Function): When pure, compares the result of mergeProps to its previous value. Default value: shallowEqual

### The arity of mapStateToProps and mapDispatchToProps determines whether they receive ownProps

Note: ownProps is not passed to mapStateToProps and mapDispatchToProps if formal definition of the function contains one mandatory parameter (function has length 1). For example, function defined like below won't receive ownProps as the second argument.

```
function mapStateToProps(state) {
  console.log(state); // state
  console.log(arguments[1]); // undefined
}
```

```
const mapStateToProps = (state, ownProps = {}) => {
  console.log(state); // state
  console.log(ownProps); // undefined
}
```

Functions with no mandatory parameters or two parameters will receive ownProps.

```
const mapStateToProps = (state, ownProps) => {
  console.log(state); // state
  console.log(ownProps); // ownProps
}
```

```
function mapStateToProps() {
  console.log(arguments[0]); // state
  console.log(arguments[1]); // ownProps
}
```

```
const mapStateToProps = (...args) => {
  console.log(args[0]); // state
  console.log(args[1]); // ownProps
}
```

### Optimizing connect when options.pure is true

When options.pure is true, connect performs several equality checks that are used to avoid unncessary calls to mapStateToProps, mapDispatchToProps, mergeProps, and ultimately to render. These include areStatesEqual, areOwnPropsEqual, areStatePropsEqual, and areMergedPropsEqual. While the defaults are probably appropriate 99% of the time, you may wish to override them with custom implementations for performance or other reasons. Here are several examples:

- You may wish to override areStatesEqual if your mapStateToProps function is computationally expensive and is also only concerned with a small slice of your state. For example: areStatesEqual: (prev, next) => prev.entities.todos === next.entities.todos; this would effectively ignore state changes for everything but that slice of state.
- You may wish to override areStatesEqual to always return false (areStatesEqual: () => false) if you have impure reducers that mutate your store state. (This would likely impact the other equality checks is well, depending on your mapStateToProps function.)
- You may wish to override areOwnPropsEqual as a way to whitelist incoming props. You'd also have to implement mapStateToProps, mapDispatchToProps and mergeProps to also whitelist props. (It may be simpler to achieve this other ways, for example by using recompose's mapProps.)
- You may wish to override areStatePropsEqual to use strictEqual if your mapStateToProps uses a memoized selector that will only return a new object if a relevant prop has changed. This would be a very slight performance improvement, since would avoid extra equality checks on individual props each time mapStateToProps is called.
- You may wish to override areMergedPropsEqual to implement a deepEqual if your selectors produce complex props. ex: nested objects, new arrays, etc. (The deep equal check should be faster than just re-rendering.)

### Returns

A higher-order React component class that passes state and action creators into your component derived from the supplied arguments. This is created by `connectAdvanced`, and details of this higher-order component are covered there.

### Examples

Shortcuts and power options so we encourage you to check out its documentation in detail. In case you are worried about mapStateToProps creating new objects too often, you might want to learn about computing derived data with reselect.


```
containers/FilterLink.js

import { connect } from 'react-redux'
import { setVisibilityFilter } from '../actions'
import Link from '../components/Link'

const mapStateToProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter))
    }
  }
}

const FilterLink = connect(
  mapStateToProps,
  mapDispatchToProps
)(Link)

export default FilterLink
```


// -----


Inject just dispatch and don't listen to store

```
export default connect()(TodoApp)
```

Inject all action creators (addTodo, completeTodo, ...) without subscribing to the store

```
import * as actionCreators from './actionCreators'

export default connect(null, actionCreators)(TodoApp)
```

Inject dispatch and every field in the global state

Don’t do this! It kills any performance optimizations because TodoApp will rerender after every action.
It’s better to have more granular connect() on several components in your view hierarchy that each only
listen to a relevant slice of the state.

```
export default connect(state => state)(TodoApp)
```

Inject dispatch and todos

```
function mapStateToProps(state) {
  return { todos: state.todos }
}

export default connect(mapStateToProps)(TodoApp)
```

Inject todos and all action creators

```
import * as actionCreators from './actionCreators'

function mapStateToProps(state) {
  return { todos: state.todos }
}

export default connect(mapStateToProps, actionCreators)(TodoApp)
```

Inject todos and all action creators (addTodo, completeTodo, ...) as actions

```
import * as actionCreators from './actionCreators'
import { bindActionCreators } from 'redux'

function mapStateToProps(state) {
  return { todos: state.todos }
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(actionCreators, dispatch) }
}

export default connect(mapStateToProps, mapDispatchToProps)(TodoApp)
```

Inject todos and a specific action creator (addTodo)

```
import { addTodo } from './actionCreators'
import { bindActionCreators } from 'redux'

function mapStateToProps(state) {
  return { todos: state.todos }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addTodo }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TodoApp)
```

Inject todos, todoActionCreators as todoActions, and counterActionCreators as counterActions

```
import * as todoActionCreators from './todoActionCreators'
import * as counterActionCreators from './counterActionCreators'
import { bindActionCreators } from 'redux'

function mapStateToProps(state) {
  return { todos: state.todos }
}

function mapDispatchToProps(dispatch) {
  return {
    todoActions: bindActionCreators(todoActionCreators, dispatch),
    counterActions: bindActionCreators(counterActionCreators, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TodoApp)
```

Inject todos, and todoActionCreators and counterActionCreators together as actions

```
import * as todoActionCreators from './todoActionCreators'
import * as counterActionCreators from './counterActionCreators'
import { bindActionCreators } from 'redux'

function mapStateToProps(state) {
  return { todos: state.todos }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Object.assign({}, todoActionCreators, counterActionCreators), dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TodoApp)
```

Inject todos, and all todoActionCreators and counterActionCreators directly as props

```
import * as todoActionCreators from './todoActionCreators'
import * as counterActionCreators from './counterActionCreators'
import { bindActionCreators } from 'redux'

function mapStateToProps(state) {
  return { todos: state.todos }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, todoActionCreators, counterActionCreators), dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TodoApp)
```

Inject todos of a specific user depending on props

```
import * as actionCreators from './actionCreators'

function mapStateToProps(state, ownProps) {
  return { todos: state.todos[ownProps.userId] }
}

export default connect(mapStateToProps)(TodoApp)
```

Inject todos of a specific user depending on props, and inject props.userId into the action

```
import * as actionCreators from './actionCreators'

function mapStateToProps(state) {
  return { todos: state.todos }
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, ownProps, {
    todos: stateProps.todos[ownProps.userId],
    addTodo: (text) => dispatchProps.addTodo(ownProps.userId, text)
  })
}

export default connect(mapStateToProps, actionCreators, mergeProps)(TodoApp)
```

// -------

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

## connectAdvanced(selectorFactory, [connectOptions])

Connects a React component to a Redux store. It is the base for connect() but is less opinionated about how to combine state, props, and dispatch into your final props. It makes no assumptions about defaults or memoization of results, leaving those responsibilities to the caller.

It does not modify the component class passed to it; instead, it returns a new, connected component class for you to use.

### Arguments

`selectorFactory(dispatch, factoryOptions): selector(state, ownProps): props (Function)`

Intializes a selector function (during each instance's constructor). That selector function is called any time the connector component needs to compute new props, as a result of a store state change or receiving new props. The result of selector is expected to be a plain object, which is passed as the props to the wrapped component. If a consecutive call to selector returns the same object (===) as its previous call, the component will not be re-rendered. It's the responsibility of selector to return that previous object when appropriate.

[connectOptions] (Object) If specified, further customizes the behavior of the connector.

* [getDisplayName] (Function): computes the connector component's displayName property relative to that of the wrapped component. Usually overridden by wrapper functions. Default value: name => 'ConnectAdvanced('+name+')'
* [methodName] (String): shown in error messages. Usually overridden by wrapper functions. Default value: 'connectAdvanced'
* [renderCountProp] (String): if defined, a property named this value will be added to the props passed to the wrapped component. Its value will be the number of times the component has been rendered, which can be useful for tracking down unnecessary re-renders. Default value: undefined
* [shouldHandleStateChanges] (Boolean): controls whether the connector component subscribes to redux store state changes. If set to false, it will only re-render on componentWillReceiveProps. Default value: true
* [storeKey] (String): the key of props/context to get the store. You probably only need this if you are in the inadvisable position of having multiple stores. Default value: 'store'
* [withRef] (Boolean): If true, stores a ref to the wrapped component instance and makes it available via getWrappedInstance() method. Default value: false
* Addionally, any extra options passed via connectOptions will be passed through to your selectorFactory in the factoryOptions argument.


### Returns

A higher-order React component class that builds props from the store state and passes them to the wrapped component. A higher-order component is a function which accepts a component argument and returns a new component.

Static Properties

WrappedComponent (Component): The original component class passed to connectAdvanced(...)(Component).
Static Methods

All the original static methods of the component are hoisted.

Instance Methods

getWrappedInstance(): ReactComponent

Returns the wrapped component instance. Only available if you pass { withRef: true } as part of the options argument.

### Remarks

Since `connectAdvanced` returns a higher-order component, it needs to be invoked two times. The first time with its arguments as described above, and a second time, with the component: connectAdvanced(selectorFactory)(MyComponent).

connectAdvanced does not modify the passed React component. It returns a new, connected component, that you should use instead.


### Examples

Inject todos of a specific user depending on props, and inject props.userId into the action

```
import * as actionCreators from './actionCreators'
import { bindActionCreators } from 'redux'

function selectorFactory(dispatch) {
  let ownProps = {}
  let result = {}
  const actions = bindActionCreators(actionCreators, dispatch)
  const addTodo = (text) => actions.addTodo(ownProps.userId, text)
  return (nextState, nextOwnProps) => {
    const todos = nextState.todos[nextProps.userId]
    const nextResult = { ...nextOwnProps, todos, addTodo }
    ownProps = nextOwnProps
    if (!shallowEqual(result, nextResult)) result = nextResult
    return result
  }
}
export default connectAdvanced(selectorFactory)(TodoApp)
```







