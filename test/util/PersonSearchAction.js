'use strict'

const FashionModelAction = require('../../')
const Person = require('./Person')
const searchForPerson = require('./searchForPerson')

class PersonSearchAction extends FashionModelAction {
  execute () {
    this.define(Person, searchForPerson())
  }
}

module.exports = PersonSearchAction
