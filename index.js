'use strict'

const Action = require('oja').Action

function getTypeNameFromTopics (topics) {
  return typeof topics.Model !== 'undefined' && topics.Model.typeName
}

function consume (consumeFn, topics, cb) {
  const typeName = getTypeNameFromTopics(topics)
  return typeName ? consumeFn(typeName, cb) : consumeFn(topics, cb)
}

class FashionModelAction extends Action {
  define (topics, cb) {
    const typeName = getTypeNameFromTopics(topics)
    if (typeName) {
      const errors = []
      const wrapped = topics.wrap(arguments[1], errors)

      if (errors.length) {
        return super.define(typeName,
          new Error(`Error wrapping action model: "${errors.join(',')}"`), cb)
      }

      return super.define(typeName, wrapped, cb)
    }

    return super.define(topics, cb)
  }

  consume (topics, cb) {
    return consume(super.consume.bind(this), topics, cb)
  }

  consumeStream (topics, cb) {
    return consume(super.consumeStream.bind(this), topics, cb)
  }
}

module.exports = FashionModelAction
