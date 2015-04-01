// Generated by CoffeeScript 1.9.0
(function() {
  var CyclicDependencies, util,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __hasProp = {}.hasOwnProperty;

  util = require("util");

  CyclicDependencies = (function(_super) {
    __extends(CyclicDependencies, _super);

    function CyclicDependencies(cyclesArrOfArr) {
      var msg;
      this.name = 'CyclicDependencies';
      this.cycles = cyclesArrOfArr;
      msg = "There has been " + cyclesArrOfArr.length + " cycles in the dependency tree: \n" + util.inspect(cyclesArrOfArr, {
        showHidden: true,
        depth: null
      });
      return CyclicDependencies.__super__.constructor.call(this, msg);
    }

    return CyclicDependencies;

  })(Error);

  module.exports.CyclicDependencies = CyclicDependencies;

}).call(this);

//# sourceMappingURL=Errors.js.map
