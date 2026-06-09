"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simplifyTransform = simplifyTransform;
var _prosemirrorTransform = require("prosemirror-transform");
var _getReplaceStep = require("./getReplaceStep");
// join adjacent ReplaceSteps
function simplifyTransform(tr) {
  if (!tr.steps.length) {
    return undefined;
  }
  const newTr = new _prosemirrorTransform.Transform(tr.docs[0]);
  const oldSteps = tr.steps.slice();
  while (oldSteps.length) {
    let step = oldSteps.shift();
    while (oldSteps.length && step.merge(oldSteps[0])) {
      const addedStep = oldSteps.shift();
      if (step instanceof _prosemirrorTransform.ReplaceStep && addedStep instanceof _prosemirrorTransform.ReplaceStep) {
        step = (0, _getReplaceStep.getReplaceStep)(newTr.doc, addedStep.apply(step.apply(newTr.doc).doc).doc);
      } else {
        step = step.merge(addedStep);
      }
    }
    newTr.step(step);
  }
  return newTr;
}