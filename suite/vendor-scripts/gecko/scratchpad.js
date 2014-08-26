(function() {
  const REPO_URL = "file:///home/paul/github/CSS-Triggers/";
  let tab = gBrowser.selectedTab = gBrowser.addTab();
  let contentWindow = tab.linkedBrowser.contentWindow;
  let docshell = contentWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation);
  docshell.recordProfileTimelineMarkers = true;

  let req = new XMLHttpRequest();
  req.overrideMimeType('text/plain');
  let tests = [];
  let testsCursor = 0;
  let res = {};

  req.onerror = () => alert("Can't fetch gecko.js");
  req.onload = () => {
    try {
      let sandbox = new Cu.Sandbox(window, {sandboxPrototype:{module:{}}});
      sandbox.module = {};
      Cu.evalInSandbox(req.response, sandbox);
      let data = sandbox.module.exports.data;
      for (let key in data) {
        tests.push(key);
      }
      runNextTest();
    } catch(e) {console.error(e)}
  }

  req.open("get", REPO_URL + "gecko.js", true);
  req.send();

  function runNextTest() {
    if (testsCursor >= tests.length) {
      return finishTests();
    }

    let file = tests[testsCursor++];
    let url = REPO_URL + "/suite/" + file + ".html";

    console.log("running test:", file)

    tab.linkedBrowser.addEventListener("load", function onLoad() {
      contentWindow = tab.linkedBrowser.contentWindow;
      contentWindow = XPCNativeWrapper.unwrap(contentWindow);
      tab.linkedBrowser.removeEventListener("load", onLoad, true);
      setTimeout(() => {
        docshell.popProfileTimelineMarkers();
        contentWindow.go();
        isTestDone();
      }, 200);
    }, true);

    contentWindow.location = url;

    function isTestDone() {
      let timeout = window.setTimeout(() => {
        if (contentWindow.isDone) {
          let markers = docshell.popProfileTimelineMarkers();
          markers = markers.filter(m => !!m);
          let r = res[file] = {};
          r.paint = markers.some(m => (m.name == "DisplayList"));
          r.layout = markers.some(m => (m.name == "Reflow"));
          r.composite = true;
          runNextTest();
        } else {
          isTestDone();
        }
      }, 100);
    }
  }

  function finishTests() {
    gBrowser.addTab("data:text/plain;charset=utf-8," + JSON.stringify(res,null,2));
  }
})()
