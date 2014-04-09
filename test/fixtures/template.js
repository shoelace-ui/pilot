function template(locals) {
var jade_debug = [{ lineno: 1, filename: "template.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, code) {
jade_debug.unshift({ lineno: 0, filename: "template.jade" });
jade_debug.unshift({ lineno: 1, filename: "template.jade" });
buf.push("<h1>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 1, filename: jade_debug[0].filename });
buf.push("hello");
jade_debug.shift();
jade_debug.shift();
buf.push("</h1>");
jade_debug.shift();
jade_debug.unshift({ lineno: 2, filename: "template.jade" });
buf.push("<h2>" + (jade.escape(null == (jade_interp = code) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</h2>");
jade_debug.shift();
jade_debug.shift();}("undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"code" in locals_for_with?locals_for_with.code:typeof code!=="undefined"?code:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "h1 hello\nh2= code\n");
}
}