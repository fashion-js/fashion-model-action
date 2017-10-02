const FashionModelAction = require('../../')
const searchForPerson = require('./searchForPerson')

class PersonSearchAction extends FashionModelAction {
  execute () {
    this.define('person', searchForPerson())
  }
}

module.exports = PersonSearchAction
