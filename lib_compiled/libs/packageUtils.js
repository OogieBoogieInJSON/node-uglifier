// Generated by CoffeeScript 1.9.0
(function() {
  var UglifyJS, fs, fsExtra, packageUtils, path, strEscapeMap, _;

  fsExtra = require('fs-extra');

  fs = require('fs');

  UglifyJS = require('uglify-js');

  path = require('path');

  _ = require('underscore');

  packageUtils = module.exports;

  packageUtils.isNative = function(module) {
    var err;
    try {
      return require.resolve(module) === module;
    } catch (_error) {
      err = _error;
      return false;
    }
  };

  packageUtils.readFile = function(pathAbs, encoding) {
    var options;
    if (encoding == null) {
      encoding = 'utf8';
    }
    options = {
      encoding: encoding
    };
    return fs.readFileSync(pathAbs, options);
  };

  packageUtils.getAst = function(code) {
    return UglifyJS.parse(code);
  };

  packageUtils.getMatchingFiles = function(rootPath, dirAndFileArray) {
    var destination, dirOrFile, fileName, filestats, me, r, rootDir, _i, _len;
    r = [];
    rootDir = fs.lstatSync(rootPath).isDirectory() ? path.resolve(rootPath) : path.dirname(path.resolve(rootPath));
    for (_i = 0, _len = dirAndFileArray.length; _i < _len; _i++) {
      dirOrFile = dirAndFileArray[_i];
      destination = path.resolve(rootDir, dirOrFile);
      try {
        filestats = fs.lstatSync(destination);
      } catch (_error) {
        me = _error;
        filestats = null;
      }
      if (filestats && filestats.isDirectory()) {
        fs.readdirSync(destination).reduce((function(prev, curr) {
          prev.push(path.join(destination, curr));
          return prev;
        }), r);
      } else {
        if (path.extname(destination) === "") {
          fileName = path.basename(destination);
          fs.readdirSync(path.dirname(destination)).filter(function(fileNameLoc) {
            return fileNameLoc.indexOf(fileName) !== -1;
          }).reduce((function(prev, curr) {
            prev.push(path.join(destination, curr));
            return prev;
          }), r);
        } else {
          r.push(destination);
        }
      }
    }
    return r;
  };

  packageUtils.getIfNonNativeNotFilteredNonNpm = function(fileAbs, filters, possibleExtensions) {
    var existingExtensions, r;
    r = null;
    if (path.extname(fileAbs) === "") {
      existingExtensions = possibleExtensions.filter(function(ext) {
        return fs.existsSync(fileAbs + "." + ext);
      });
      if (existingExtensions.length > 1) {
        throw new Error(" multiple matching extensions problem for " + fileAbs);
      }
      r = existingExtensions.length === 1 ? fileAbs + "." + existingExtensions[0] : null;
    } else {
      r = fs.existsSync(fileAbs) ? fileAbs : null;
    }
    if (r) {
      if (filters.filter(function(fFile) {
        return path.normalize(fFile) === path.normalize(r);
      }).length > 0) {
        r = null;
        console.log(fileAbs + " was filtered ");
      }
    }
    return r;
  };

  packageUtils.getRequireStatements = function(ast, file, possibleExtensions, isOnlyNonNativeNonNpm) {
    var fileDir, handleRequireNode, r;
    if (possibleExtensions == null) {
      possibleExtensions = ["js", "coffee"];
    }
    if (isOnlyNonNativeNonNpm == null) {
      isOnlyNonNativeNonNpm = true;
    }
    r = [];
    handleRequireNode = function(text, args) {
      var hasPathInIt, me, pathOfModule, pathOfModuleLoc, pathOfModuleLocStats, pathOfModuleRaw, rs;
      if (args.length !== 1) {
        throw new Error("in file: " + file + " require supposed to have 1 argument: " + text);
      }
      pathOfModuleRaw = args[0].value;
      if (pathOfModuleRaw == null) {
        throw new Error("probably dynamic");
      }
      hasPathInIt = !_.isEmpty(pathOfModuleRaw.match("/")) || !_.isEmpty(pathOfModuleRaw.match(/\\/));
      if (hasPathInIt) {
        pathOfModuleLoc = path.resolve(fileDir, pathOfModuleRaw);
        pathOfModuleLocStats = (function() {
          try {
            return fs.lstatSync(pathOfModuleLoc);
          } catch (_error) {
            me = _error;
          }
        })();
        if (pathOfModuleLocStats && pathOfModuleLocStats.isDirectory()) {
          throw new Error("in file: " + file + " require for a directory not supported " + text);
        }
        pathOfModule = packageUtils.getIfNonNativeNotFilteredNonNpm(pathOfModuleLoc, [], possibleExtensions);
        rs = {
          text: text,
          path: pathOfModule
        };
        if (!isOnlyNonNativeNonNpm || pathOfModule) {
          return r.push(rs);
        }
      }
    };
    fileDir = path.dirname(file);
    ast.walk(new UglifyJS.TreeWalker(function(node) {
      var args, me, requireArgs, text, _ref;
      if ((node instanceof UglifyJS.AST_Call) && (node.start.value === 'require' || (node.start.value === 'new' && node.expression.print_to_string() === "require"))) {
        text = node.print_to_string({
          beautify: false
        });
        requireArgs = node != null ? (_ref = node.expression) != null ? _ref.args : void 0 : void 0;
        if (_.isEmpty(requireArgs)) {
          requireArgs = node.args;
        }
        try {
          handleRequireNode(text, requireArgs);
        } catch (_error) {
          me = _error;
          console.log("Warning!:");
          console.log("unhandled require type in file: " + file + " the problematic statement: " + text + " probably something fancy going on " + " the error: " + me.message);
        }
        return true;
      } else if ((node instanceof UglifyJS.AST_Call) && (node.start.value === 'new' && node.expression.start.value === "(" && node.expression.print_to_string().indexOf("require") !== -1)) {
        args = node.expression.args;
        text = "require" + "('" + args[0].value + "')";
        handleRequireNode(text, args);
        console.log("second " + text);
        return true;
      } else {

      }
    }));
    return r;
  };

  strEscapeMap = {
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t'
  };

  packageUtils.hexifyString = function(str) {
    var char, i, r, _i, _ref;
    r = "";
    if (!str.length > 0) {
      return r;
    }
    for (i = _i = 0, _ref = str.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      char = str[i];
      if (strEscapeMap[char]) {
        r += r[char];
      } else if ('\\' === char) {
        r += '\\' + str[++i];
      } else {
        r += '\\x' + str.charCodeAt(i).toString(16);
      }
    }
    return r;
  };

  packageUtils.deHexifyString = function(str) {
    return str.toString();
  };

  packageUtils.getSourceHexified = function(ast) {
    var hexify, stream, transformer;
    hexify = function(node) {
      var hex, obj, text;
      if (node instanceof UglifyJS.AST_String) {
        text = node.getValue();
        hex = packageUtils.hexifyString(text);
        obj = _.extend({}, node);
        obj.value = hex;
        return new UglifyJS.AST_String(obj);
      } else {

      }
    };
    transformer = new UglifyJS.TreeTransformer(null, hexify);
    stream = new UglifyJS.OutputStream;
    stream.print_string = function(str) {
      return this.print('"' + str + '"');
    };
    ast = ast.transform(transformer);
    ast.print(stream);
    return stream.toString();
  };

  packageUtils.replaceRequireStatement = function(textIn, orig, replacement) {
    var isReplaced, text, withTheOtherQuotation;
    text = textIn;
    isReplaced = false;
    text = text.replace(orig, function(token) {
      isReplaced = true;
      return replacement;
    });
    if (!isReplaced) {
      withTheOtherQuotation = orig;
      if (withTheOtherQuotation.indexOf("'") !== -1) {
        withTheOtherQuotation = withTheOtherQuotation.replace(/[']/ig, '"');
      } else {
        withTheOtherQuotation = withTheOtherQuotation.replace(/["]/ig, "'");
      }
      text = text.replace(withTheOtherQuotation, function(token) {
        isReplaced = true;
        return replacement;
      });
    }
    if (!isReplaced) {
      throw new Error(orig + " was not replaced with " + replacement);
    }
    return text;
  };

  packageUtils.countWords = function(sentence) {
    var index, words;
    index = {};
    words = sentence.replace(/[.,?!;()"'-]/g, " ").replace(/\s+/g, " ").toLowerCase().split(" ");
    words.forEach(function(word) {
      if (!(index.hasOwnProperty(word))) {
        index[word] = 0;
      }
      return index[word]++;
    });
    return index;
  };

}).call(this);

//# sourceMappingURL=packageUtils.js.map
