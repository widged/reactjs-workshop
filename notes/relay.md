[WIP - Random notes] 

https://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html

At React.js Conf in January we gave a preview of Relay, a new framework for building data-driven applications in React. In this post, we'll describe the process of creating a Relay application. This post assumes some familiarity with the concepts of Relay and GraphQL, so if you haven't already we recommend reading our introductory blog post or watching the conference talk.

We're working hard to prepare GraphQL and Relay for public release. In the meantime, we'll continue to provide information about what you can expect.



The Relay Architecture
The diagram below shows the main parts of the Relay architecture on the client and the server:

Relay Architecture

The main pieces are as follows:

Relay Components: React components annotated with declarative data descriptions.
Actions: Descriptions of how data should change in response to user actions.
Relay Store: A client-side data store that is fully managed by the framework.
Server: An HTTP server with GraphQL endpoints (one for reads, one for writes) that respond to GraphQL queries.
This post will focus on Relay components that describe encapsulated units of UI and their data dependencies. These components form the majority of a Relay application.



A Relay Application
To see how components work and can be composed, let's implement a basic version of the Facebook News Feed in Relay. Our application will have two components: a <NewsFeed> that renders a list of <Story> items. We'll introduce the plain React version of each component first and then convert it to a Relay component. The goal is something like the following:
