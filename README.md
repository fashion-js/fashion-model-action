# fashion-model-action

A [`fashion-model`](https://github.com/fashion-js/fashion-model) wrapper for
[`oja`](https://github.com/dimichgh/oja) allowing data that is being defined
and consumed to be a `fashion-model`.

## Installation

```bash
npm install fashion-model-action --save
```

## Usage

```js
const Model = require('fashion-model/Model')
const Enum = require('fashion-model/Enum')
const FashionModelAction = require('fashion-model-action')

const Person = Model.extend({
  // The oja "topic" to defines
  typeName: 'person',
  properties: {
    name: String,
    height: Number,
    weight: Number
  }
})

class PersonSearchAction extends FashionModelAction {
  execute() {
    this.define(Person, {
      name: 'John',
      height: 100,
      weight: 100
    })
  }
}

;(async function () {
  // { name: 'John', height: 100, weight: 100 }
  const person = await new PersonSearchAction()
    .activate()
    .consume(Person)
})()
```

## How it works

A `fashion-model`'s `typeName` property is used to define the producing `oja`
topic.

```js
const Person = require('fashion-model/Model').extend({
  // The oja "topic" to defines
  typeName: 'person',
  properties: {
    ...
  }
})
```

Consuming also uses the same `fashion-model` `typeName` property:

```js
const Person = require('./models/Person')

const person = await new PersonSearchAction()
  .activate()
  .consume(Person)
```

## API

* **FashionModelAction**() is a `oja` `Action` constructor

* **consume**(topics | Model [, callback]) adds a consumer to the flow for the given `fashion-model` `typeName` topic or standard `oja` topic(s).
    * *topics* is one or more topics to capture by the handler
    * *Model* is a `fashion-model` whose `typeName` property is used to determine the topic to capture by the handler

    * **callback**((data|map), flow) is a handler, if provided, it will be called once all topics are resolved
        * *data* resolved for the single topic
        * *map* of resolved data mapped to corresponding topics
        * *flow* is an instance of the flow for convenience
    * **returns** promise or a list of promises if callback is not provided;
        * *promise* for single topic  
        * *promises* mapped to the provided topics

* **consumeStream**(topic | Model [, callback]) returns a readable stream of events for the given topic
    * *topic* is a topic to capture by the handler
    * *Model* is a `fashion-model` whose `typeName` property is used to determine the topic to capture by the handler
    * *Note:* if callback is provided, it will return a stream to the callback(stream) and continue cascading flow by returning 'this' reference;

* **define**(topics | Model [, data|promise|function]) defines a producer for the given topic or an array of topics
    * *topics* is a single topic or an array of topics to broadcast the data with.
    * *Model* is a `fashion-model` whose `typeName` property is used to determine the topic to broadcast the data with
    * *data* will be immediately published under the given topics into the flow; in case an error object is passed, the flow will be stopped and an 'error' event will be broadcasted into the flow.
    * *promise* will publish data once resolved; in case of reject, the flow will be stopped and an 'error' event will be broadcasted into the flow.
    * **function**(publisher, flow) will be called immediately
        * *publisher* is a convenience object to publish events for the assigned topic in async use-case
        * *flow* is an instance of the current flow.
        * if *function* returns a non-undefined value, it will be published under the assigned topic immediately; this is useful in a sync flow.
