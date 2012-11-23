'use strict';

var fs      = require('fs')
  , esprima = require('esprima')
  , visit   = require('estraverse').traverse
  ;

function requireTag(filename, node) {
  var name = node.id.name;
  var startLine = node.loc.start.line - 1;
  var pattern = startLine + '/\\<' + node.id.name + '\\>/;"';

  return [name, filename, pattern, 'i', 'lineno:' + (startLine + 1)].join('\t');
}

function isRequire(node) {
  return node &&
         node.type === 'CallExpression' &&
         node.callee &&
         node.callee.type === 'Identifier' &&
         node.callee.name === 'require';
}

function isObjectExpression(node) {
  return node &&
         node.type === 'ObjectExpression';
}

function objectFromMemberExpression(node) {
  var child = node.init;
  while (child.type === 'MemberExpression' && child.object) {
    child = child.object;
  }

  return child;
}

function methodTags(filename, node, object) {
  object.properties.forEach(function (property) {
    if (property.value.type === 'FunctionExpression') {
      var name = node.id.name + '.' + property.key.name;
      var startLine = property.key.loc.start.line - 1;
      var pattern = startLine + '/\\<' + property.key.name + '\\>/;"';

      console.log([name, filename, pattern, 'm', 'lineno:' + (startLine + 1)].join('\t'));
    }
  });
}

var nodeVisitors = {
  'VariableDeclarator' : function (filename, node) {
    if (!node.init) return;

    var target;
    if (isRequire(node.init)) {
      console.log(requireTag(filename, node));
    }
    else if (node.init.type === 'MemberExpression') {
      target = objectFromMemberExpression(node);
      if (isRequire(target)) {
        console.log(requireTag(filename, node));
      }
    }
    else if (node.init.type === 'AssignmentExpression') {
      target = node.init.right;
      if (isObjectExpression(target)) {
        methodTags(filename, node, target);
      }
    }
  }
};

function visitor (filename) {
  return {
    enter : function enter(node, stack) {
      var handler = nodeVisitors[node.type];
      if (handler) handler(filename, node);
      // else console.dir(node);
    }
  };
}

function header() {
  return "!_TAG_FILE_FORMAT	2	/extended format/\n" +
         "!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/\n" +
         "!_TAG_PROGRAM_AUTHOR	Forrest L Norvell	/ogd@aoaioxxysz.net/\n" +
         "!_TAG_PROGRAM_NAME	jstags	//\n" +
         "!_TAG_PROGRAM_URL	http://github.com/othiym23/jstags	/github repository/\n" +
         "!_TAG_PROGRAM_VERSION	0.0.0	//";
}

console.log(header());

module.exports = function tagFiles(filenames) {
  filenames.forEach(function (filename) {
    fs.readFile(filename, function (err, source) {
      if (err) return console.error("Error reading helper: %s", err);

      var ast = esprima.parse(source, {loc : true});
      visit(ast, visitor(filename));
    });
  });
};
