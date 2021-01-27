var targetWindow = null;
var tabCount = 0;

function start(tab) {
  chrome.windows.getCurrent(getWindows);
}

function getWindows(win) {
  targetWindow = win;
  chrome.tabs.getAllInWindow(targetWindow.id, getTabs);
}

function getTabs(tabs) {
  tabCount = tabs.length;
  chrome.windows.getAll({ "populate": true }, expTabs);
}

function expTabs(windows) {
  var numWindows = windows.length;
  document.getElementById('content').value = '';
  for (var i = 0; i < numWindows; i++) {
    var win = windows[i];
    if (targetWindow.id == win.id) {
      var numTabs = win.tabs.length;
      for (var j = 0; j < numTabs; j++) {
        var tab = win.tabs[j];
        document.getElementById('content').value += tab.url + '\n';
      }
    }
  }
  document.getElementById('content').value = document.getElementById('content').value.split(/\s/g).filter((word, i, arr) => arr.indexOf(word) === i).sort().join('\n');
}

function openTabs() {
  var content = document.getElementById('content').value;
  var rExp = new RegExp(
    "(^|[ \t\r\n])((ftp|http|https|news|file|view-source|chrome):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-])*)"
    , "g"
  );
  var newTabs = content.match(rExp);
  if (newTabs != null) {
    for (var j = 0; j < newTabs.length; j++) {
      var nt = newTabs[j];
      chrome.tabs.create({ url: nt, active: false });
    }
  } else {
    alert('Only fully qualified URLs will be opened.');
  }
}

function copy_urls() {
  navigator.clipboard.writeText(document.getElementById('content').value).then(function () {
    console.log('Async: Copying to clipboard was successful!');
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });

}

function paste_and_open() {
  navigator.clipboard.readText()
    .then(text => {
      document.getElementById('content').value = text;
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
  openTabs();
}


document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#btOpenTabs').addEventListener('click', openTabs);
  document.querySelector('#paste_and_open').addEventListener('click', paste_and_open);
  document.querySelector('#copy_urls').addEventListener('click', copy_urls);
  start();
});
