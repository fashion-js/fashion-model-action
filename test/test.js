'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const Person = require('./util/Person')
const PersonSearchAction = require('./util/PersonSearchAction')
const PersonSearchNonModelAction = require('./util/PersonSearchNonModelAction')
const searchForPerson = require('./util/searchForPerson')

proxyquire.noPreserveCache()

test.beforeEach((t) => {
  const sandbox = sinon.sandbox.create()
  const personSearchAction = new PersonSearchAction()
  const personSearchNonModelAction = new PersonSearchNonModelAction()

  t.context = {
    sandbox,
    personSearchAction,
    personSearchNonModelAction,
    person: searchForPerson()
  }
})

test.afterEach((t) => {
  const { sandbox } = t.context
  sandbox.restore()
})

test('should allow consuming a model', (t) => {
  t.plan(1)

  const { personSearchAction, person } = t.context

  return personSearchAction
    .activate()
    .consume(Person)
    .then((data) => {
      t.deepEqual(data.clean(), person)
    })
})

test('should fallback to original "define" if topic provided is not a Model', (t) => {
  t.plan(1)

  const { personSearchNonModelAction, person } = t.context

  return personSearchNonModelAction
    .activate()
    .consume('person')
    .then((data) => {
      t.deepEqual(data, person)
    })
})

test('should throw error if defining an Action with wrap errors', (t) => {
  t.plan(2)

  const { sandbox } = t.context

  const PersonSearchActionProxy = proxyquire('./util/PersonSearchAction', {
    './searchForPerson': sandbox.stub().returns({
      invalidModelProp: 'hello'
    })
  })

  return new PersonSearchActionProxy()
    .activate()
    .consume(Person)
    .then(() => {
      t.fail()
    })
    .catch((err) => {
      t.is(err.message, 'Error wrapping action model: "Unrecognized property: invalidModelProp"')
      t.pass()
    })
})

test('should allow consuming a model from a stream', (t) => {
  t.plan(1)

  const { personSearchAction, person } = t.context

  return new Promise((resolve, reject) => {
    personSearchAction
      .activate()
      .consumeStream(Person, (stream) => {
        stream.on('data', (data) => {
          t.deepEqual(data.clean(), person)
        })
        stream.on('end', () => resolve())
      })
      .define(Person, null)
  })
})

test('should fall back to original "consumeStream" if topic provided is not a model', (t) => {
  t.plan(1)

  const { personSearchNonModelAction, person } = t.context

  return new Promise((resolve, reject) => {
    personSearchNonModelAction
      .activate()
      .consumeStream('person', (stream) => {
        stream.on('data', (data) => {
          t.deepEqual(data, person)
        })
        stream.on('end', () => resolve())
      })
      .define('person', null)
  })
})
