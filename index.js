'use strict';

var _reducers = {};
var _combines = {};

// Reducers Hub
module.exports = function(state, action) {
  if (state === undefined) state = {};
  var hasChanged = false;
  var nextState = {};
  for (var key in _combines) {
    var reducer = _combines[key];
    var oldState = state[key];
    var newState = reducer(oldState, action);
    hasChanged = hasChanged || oldState !== newState;
    nextState[key] = newState;
  }
  return hasChanged ? nextState : state;
}

function defineReducer(scope) {
  _combines[scope] = function(state, action) {
    var reducers = _reducers[scope];
    var reducer = function(r) {
      state = r(state, action);
    };
    // All type
    if (reducers.all !== undefined) {
      reducers.all.map(reducer);
    }
    // Match action type
    if (reducers[action.type] !== undefined) {
      reducers[action.type].map(reducer);
    }
    // Return state
    return state === undefined ?
      (reducers._default === undefined ? {} : reducers._default) :
      state;
  };
}

// Methods
function add(reducers, scope, defaultState) {
  if (scope === undefined) scope = "general";
  // Add combine reducer
  _combines[scope] !== undefined || defineReducer(scope);
  // Add data
  var scopeReducers = _reducers[scope] || {};
  for (var type in reducers) {
    var reducer = reducers[type];
    if (typeof reducer === 'function') {
      if (scopeReducers[type] === undefined) {
        scopeReducers[type] = [ reducer ];
      } else {
        scopeReducers[type].push(reducer);
      }
    }
  }
  if (defaultState !== undefined) {
    scopeReducers._default = defaultState;
  }
  _reducers[scope] = scopeReducers;
}

function remove(scope, type) {
  if (scope === undefined) scope = "general";
  if (type === undefined) {
    delete _combines[scope];
    delete _reducers[scope];
  } else {
    delete _reducers[scope][type];
  }
}

function replace(reducers, scope, defaultState) {
  remove(scope);
  add(reducers, scope, defaultState);
}

module.exports.add = add;
module.exports.remove = remove;
module.exports.replace = replace;
