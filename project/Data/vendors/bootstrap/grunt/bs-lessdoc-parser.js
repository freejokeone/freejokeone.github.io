/*!
 * Bootstrap Grunt task for parsing Less docstrings
 * http://getbootstrap.com
 * Copyright 2014-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

'use strict';

var Markdown = require('markdown-it');

function markdown2html(markdownString) {
  var md = new Markdown();

  // the slice removes the <p>...</p> wrapper output by Markdown processor
  return md.render(markdownString.trim()).slice(3, -5);
}


/*
Mini-language:
  //== This is a normal heading, which starts a section. Sections group variables together.
  //## Optional description for the heading

  //=== This is a subheading.

  //** Optional description for the following variable. You **can** use Markdown in descriptions to discuss `<html>` stuff.
  @foo: #fff;

  //-- This is a heading for a section whose variables shouldn't be customizable

  All other lines are ignored completely.
*/


var CUSTOMIZABLE_HEADING = /^[/]{2}={2}(.*)$/;
var UNCUSTOMIZABLE_HEADING = /^[/]{2}-{2}(.*)$/;
var SUBSECTION_HEADING = /^[/]{2}={3}(.*)$/;
var SECTION_DOCSTRING = /^[/]{2}#{2}(.+)$/;
var VAR_ASSIGNMENT = /^(@[a-zA-Z0-9_-]+):[ ]*([^ ;][^;]*);[ ]*$/;
var VAR_DOCSTRING = /^[/]{2}[*]{2}(.+)$/;

function Section(heading, customizable) {
  this.heading = heading.trim();
  this.id = this.heading.replace(/\s+/g, '-').toLowerCase();
  this.customizable = customizable;
  this.docstring = null;
  this.subsections = [];
}

Section.prototype.addSubSection = function (subsection) {
  this.subsections.push(subsection);
};

function SubSection(heading) {
  this.heading = heading.trim();
  this.id = this.heading.replace(/\s+/g, '-').toLowerCase();
  this.variables = [];
}

SubSection.prototype.addVar = function (variable) {
  this.variables.push(variable);
};

function VarDocstring(markdownString) {
  this.html = markdown2html(markdownString);
}

function SectionDocstring(markdownString) {
  this.html = markdown2html(markdownString);
}

function Variable(name, defaultValue) {
  this.name = name;
  this.defaultValue = defaultValue;
  this.docstring = null;
}

function Tokenizer(fileContent) {
  this._lines = fileContent.split('\n');
  this._next = undefined;
}

Tokenizer.prototype.unshift = function (token) {
  if (this._next !== undefined) {
    throw new Error('Attempted to unshift twice!');
  }
  this._next = token;
};

Tokenizer.prototype._shift = function () {
  // returning null signals EOF
  // returning undefined means the line was ignored
  if (this._next !== undefined) {
    var result = this._next;
    this._next = undefined;
    return result;
  }
  if (this._lines.length </html>