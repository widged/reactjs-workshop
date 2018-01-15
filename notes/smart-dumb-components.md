[WIP - Random notes]

# Smart vs Dumb Components


UI components are much easier to reuse and reason about when divided into two categories.
- Presentational components
- Container

Altnerative names are Skinny vs Fat, Dumb vs Smart, Components vs Screens. These all are not exactly the same, but the core idea is similar.

The distinction between the presentational components and the containers focuses on the difference in their purpose.


### Presentational components

- Are concerned with how things look.
- May contain other presentational components inside
- Usually have some DOM markup and styles of their own.
- No side effect. No interaction with stores or webservices.
- Loose coupling. Have no dependencies on the rest of the application. No knowledge of frameworks or libraries that the application depend on.
- Receive data exclusively via props and drives changes only via callbacks.
- Highly specialized. Solve one problem.

* “Presentational” components ➡Renders the HTML and Listens to Events



### container components

- Usually don’t have any DOM markup of their own except for some wrapping divs, and never have any styles.
- They have some manager role. They provide the data and behavior to presentational or other container components.
- Tight coupling. Have some awareness of the application architecture and possible libraries that the application depend on. This component may break silently if a json endpoint change.
- They can be generated using higher order components such as connect() from React Redux, createContainer() from Relay.

// adapter pattern

// -----

A container does data fetching and then renders its corresponding sub-component. That’s it. [source](https://medium.com/@learnreact/container-components-c0e67432e005)

“Corresponding” meaning a component that shares the same name:

```
StockWidgetContainer => StockWidget
TagCloudContainer => TagCloud
PartyPooperListContainer => PartyPooperList
```

You get the idea.

Why containers?

Say you have a component that displays comments. You didn’t know about container components. So, you put everything in one place:

```
class CommentList extends React.Component {
  this.state = { comments: [] };

  componentDidMount() {
    fetchSomeComments(comments =>
      this.setState({ comments: comments }));
  }
  render() {
    return (
      <ul>
        {this.state.comments.map(c => (
          <li>{c.body}—{c.author}</li>
        ))}
      </ul>
    );
  }
}
```

// -----

- Use SmartComponents to generate actions creators.
- When a DumbComponent has an interaction from a user, it shouldn’t handle any logic itself — it should blindly call a function which is passed to it by a SmartContainer and let it do the work.
- The SmartContainer should then marshal the necessary data and pass it to an action creator.
- Minimize view logic in smart components by extracting it into dumb components.
- Place all business logic inside action handlers (thunks), selectors and reducers.
- Services must be completely stateless.


* “Container” components ➡ Deals w/ Redux And “Presentational”


## Alternatives

Some people associate the distinction between Presentational and Container components with the following characteristics. Presentational components tend to be stateless pure functions, and containers tend to be stateful pure classes. These are not a hard rule.


| Presentational        | Container |
| ------------- |-------------|
| Stateless      | Stateful |
| Implemented with Function |Implemented with Class  |
| Pure(*) | Impure |


(*) A component is pure if it is guaranteed to return the same result given the same props and state.

// higher-order components

## Other types of smart components


Now, if you inspect using React Developer Tools, you’ll realize that in a typical multi-view SPA React Redux app, we can categorize components into at least 6 different types based on their “purpose”.

* “Provider” component ➡ Injects “Store” to sub components
* “Router” & “RouterContext” component ➡ Navigation
* “Parent” Route component ➡ Main App-level wrapper component
* “Page” or “View” Route sub-component ➡ Helps organize stuff inside a single page or view.

[source](https://medium.com/@rajaraodv/the-anatomy-of-a-react-redux-app-759282368c5a)

### Benefits of This Approach

- Better separation of concerns. When side-effects are isolated, code becomes much more simple. Mingling data fetching, data manipulation and view render concerns is a recipe for time-traveling spaghetti.
- Always separate State Management files from UI files. Think about your application on the long run. Imagine what happens with the codebase when you switch from React to another library. Or think how your codebase would use ReactNative in parallel with the web version. [source](https://medium.freecodecamp.com/scaling-your-redux-app-with-ducks-6115955638be)

- Better reusability. Presentatinal components are written to have no coupling with the application they are in. This means that they can be reused in a variety of circumstances.

- Presentational components can be tested thoroughly outside of the application. They can be changed and updated by team members without touching the app’s logic. They can give way to screenshot regression tests on that page.

- Data structure - Presentational components clearly define the data they require. PropTypes are great for this.



## Tips

Best is to start building your app with just presentational components first. Eventually you’ll realize that you are passing too many props down the intermediate components. When you notice that some components don’t use the props they receive but merely forward them down and you have to rewire all those intermediate components any time the children need more data, it’s a good time to introduce some container components. This way you can get the data and the behavior props to the leaf components without burdening the unrelated components in the middle of the tree.

This is an ongoing process of refactoring so don’t try to get it right the first time. As you experiment with this pattern, you will develop an intuitive sense for when it’s time to extract some containers, just like you know when it’s time to extract a function. My free Redux Egghead series might help you with that too!


## Example

This gist by Michael Chan pretty much nails it.
https://gist.github.com/chantastic/fc9e3853464dffdb1e3c

A component like this would be rejected in code review for having both a presentation and data concern:

```
// CommentList.js

class CommentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { comments: [] }
  }

  componentDidMount() {
    $.ajax({
      url: "/my-comments.json",
      dataType: 'json',
      success: function(comments) {
        this.setState({comments: comments});
      }.bind(this)
    });
  }

  render() {
    return <ul> {this.state.comments.map(renderComment)} </ul>;
  }

  renderComment({body, author}) {
    return <li>{body}—{author}</li>;
  }
}
```

It would then be split into two components. The first is like a traditional template, concerned only with presentation, and the second is tasked with fetching data and rendering the related view component.

```
// CommentList.js
class CommentList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <ul> {this.props.comments.map(renderComment)} </ul>;
  }

  renderComment({body, author}) {
    return <li>{body}—{author}</li>;
  }
}

// CommentListContainer.js
class CommentListContainer extends React.Component {
  constructor() {
    super();
    this.state = { comments: [] }
  }

  componentDidMount() {
    $.ajax({
      url: "/my-comments.json",
      dataType: 'json',
      success: function(comments) {
        this.setState({comments: comments});
      }.bind(this)
    });
  }

  render() {
    return <CommentList comments={this.state.comments} />;
  }
}
```

In the updated example, CommentListContainer could shed JSX pretty simply.

```
  render() {
    return React.createElement(CommentList, { comments: this.state.comments });
  }
  ```


Lets pull out data-fetching into a container component.

```
class CommentListContainer extends React.Component {
  state = { comments: [] };
  componentDidMount() {
    fetchSomeComments(comments =>
      this.setState({ comments: comments }));
  }
  render() {
    return <CommentList comments={this.state.comments} />;
  }
}
```

Now, let’s rework CommentList to take comments as a prop.

```
const CommentList = props =>
  <ul>
    {props.comments.map(c => (
      <li>{c.body}—{c.author}</li>
    ))}
  </ul>
```


## Resources

- [smart-and-dumb-components by Dan Abramov](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
