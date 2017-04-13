/* JS Document */
/* Main js */

var backToTopShown = true; // used to control back-to-top button appearance and disappearance
var disconnected = false; // true when connection is lost in middle of operations
var requestNotReceived = false;

function init() {
    document.getElementById("backToTopBtn").style.opacity = 0;
    EPPZScrollTo.scrollVerticalToElementById('Title', 0); // scroll to start at init
    google.charts.load('current', {packages: ['corechart', 'line']});
    //google.charts.setOnLoadCallback(function(){  });
}

function checkKey() {
    if (event.keyCode == 13) {
        runSim();
    }
}

function addVar() {
    var varSpan = document.createElement('span');
    varSpan.innerHTML = '<input class="txtInput" type="text" value="x" onchange=onChangeVarConst()> = <input class="txtInput" type="text" value="0"><br>';
    document.getElementById('vars').appendChild(varSpan);
}

function addConst() {
    var constSpan = document.createElement('span');
    constSpan.innerHTML = '<input class="txtInput" type="text" value="a" onchange=onChangeVarConst()> = <input class="txtInput" type="text" value="0"><br>';
    document.getElementById('consts').appendChild(constSpan);
}

function onChangeVarConst() {
    var ok = true;
    var nodes = Array.prototype.slice.call(document.getElementById('vars').children,0);
    nodes = nodes.concat(Array.prototype.slice.call(document.getElementById('consts').children,0));
    var vars = [];
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].tagName === 'SPAN') {
            vars.push(nodes[i]);
        }
    }

    for (var i = 0; i < vars.length; i++) {
        count = 1;
        for (var j = i+1; j < vars.length; j++) {
            if (vars[i].children[0].value == vars[j].children[0].value) {
                count ++;
            }
        }
        if (count > 1) {
            alert('You named ' + count + ' variables and constants with the same name: ' + vars[i].children[0].value);
            ok = false;
            break;
        }
    }

    return ok;
}

// When the user clicks on <span> (x), close the modal
function closeModal() {
    if (document.getElementById("modContent").classList.contains("modal-in")) {
        document.getElementById("modContent").classList.remove("modal-in");
    }
    if (!document.getElementById("modContent").classList.contains("modal-out")) {
        document.getElementById("modContent").classList.add("modal-out");
    }
    setTimeout(displayNone, 250);
}

function displayNone() {
    document.getElementById('myModal').style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == document.getElementById('myModal')) {
        closeModal();
    }
}

// Makes back-to-top button appear if scrolled down and
function scrollEvt() {
    if (document.getElementById("Title").getBoundingClientRect().bottom < 0 && !backToTopShown) {
        fadeIn(document.getElementById("backToTopBtn"));
        backToTopShown = true;
    }
    else if (document.getElementById("Title").getBoundingClientRect().bottom > 0 && backToTopShown) {
        fadeOut(document.getElementById("backToTopBtn"));
        backToTopShown = false;
    }
}

// fade out from http://www.chrisbuttery.com/articles/fade-in-fade-out-with-javascript/
function fadeOut(el){
  if (el.style.opacity >= 1) {
    (function fade() {
      if ((el.style.opacity -= .1) < 0) {
        el.style.display = "none";
      } else {
        requestAnimationFrame(fade);
      }
    })();
  }
}

// fade in
function fadeIn(el, display){
  if (el.style.opacity <= 0) {
    el.style.display = display || "block";

    (function fade() {
      var val = parseFloat(el.style.opacity);
      if (!((val += .1) > 1)) {
        el.style.opacity = val;
        requestAnimationFrame(fade);
      }
    })();
  }
}

function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function generateEquations() {
    if (onChangeVarConst()) {
      document.getElementById("run").innerHTML = "Running simulation...";

      var nodes = Array.prototype.slice.call(document.getElementById('vars').children,0);
      var vars = [];
      for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].tagName === 'SPAN') {
              el = [nodes[i].children[0].value,'var',nodes[i].children[1].value];
              vars.push(el);
          }
      }

      var nodes = Array.prototype.slice.call(document.getElementById('consts').children,0);
      var consts = [];
      for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].tagName === 'SPAN') {
            el = [nodes[i].children[0].value,'const',nodes[i].children[1].value];
            consts.push(el);
          }
      }

      varConsts = vars.concat(consts);
      varConsts.sort(function(a, b){return b[0].length - a[0].length;});

      var rawTxt = document.getElementById("eqTxt").value;
      rawTxt = rawTxt.split('log').join('np.log').split('ln').join('np.ln').split('^').join('**');
      var eqLines = rawTxt.split('\n');
      var eqLinesNew = [];
      for (var i = 0; i < eqLines.length; i++) {
          if (eqLines[i].charAt(0) !== "#" && eqLines[i].trim().length > 0) {
              eqLinesNew.push(eqLines[i]);
          }
      }
      eqLines = eqLinesNew;

      for (var k = 0; k < eqLines.length; k++) {
          var eqString = eqLines[k];
          eqIndex = eqString.indexOf('=');
          if (eqString.substr(eqIndex+1,eqString.length).trim().charAt(0) !== '-' && eqString.substr(eqIndex+1,eqString.length).trim().charAt(0) !== '+') {
              eqString = eqString.substr(0,eqIndex) + '= +' + eqString.substr(eqIndex+1,eqString.length).trim();
          }
          var processedEqString = eqString;

          for (var i = 0; i < varConsts.length; i++) {
              replaceString = '!'.repeat(varConsts[i][0].length);

              modStr = '';
              if (varConsts[i][1] === "var") {
                  modStr = '{'+varConsts[i][0]+'}';
                  replaceString = '{'+replaceString+'}';
              }
              else if (varConsts[i][1] === "const"){
                  modStr = varConsts[i][0];
                  replaceString = replaceString;
              }

              indexes = getIndicesOf(varConsts[i][0],eqString.substr(eqIndex,eqString.length)).sort(function(a,b){return b-a});
              eqString = eqString.substr(0,eqIndex) + eqString.substr(eqIndex,eqString.length).split(varConsts[i][0]).join(replaceString);

              for (var j = 0; j < indexes.length; j++) {
                  processedEqString = processedEqString.substr(0,indexes[j]+eqIndex) + modStr + processedEqString.substr(indexes[j]+eqIndex+varConsts[i][0].length,processedEqString.length);
              }
          }

          var level = 0;
          for (var i = 0; i < processedEqString.length; i++) {
              if (processedEqString[i] === '(') {
                  level++;
              }
              else if (processedEqString[i] === ')') {
                  level = level - 1;
              }
              if ((processedEqString[i] === '+' || processedEqString[i] === '-') && level == 0) {
                  processedEqString = processedEqString.substr(0,i) + '@' + processedEqString.charAt(i) + processedEqString.substr(i+1,processedEqString.length);
                  i++;
              }
          }

          eqLines[k] = processedEqString;
      }

      return eqLines.join("\n");
    }
}

function runSim() {
  if (onChangeVarConst()) {
      document.getElementById('graphsPanel').innerHTML = '';
      var sep = "----------------------------------------------------------\n";
      var equations = generateEquations();

      var nodes = Array.prototype.slice.call(document.getElementById('vars').children,0);
      var vars = [];
      for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].tagName === 'SPAN') {
              el = [nodes[i].children[0].value,'var',nodes[i].children[1].value];
              vars.push(el);
          }
      }

      var nodes = Array.prototype.slice.call(document.getElementById('consts').children,0);
      var consts = [];
      for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].tagName === 'SPAN') {
            el = [nodes[i].children[0].value,'const',nodes[i].children[1].value];
            consts.push(el);
          }
      }

      outStr = '#constants\n';
      for (var i = 0; i < consts.length; i++) {
          outStr = outStr + consts[i][0] + '=' + consts[i][2] + '\n';
      }
      outStr = outStr + sep + '#Initial conditions\n';
      for (var i = 0; i < vars.length; i++) {
          outStr = outStr + vars[i][0] + '=' + vars[i][2] + '\n';
      }

      var evtStr = '';
      evtStrLines = document.getElementById('evtTxt').value.split('\n');
      for (var i = 0; i < evtStrLines.length; i++) {
          if (evtStrLines[i].trim().length > 0) {
              if (evtStrLines[i].charAt(0) !== '#') {
                  evtStr = evtStr + evtStrLines[i] + '\n';
              }
          }
      }

      outStr = outStr + sep + equations + '\n' + sep + evtStr + sep;

      var simTime = document.getElementById('simTime').value;
      var timeStep = document.getElementById('timeStep').value;
      msg = createFileMsg([outStr,simTime,timeStep]);
      sendMessageToServer('Sending requests...', "misc");
      sendMessageToServer(msg,'sendSimFile');
  }
}

function showExample() {
    document.getElementById('vars').innerHTML = '<span><input class="txtInput" type="text" value="p1" onchange=onChangeVarConst()> = <input class="txtInput" type="text" value="0"></span><br><span><input class="txtInput" type="text" value="p2" onchange=onChangeVarConst()> = <input class="txtInput" type="text" value="0"></span><br>';
    document.getElementById('consts').innerHTML = '<span><input class="txtInput" type="text" value="a1" onchange=onChangeVarConst()> = <input class="txtInput" type="text" value="20"></span><br><span><input class="txtInput" type="text" value="a2" onchange=onChangeVarConst()> = <input class="txtInput" type="text" value="20"></span><br><span><input class="txtInput" type="text" value="g1" onchange=onChangeVarConst()> = <input class="txtInput" type="text" value="1/30.0"></span><br><span><input class="txtInput" type="text" value="g2" onchange=onChangeVarConst()> = <input class="txtInput" type="text" value="1/30.0"</span>';
    document.getElementById('eqTxt').value = 'p1 = a1  -g1*p1 \np2 = a2  -g2*p2';
    document.getElementById('evtTxt').value = '60,-1\n60,-1';
}

function displaySimOutput(files) {
    for (var i = 0; i < files.length; i++) {
        var method = 'Deterministic (Runge Kutta) ';
        if (i == 1) {
            method = 'Stochastic (Gillespie) ';
        }
        for (var j = 0; j < files[i].length; j++) {
            d = files[i][j];
            console.log(d);
            drawData(d[0],d[1],d[2],d[3],method+d[3])
        }
    }
}

function createFileMsg(info) {
    var sep = ":::";
    var msg = "";
    for (var i = 0; i < info.length; i++) {
        msg = msg + info[i] + sep;
    }
    msg = msg.substr(0,msg.length-sep.length);
    return msg;
}


function decodeFileMsg(content) {
    // var sep = ":::";
    // var fileSep = "|:||||:|";

    // files = content.data.split(fileSep);
    // for (var i = 0; i < files.length; i++) {
    //     files[i] = files[i].split(sep);
    // }

    files = content.data.split(sep+sep+sep+sep);
    for (var i = 0; i < files.length; i++) {
        files[i] = files[i].split(sep+sep+sep);
        for (var j = 0; j < files[i].length; j++) {
            files[i][j] = files[i][j].split(sep+sep);
            for (var k = 0; k < files[i][j].length; k++) {
                files[i][j][k] = files[i][j][k].split(sep);
            }
        }
    }

    return files;
}


function saveAs(uri, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); // Firefox requires the link to be in the body
        link.download = filename;
        link.href = uri;
        link.click();
        document.body.removeChild(link); // remove the link when done
    } else {
        location.replace(uri);
    }
}

function drawData(x,y,xLab,yLab,titleLab) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', xLab);
    data.addColumn('number', yLab);
    var d = [];
    for (var i = 0; i < x.length; i++) {
        d.push( [parseFloat(x[i]), parseFloat(y[i])] );
    }

    data.addRows(d);

    var options = {
      title: titleLab,
      hAxis: {
        title: xLab
      },
      vAxis: {
        title: yLab
      }
    };

    var graphPane = document.getElementById('graphsPanel');
    graphPane.innerHTML = graphPane.innerHTML + '<div id="chart_div' + titleLab + '"></div>';
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'+titleLab));

    chart.draw(data, options);
}
