var frequencyEvent = function(opts) {
   lastId2++;
   this["id"] = lastId2;
   for (let key in opts) {
      this[key] = opts[key];
   }
}

var currentFrequencyNodes = [];
var mouseDownTime = 0;
var ctxFreq;
currentFrequencyNodes.push(new frequencyEvent({
   type: "exponentialRamp",
   startVal: 440,
   endVal: 440,
   startTime: 0,
   endTime: 0.2,
}))
currentFrequencyNodes.push(new frequencyEvent({
   type: "exponentialRamp",
   startVal: 440,
   endVal: 550,
   startTime: 0.2,
   endTime: 0.4,
}))
currentFrequencyNodes.push(new frequencyEvent({
   type: "linearRamp",
   startVal: 550,
   endVal: 660,
   startTime: 0.4,
   endTime: 0.6,
}))
currentFrequencyNodes.push(new frequencyEvent({
   type: "exponentialRamp",
   startVal: 660,
   endVal: 880,
   startTime: 0.6,
   endTime: 0.8,
}))
currentFrequencyNodes.push(new frequencyEvent({
   type: "exponentialRamp",
   startVal: 880,
   endVal: 440,
   startTime: 0.8,
   endTime: 1,
}))


function removeFrequencyNode(i) {
   if (currentFrequencyNodes.length<3) {
      message("Minimum 2 Sections!");
      return;
   }
   let mid = (currentFrequencyNodes[i].startTime + currentFrequencyNodes[i].endTime) / 2;
   if (i == 0) {
      currentFrequencyNodes[i + 1].startTime = 0;
   } else if (i == currentFrequencyNodes.length - 1) {
      currentFrequencyNodes[i - 1].endTime = 1;
   } else {
      let midV = (currentFrequencyNodes[i+1].startVal + currentFrequencyNodes[i-1].endVal) / 2;
      currentFrequencyNodes[i - 1].endVal = midV;
      currentFrequencyNodes[i + 1].startVal = midV;
      currentFrequencyNodes[i - 1].endTime = mid;
      currentFrequencyNodes[i + 1].startTime = mid;

   }
   console.log(mid);
   $("#frequencyNode"+currentFrequencyNodes[i].id).remove();
   if (i == currentFrequencyNodes.length-1) {
      $("#addBehindfrequencyNode"+currentFrequencyNodes[i-1].id).remove();
   }


   currentFrequencyNodes.splice(i, 1);

   if (i==0) {
      document.getElementById("frequencyNode"+currentFrequencyNodes[0].id).appendChild(getStartFrequencyValueGrabberDiv(0));
   }

   setFrequencyNodeDims();
}

function addFrequencyNodeAfter(id) {
   let i = 0;
   i = getFrequencyNodeById(id);
   console.log(i);
   let lng = currentFrequencyNodes.length;
   let newDur = 1 / (lng + 1);
   let lowestDur = 9999;
   for (let j = 0; j < lng; j++) {
      if (currentFrequencyNodes[j].endTime - currentFrequencyNodes[j].startTime < lowestDur) {
         lowestDur = currentFrequencyNodes[j].endTime - currentFrequencyNodes[j].startTime;
      }
   }
   newDur = Math.min(newDur, lowestDur, 0.2);

   //Downwards of i
   for (let j = 0; j <= i; j++) {

      currentFrequencyNodes[j].endTime -= newDur / lng * (j + 1);
      currentFrequencyNodes[j].startTime -= newDur / lng * j;

   }

   //Upwards of i
   for (let j = i + 1; j < lng; j++) {
      currentFrequencyNodes[j].endTime += newDur / (lng) * (lng - 1 - j);
      currentFrequencyNodes[j].startTime += newDur / (lng) * (lng - 1 - j + 1);

   }


   let sV = currentFrequencyNodes[i].endVal;
   let eV = currentFrequencyNodes[i + 1].startVal;
   let sT = currentFrequencyNodes[i].endTime;
   let eT = currentFrequencyNodes[i + 1].startTime;

   addFrequencyNodeAt(sV, eV, sT, eT, i);
   //addFrequencyNodeSimple(sV,eV,sT,eT,i);
   /*let gEvent = new frequencyEvent({
      type:"exponentialRamp",
      startVal:sV,
      endVal:eV,
      startTime:sT,
      endTime:eT,
   })
   currentFrequencyNodes.splice(i+1, 0, gEvent);
   let gNodeDiv = getFrequencyNodeDiv(i+1);
   $(gNodeDiv).insertBefore('#frequencyNode'+i);
   gEvent.div = gNodeDiv;*/
   setFrequencyNodeDims();
   //Shift

}

function addFrequencyNodeSimple(sV, eV, sT, eT, i) {

   let gEvent = new frequencyEvent({
      type: "exponentialRamp",
      startVal: sV,
      endVal: eV,
      startTime: sT,
      endTime: eT,
   })
   currentFrequencyNodes.push(gEvent);
   let id = gEvent.id
   i = currentFrequencyNodes.length - 2;
   let gNodeDiv = getFrequencyNodeDiv(i + 1);
   $("#frequencyNodes").append(gNodeDiv);
   gEvent.div = gNodeDiv;
}

function addFrequencyNodeWDiv(sV, eV, sT, eT, i) {
   let gEvent = currentFrequencyNodes[i];
   let gNodeDiv = getFrequencyNodeDiv(i);
   $("#frequencyNodes").append(gNodeDiv);
   gEvent.div = gNodeDiv;
}

function addFrequencyNodeWoDiv(sV, eV, sT, eT, i) {

   let gEvent = new frequencyEvent({
      type: "exponentialRamp",
      startVal: sV,
      endVal: eV,
      startTime: sT,
      endTime: eT,
   })
   currentFrequencyNodes.push(gEvent);

}

function addFrequencyNodeAt(sV, eV, sT, eT, i) {

   let gEvent = new frequencyEvent({
      type: "exponentialRamp",
      startVal: sV,
      endVal: eV,
      startTime: sT,
      endTime: eT,
   })

   currentFrequencyNodes.splice(i + 1, 0, gEvent);
   let gNodeDiv = getFrequencyNodeDiv(i + 1);
   $(gNodeDiv).insertBefore('#frequencyNode' + i);
   gEvent.div = gNodeDiv;
}

function duplicateFrequencyEvents() {
   let clones = [];
   for (let i = 0; i < currentFrequencyNodes.length; i++) {
      let clone = [];
      currentFrequencyNodes[i].startTime *= 0.5;
      currentFrequencyNodes[i].endTime *= 0.5;

   }
   let lng = currentFrequencyNodes.length;
   for (var i = 0; i < lng; i++) {
      /*let clone = Object.assign({},currentFrequencyNodes[i]);
      clone.startTime+=0.5;
      clone.endTime+=0.5;
      currentFrequencyNodes.push(clone);*/
      let n = currentFrequencyNodes[i];
      addFrequencyNodeWoDiv(n.startVal, n.endVal, n.startTime + 0.5, n.endTime + 0.5, 0);
   };
   for (var i = lng; i < lng * 2; i++) {
      let n = currentFrequencyNodes[i];
      addFrequencyNodeWDiv(n.startVal, n.endVal, n.startTime + 0.5, n.endTime + 0.5, i);
   };
   setFrequencyNodeDims();
}

function setEndTimeFreq(i, endTime) {
   if (i < currentFrequencyNodes.length - 1) {
      if (currentFrequencyNodes[i].startTime >= endTime - 0.01) {
         currentFrequencyNodes[i].endTime = currentFrequencyNodes[i].startTime + 0.01;
         currentFrequencyNodes[i + 1].startTime = currentFrequencyNodes[i].startTime + 0.01;
      } else if (currentFrequencyNodes[i + 1].endTime <= endTime + 0.01) {
         currentFrequencyNodes[i].endTime = currentFrequencyNodes[i + 1].endTime - 0.01;
         currentFrequencyNodes[i + 1].startTime = currentFrequencyNodes[i + 1].endTime - 0.01;
      } else {
         currentFrequencyNodes[i].endTime = endTime;
         currentFrequencyNodes[i + 1].startTime = endTime;
      }

   }

}
function setStartTimeFreq(i, startTime) {
   if (i > 0) {
      if (currentFrequencyNodes[i].endTime <= startTime ) {
         currentFrequencyNodes[i].startTime = currentFrequencyNodes[i].endTime + 0.01;
         currentFrequencyNodes[i - 1].endTime = currentFrequencyNodes[i].startTime - 0.01;
      } else if (currentFrequencyNodes[i - 1].startTime >= startTime ) {
         currentFrequencyNodes[i].startTime = currentFrequencyNodes[i - 1].endTime + 0.01;
         currentFrequencyNodes[i - 1].endTime = currentFrequencyNodes[i].startTime - 0.01;
      } else {
         currentFrequencyNodes[i].startTime = startTime;
         currentFrequencyNodes[i - 1].endTime = startTime;
      }

   }

}

function getFrequencyNodeById(id) {
   for (let i = 0; i < currentFrequencyNodes.length; i++) {
      if (currentFrequencyNodes[i].id == id) {
         return i;
      }
   }
}

function getNextNodeByIdFreq(id) {
   let gn = currentFrequencyNodes[getFrequencyNodeById(id)];
   let lowest = 1;
   let lowstId = -1;
   for (let i = 0; i < currentFrequencyNodes.length; i++) {
      if (currentFrequencyNodes[i].endTime <= lowest && gn.endTime < currentFrequencyNodes[i].endTime) {
         lowest = currentFrequencyNodes[i].endTime;
         lowestId = i;
      }
   }
   return lowestId;
}

function setEndValueFreq(i, endValue) {

   let node1 = currentFrequencyNodes[i];
   let val = Math.min(2000, Math.max(-2000, endValue));
   node1.endVal = val;
   if (i + 1 < currentFrequencyNodes.length) {
      let node2 = currentFrequencyNodes[i + 1];
      node2.startVal = val;
   }
   $("#grabberFreqInput" + node1.id).val(val); //("value",val);
}
function setStartValueOfFreq(i, endValue) {

   let node1 = currentFrequencyNodes[i];
   let val = Math.min(2000, Math.max(-2000, endValue));
   node1.startVal = val;
   if (0 < i) {
      let node2 = currentFrequencyNodes[i - 1];
      node2.endVal = val;
   }
   $("#grabberFreqInput" + node1.id).val(val); //("value",val);
}

function setStartValueFreq(i, endValue) {
   let node1 = currentFrequencyNodes[0];
   let val = Math.min(2000, Math.max(0, endValue));
   node1.startVal = val;

}

function setOneDivSize(id) {

}

function newFrequencyNode(type, startVal, endVal, startTime, endTime) {
   currentFrequencyNodes.push(new frequencyEvent({
      type: type,
      startVal: startVal,
      endVal: endVal,
      startTime: startTime,
      endTime: endTime
   }))
}

function cleanFrequencyTransitions() {
   for (let i = 0; i < currentFrequencyNodes.length - 1; i++) {
      if (currentFrequencyNodes[i].endVal != currentFrequencyNodes[i].startVal) {
         let mVal = Math.floor(100 * (currentFrequencyNodes[i].endVal + currentFrequencyNodes[i].startVal)) / 200;
         currentFrequencyNodes[i].endVal = mVal;
         currentFrequencyNodes[i].startVal = mVal;
      }
   };
}


function getPeakValuePositionFreq(ind) {
   let node = currentFrequencyNodes[ind];
   let x = mainW * (node.endTime);
   let y = ((2000 - node.endVal) / 2000) * botHt;
   return {
      x: x,
      y: y
   }
}

function getExponentialRampPoint(curTime, startTime, endTime, startVal, endVal) {
   let dur = endTime - startTime;
   return Math.max(0.0001, startVal) * Math.pow((Math.max(0.0001, endVal) / Math.max(0.0001, startVal)), ((curTime - startTime) / dur));

}

function frequencyNodeContainer() {

   let cont = createDiv("frequencyNodes", "frequencyNodes secondColor", {

      width: mainW + "px",
      marginLeft: lMarg + "px",
      marginRight: rMarg + "px",
      height: mainH+topHt/2 + "px",
      position: "relative",
   });

   let titleLab = createDiv("durInputLabel","labelTop",{
      position: "relative",
      top: "0px",
      left: 0+"px",
      height:topHt/2+"px",
   },{
      innerHTML: "Frequency"
   })
   cont.appendChild(titleLab)


   for (let i = 0; i < currentFrequencyNodes.length; i++) {
      currentFrequencyNodes[i].div = getFrequencyNodeDiv(i);
      cont.appendChild(currentFrequencyNodes[i].div);

   }

   let cnv = document.createElement("canvas");
   cnv.width = mainW;
   cnv.height = botHt;
   cnv.style.position = "absolute";
   cnv.style.bottom = "0px";
   cont.appendChild(cnv);

   ctxFreq = cnv.getContext("2d");

   document.addEventListener("mouseup", function(e) {
      if (draggingFreq) {
         let i = draggingFreq - 1;
         console.log(i)
         let now = window.performance.now();
         let ind = getFrequencyNodeById(i);
         let mouseX = e.pageX;
         let mouseY = e.pageY;
         /*       if (now - mouseDownTime > 200) {
                   let newX = ((mouseX - $("#frequencyNodes").offset().left) / $("#frequencyNodes").width());
                   let dif = (mouseY - $("#frequencyNodes").offset().top - topHt );

                   let newY = Math.min(2000,Math.max(0,(botHt - dif)/botHt * 2000));
                   
                   console.log(newY);
                   setEndTimeFreq(ind,newX);
                   setEndValueFreq(ind,newY);
                   //document.getElementById("grabberFreqSpan"+currentFrequencyNodes[ind].id).innerHTML=Math.floor(currentFrequencyNodes[ind].endVal)
                   $("#grabberFreq"  + currentFrequencyNodes[ind].id + " span").html(Math.floor(currentFrequencyNodes[ind].endVal));
                   $("#frequencyNode"+ currentFrequencyNodes[ind].id).css("width",(currentFrequencyNodes[ind].endTime-currentFrequencyNodes[ind].startTime)*mainW);
                   $("#frequencyNode"+(currentFrequencyNodes[ind+1].id)).css("width",(currentFrequencyNodes[ind+1].endTime-currentFrequencyNodes[ind+1].startTime)*mainW);
                   $("#frequencyNode"+(currentFrequencyNodes[ind].id  )).css("left",(currentFrequencyNodes[ind].startTime)*mainW);
                   $("#frequencyNode"+(currentFrequencyNodes[ind+1].id)).css("left",(currentFrequencyNodes[ind+1].startTime)*mainW);

                   let pos = getPeakValuePositionFreq(ind);


                   $("#grabberFreq"+i).css("top",topHt+pos.y-$("#grabberFreq"+i).height()/2);
                   
                } */
         if (now - mouseDownTime < 200) {

            if (settingFrequency>=-1) {
               setFrequency();
               console.log(1)
            } else {
            
               if (ind == 0 && e.target.id.split("Start").length>1) {
console.log(12)
                  $("#grabberFreqStart" + currentFrequencyNodes[ind].id + " input").val(currentFrequencyNodes[ind].endVal);
                  $("#grabberFreqStart" + currentFrequencyNodes[ind].id).addClass("clicked");
                  $("#grabberFreqStart" + currentFrequencyNodes[ind].id + " input").focus();
                  settingFrequency = -1;
                  
               } else {
                  console.log(122)
                  $("#grabberFreq" + currentFrequencyNodes[ind].id + " input").val(currentFrequencyNodes[ind].endVal);
                  $("#grabberFreq" + currentFrequencyNodes[ind].id).addClass("clicked");
                  $("#grabberFreq" + currentFrequencyNodes[ind].id + " input").focus();
                  settingFrequency = ind;
               }
               
            showPiano($("#frequencyNodes").offset().left, $("#frequencyNodes").offset().top + $("#frequencyNodes").height(), frequencyPianoMoveCallback, frequencyPianoClickCallback);
            
            

         }
      }


         document.removeEventListener("mousemove", moveAllFreq);
         document.removeEventListener("mousemove", moveVerticalFreq);
         draggingFreq = false;
      }})
      return cont;
   }

var settingFrequency = -2;

function setFrequency(e) {
   
   $(".clicked").removeClass("clicked");
   
   hidePiano();
   if (settingFrequency == -1) {
      let origVal = currentFrequencyNodes[0].startVl;
      let val = $("#grabberFreqStart" + currentFrequencyNodes[0].id + " input").val();
      if (val <= 2000 && val >= 0) {
         currentFrequencyNodes[0].startVal = val;
         
      }
   } else {
      let origVal = currentFrequencyNodes[settingFrequency].endVal;
      let val = $("#grabberFreq" + currentFrequencyNodes[settingFrequency].id + " input").val();
      if (val <= 2000 && val >= 0) {
         currentFrequencyNodes[settingFrequency].endVal = val;
         if (settingFrequency<currentFrequencyNodes.length-1) {
            currentFrequencyNodes[settingFrequency + 1].startVal = val;
         }
      }
      
   }
   settingFrequency=-2;
   setFrequencyNodeDims();


}
var currentPianoNote;
function frequencyPianoMoveCallback(e) {
   /*let key = getKeyByDim(e.clientX - lMarg, e.clientY - $("#piano").offset().top)
   console.log(key);
   if (key != undefined) {
      if (key != currentPianoNote) {
         endNotes();
         currentPianoNote = key;
         playNote(key, 5);
         setEndValueFreq(settingFrequency, getFrequency(key));
      }
   }*/
}
var notePlayed = false;
function frequencyPianoClickCallback(e) {
   e.preventDefault();
   console.log(e);
   notePlayed=true
   let key = getKeyByDim(e.clientX - lMarg, e.pageY - $("#piano").offset().top)
   console.log(key);
   if (key != undefined) {
      if (key != currentPianoNote) {
         endNotes();
         currentPianoNote = key;
         playNote(key, 5);
         setEndValueFreq(settingFrequency, getFrequency(key));
      }
      /*playNote(key, 0.5);
      setEndValueFreq(settingFrequency, getFrequency(key));*/
      setFrequencyNodeDims();
      //$("#grabberFreq" + currentFrequencyNodes[settingFrequency].id).blur();
     // setFrequency();
      //hidePiano();
   }
}

function setFrequencyKey(e) {
   if (e.key == "Enter") {
      //$("#grabberFreq" + currentFrequencyNodes[settingFrequency].id).blur();
      if (settingFrequency>=0) {
         $("#grabberFreq" + currentFrequencyNodes[settingFrequency].id).removeClass("clicked");
         setFrequency();
      }  else if (settingFrequency== -1) {
         $("#grabberFreqStart" + currentFrequencyNodes[0].id).removeClass("clicked");
         setFrequency();
      }
   }


}

function getStartFrequencyValueGrabberDiv(i) {

   let y = ((2000 - currentFrequencyNodes[0].startVal) / 2000) * botHt;
   let grabber = createDiv("grabberFreqStart" + currentFrequencyNodes[0].id, "grabber secondColor", {
      top: (y + topHt) + "px",
      zIndex: 100,
      left: "-15px",
   })
   let span = document.createElement("span");
   span.innerHTML = Math.floor(currentFrequencyNodes[i].startVal);
   grabber.appendChild(span);


   let grabInp = createTextInput("grabberFreqInputStart" + currentFrequencyNodes[0].id, "grabberInput");
   grabber.appendChild(grabInp);
   //grabInp.addEventListener("blur", setFrequency);
   return grabber;
}

function getFrequencyValueGrabberDiv(i) {
   let pos = getPeakValuePositionFreq(i);
   let grabber = createDiv("grabberFreq" + currentFrequencyNodes[i].id, "grabber secondColor", {
      top: (pos.y + topHt) + "px",
      zIndex: 100,
   })
   let span = document.createElement("span");
   span.innerHTML = Math.floor(currentFrequencyNodes[i].endVal);
   grabber.appendChild(span);


   let grabInp = createTextInput("grabberFreqInput" + currentFrequencyNodes[i].id, "grabberInput");
   grabber.appendChild(grabInp);
   //grabInp.addEventListener("blur", setFrequency);
   return grabber;
}

function showGhostBar(e) {
   $("#ghostbar").css("left", e.pageX + 2);
}

function showGhostGrabFreq(e) {
   if (!$("#ghostGrabberFreq").length) {
      let gg = $('<div>', {
         id: 'ghostGrabberFreq',
         css: {
            top: e.pageY - $("#grabberFreq" + (draggingFreq - 1)).height() / 2,
            left: e.pageX - $("#grabberFreq" + (draggingFreq - 1)).width() / 2,
            width: $("#grabberFreq" + (draggingFreq - 1)).width(),
            height: $("#grabberFreq" + (draggingFreq - 1)).height(),
         }
      }).appendTo('body');

   }
   $("#ghostGrabberFreq").css("left", e.pageX - $("#grabberFreq" + (draggingFreq - 1)).width() / 2);
   $("#ghostGrabberFreq").css("top", e.pageY - $("#grabberFreq" + (draggingFreq - 1)).height() / 2);
}

function clamp(id1, id2) {
   let el1 = document.getElementById(id1);
   let el2 = document.getElementById(id2);

}

function drawFrequencyNodes(ct) {
   ctxFreq.clearRect(0, 0, mainW, botHt);
   drawPlayBar(ctxFreq);
   for (let i = 0; i < currentFrequencyNodes.length; i++) {
      let node = currentFrequencyNodes[i];

      let xEnd = node.endTime * mainW;
      let xStart = node.startTime * mainW;
      let yEnd = cnvMarg + (botHt - cnvMarg * 2) - node.endVal / 2000 * (botHt - cnvMarg * 2);
      let yStart = cnvMarg + (botHt - cnvMarg * 2) - node.startVal / 2000 * (botHt - cnvMarg * 2);

      let dur = Math.floor(100 * (node.endTime - node.startTime)) / 100;
      let nodeW = xStart - xEnd;

      if (currentFrequencyNodes.length - 1 > i) {
         drawDashline(ctxFreq, xEnd, botHt);
      }

      ctxFreq.lineWidth = 2;
      ctxFreq.strokeStyle = "white";
      if (node.type == "linearRamp") {
         ctxFreq.beginPath();

         ctxFreq.moveTo(xStart, yStart);
         ctxFreq.lineTo(xEnd, yEnd);
         ctxFreq.stroke();
         ctxFreq.closePath();
      } else
      if (currentFrequencyNodes[i].type == "exponentialRamp") {
         ctxFreq.beginPath();
         ctxFreq.moveTo(xStart, yStart);
         for (let j = 1; j < 100; j += 1) {
            let curT = (node.startTime + dur * j / 100);
            let x = mainW * curT;
            let y = cnvMarg + (botHt - cnvMarg * 2) - getExponentialRampPoint(curT, node.startTime, node.endTime, Math.max(0.0001, node.startVal / 2000), Math.max(0.0001, node.endVal / 2000)) * (botHt - 2 * cnvMarg);
            ctxFreq.lineTo(x, y);
         }
         ctxFreq.lineTo(xEnd, yEnd);
         ctxFreq.stroke();
         ctxFreq.closePath();
      };
   }
}

function getDividerFrequencyNode(ind) {
   let gn1 = currentFrequencyNodes[ind];
   let gn2 = currentFrequencyNodes[ind + 1];

   let slider = createDiv(gn1.id + "slider", "slider dragbar", {
      position: "absolute",
      right: "0px",
      top: "0px",
      height: "100%",
      width: "5px"
   }, {}, {
      idVal: ind,
   });

   return slider;
}

function setFrequencyNodeDims() {
   for (let i = 0; i < currentFrequencyNodes.length; i++) {
      currentFrequencyNodes[i].div.style.width = (currentFrequencyNodes[i].endTime - currentFrequencyNodes[i].startTime) * mainW + "px";
      $("#frequencyNode" + currentFrequencyNodes[i].id).css("width", (currentFrequencyNodes[i].endTime - currentFrequencyNodes[i].startTime) * mainW);
      $("#frequencyNode" + currentFrequencyNodes[i].id).css("left", (currentFrequencyNodes[i].startTime) * mainW);


      let pos = getPeakValuePositionFreq(i);

      $("#grabberFreq" + (currentFrequencyNodes[i].id) + " span").html(Math.floor(currentFrequencyNodes[i].endVal));
      $("#grabberFreq" + currentFrequencyNodes[i].id).css("top", pos.y + topHt);

      $("#grabberFreqStart0 span").html(Math.floor(100 * currentFrequencyNodes[0].startVal) / 100);
      $("#grabberFreqStart0").css("top", (1 - currentFrequencyNodes[0].startVal / 2000) * botHt + "px");
   }
}

function getOwnIndex(frequencyNode) {
   for (let key in currentFrequencyNodes) {
      if (currentFrequencyNodes[key].id == frequencyNode.id) {
         return key;
      }
   }
}

function getFrequencyNodeDiv(i) {
   let frequencyNode = currentFrequencyNodes[i];
   let idNUm = frequencyNode.id;
   let id = "frequencyNode" + frequencyNode.id;
   let outer = createDiv(id, "frequencyNode", {
      /*left:frequencyNode.startTime*100+"%",*/
      width: (frequencyNode.endTime - frequencyNode.startTime) * mainW + "px",
      height: "25%",
      position: "absolute",
      left: frequencyNode.startTime * mainW + "px",
   });

   let hoverOpts = createDiv(id + "hoverOpts", "hoverOpts", {
      position: "relative",
   },{
      /*innerHTML:"Settings",*/
   })
   let img = new Image();

   img.src = "img/Settings.png"
   hoverOpts.append(img)
   hoverOpts.addEventListener("click",function(e) {
      if (e.target.className.split("addBeh").length<2) {
         openFreqNodeSettings(i);
      }
   })

 /*  let dropDown = createDropDown(id + "type", "frequencyNodeDropdown", {
      exponentialRamp: "Exponential Ramp",
      linearRamp: "Linear Ramp",

   }, {
      left: "0px",
      width: "100%",
      position: "relative",
   })
   dropDown.addEventListener("change", function(e) {
      currentFrequencyNodes[i].type = "linearRamp";
   })
   hoverOpts.appendChild(dropDown)*/
   outer.appendChild(hoverOpts);

   if (i < currentFrequencyNodes.length - 1) {
      let addBehind = createDiv("addBehind" + id, "addBehind", {
         float: "right"
      }, {
         innerHTML: "+",
      })
      addBehind.addEventListener("click", function(e) {
         addFrequencyNodeAfter(frequencyNode.id);
      })
      outer.appendChild(addBehind);
   }
   /* if (i == 0) {
       let addBefore = createDiv("addBefore"+i,"addBefore button",{
          float:"left"
       },{
          innerHTML: "Add Section",
       })
       
       outer.appendChild(addBefore);
    }*/



   if (i == 0) {
      let grab0 = getStartFrequencyValueGrabberDiv(i);
      outer.appendChild(grab0);
      grab0.addEventListener("mousedown", function(e) {

         draggingFreq = parseInt(frequencyNode.id) + 1;

         mouseDownTime = window.performance.now();
         let dms = $(currentFrequencyNodes[0].div).offset();


         document.addEventListener("mousemove", moveVerticalFreq);
      })
   }
   let grab = getFrequencyValueGrabberDiv(i);
   outer.appendChild(grab);
   grab.addEventListener("mousedown", function(e) {

      draggingFreq = parseInt(frequencyNode.id) + 1;

      mouseDownTime = window.performance.now();
      let dms = $(currentFrequencyNodes[i].div).offset();


      document.addEventListener("mousemove", moveAllFreq);
   })



   return outer;

}

function openFreqNodeSettings(ind) {
   let node = currentFrequencyNodes[ind];
   let id = node.id;
   let el = $("#frequencyNode"+id);
   let existNode = $(".nodeSettings");
   let l = el.offset().left;
   let t = el.offset().top+el.height();
   if (existNode.length) {
      l = $(existNode[0]).offset().left;
      t = t+botHt;
      $(".nodeSettings").fadeOut().remove();
   }
   let cont = createDiv("freqNodeSettings","nodeSettings",{
      width:Math.max(100,el.width())+"px",
      
      top:t+"px",
      left:l+"px",
      position: "absolute",
      zIndex:10001
   })

   let close = createDiv("closeBut","closeBut",{
      height: "15px",
      width: "15px",
      position: "absolute",
      borderRadius: "7px",
      top:"1px",
      right:"1px",
   }, {
      innerHTML: "X",
   })
   close.addEventListener("click",function() {
      $(".nodeSettings").fadeOut().remove();
   })
   


     let dropDown = createDropDown("frequencyNode"+id+ "type", "frequencyNodeDropdown", {
      exponentialRamp: "Exponential Ramp",
      linearRamp: "Linear Ramp",

   }, {
      left: "10%",
      width: "80%",
      position: "relative",
   })

     let moveLR = createDiv("moveLR","move",{
     })
     if (ind>0) {
        let movL = createDiv("moveLeft","button",{
         float:"left",
         width: "30%",
         marginTop:"5px",
         marginLeft:"10%",
        },{
         innerHTML:"<---",
         onclick: function(e) {
            if (ind>0) {
               openFreqNodeSettings(ind-1)
            } 
         }
      });
        moveLR.appendChild(movL);
      
     }
     if (ind <currentFrequencyNodes.length-1) {
         let movR = createDiv("moveRight","button",{
         float:"left",
         width: "30%",
         marginTop:"5px",
         marginLeft:"5%",
        },{
         innerHTML:"--->",
         onclick: function(e) {
            if (ind<currentFrequencyNodes.length-1) {
               openFreqNodeSettings(ind+1)
            } 
         }
        })
         moveLR.appendChild(movR);
      
     }
   
   dropDown.addEventListener("change", function(e) {
      currentFrequencyNodes[ind].type = dropDown.value;
   })
   let setTime = createDiv("setTime","setTime",{
      width:"80%",
      marginLeft: "10%"
   });
   let titleTimeLab = createDiv("label","label",{
      width:"80%",
      textAlign:"center",
      marginLeft:"10%",
      marginTop:"4%",
      float:"none",
      },{
         innerHTML:"Time",
      })
   setTime.appendChild(titleTimeLab);
   if (ind > 0 ) {

      let timeCont = createDiv("timeCont","timeCont",{

      });
      if (ind == currentFrequencyNodes.length-1) {
         timeCont.style.width="80%";
         timeCont.style.marginLeft = "10%";
      }
      let startTimeLab = createDiv("label","label",{

      },{
         innerHTML:"Start",
      })
      let startTimeSlider = createSlider("setTimeSlider","setTimeSlider",{
      },{
         
      },{
         min:currentFrequencyNodes[ind-1].startTime+0.01 || 0.01,
         max:currentFrequencyNodes[ind].endTime-0.01 || 0.99,
         value: currentFrequencyNodes[ind].startTime,
         step: 0.01,
      })
      startTimeSlider.value = currentFrequencyNodes[ind].starTime;
      startTimeSlider.addEventListener("change",function() {
        
         setStartTimeFreq(ind,parseFloat(startTimeSlider.value));
         setFrequencyNodeDims();
      })
      startTimeSlider.addEventListener("input",function() {
        
         setStartTimeFreq(ind,parseFloat(startTimeSlider.value));
         setFrequencyNodeDims();
      })
      timeCont.appendChild(startTimeLab);
      timeCont.appendChild(startTimeSlider);
      setTime.appendChild(timeCont);

   }
   if (ind < currentFrequencyNodes.length-1) {

      let timeCont = createDiv("timeCont","timeCont",{

      });

      if (ind == 0) {
         timeCont.style.width="80%";
         timeCont.style.marginLeft = "10%";
      }
      let startTimeLab = createDiv("label","label",{

      },{
         innerHTML:"End",
      })
      let startTimeSlider = createSlider("setTimeSlider","setTimeSlider",{
      },{
         
      },{
         max:currentFrequencyNodes[ind+1].endTime-0.01 || 0.01,
         min:currentFrequencyNodes[ind].startTime+0.01 || 0.99,
         value: currentFrequencyNodes[ind].endTime,
         step: 0.01,
      })
      startTimeSlider.value = currentFrequencyNodes[ind].endTime;
      startTimeSlider.addEventListener("change",function() {
         
         setEndTimeFreq(ind,parseFloat(startTimeSlider.value));
         setFrequencyNodeDims();
      })
      startTimeSlider.addEventListener("input",function() {
         
         setEndTimeFreq(ind,parseFloat(startTimeSlider.value));
         setFrequencyNodeDims();
      })
      timeCont.appendChild(startTimeLab);
      timeCont.appendChild(startTimeSlider);
      setTime.appendChild(timeCont);

   }

   let titleFreqLab = createDiv("label","label",{
      width:"80%",
      textAlign:"center",
      marginLeft:"10%",
      marginTop:"4%",
      float:"none",
      },{
         innerHTML:"Frequency",
      })
   setTime.appendChild(titleFreqLab);
   let timeCont = createDiv("timeCont","timeCont",{

      });
    let startValLab = createDiv("label","label",{

      },{
         innerHTML:"Start",
      })
      let startValSlider = createSlider("setTimeSlider","setTimeSlider",{
      },{
         
      },{
         min:0,
         max:2000,
         value: currentFrequencyNodes[ind].startVal,
         step: 0.1,
      })
      startValSlider.value = currentFrequencyNodes[ind].startVal;
      startValSlider.addEventListener("change",function() {
        
         setStartValueOfFreq(ind,parseFloat(startValSlider.value));
         setFrequencyNodeDims();
      })
       startValSlider.addEventListener("input",function() {
        
         setStartValueOfFreq(ind,parseFloat(startValSlider.value));
         setFrequencyNodeDims();
      })
      timeCont.appendChild(startValLab);
      timeCont.appendChild(startValSlider);
      setTime.appendChild(timeCont);

   let timeCont2 = createDiv("timeCont","timeCont",{

      });
    let endValLab = createDiv("label","label",{

      },{
         innerHTML:"End",
      })
      let endValSlider = createSlider("setTimeSlider","setTimeSlider",{
      },{
         
      },{
         min:0,
         max:2000,
         value: currentFrequencyNodes[ind].endVal,
         step: 0.1,
      })
      endValSlider.value = currentFrequencyNodes[ind].endVal;
      endValSlider.addEventListener("change",function() {
        
         setEndValueFreq(ind,parseFloat(endValSlider.value));
         setFrequencyNodeDims();
      })
       endValSlider.addEventListener("input",function() {
        
         setEndValueFreq(ind,parseFloat(endValSlider.value));
         setFrequencyNodeDims();
      })
      timeCont2.appendChild(endValLab);
      timeCont2.appendChild(endValSlider);
      setTime.appendChild(timeCont2);


   let del = createDiv(id+"delete","button",{
      
      width: "80%",
      left:"10%",
      position: "relative",
      borderRadius: "7px",
      marginTop:"5px",
      float: "left",
   }, {
      innerHTML: "Delete Section",
   })

   del.addEventListener("click",function() {
      //$("#frequencyNode"+id).fadeOut().remove();
      removeFrequencyNode(ind);
      $(".nodeSettings").fadeOut().remove();
      if (currentFrequencyNodes[ind]) {

         openFreqNodeSettings(ind);
      } else if (currentFrequencyNodes[ind-1]) {
         openFreqNodeSettings(ind-1);
      }
   })





   cont.appendChild(dropDown);
   cont.appendChild(setTime);
   
   cont.appendChild(del);
   cont.appendChild(moveLR);
   //cont.appendChild(movR);

   cont.appendChild(close);

   document.body.appendChild(cont);
   cont.style.left = el.offset().left + "px";
   cont.style.top = el.offset().top+el.height()+botHt+"px";

}
function setCurveType(ind,type) {
   currentFrequencyNodes[ind].type = type;
}

function moveAllFreq(e) {
   if (draggingFreq) {
      let i = draggingFreq - 1;
      console.log(i)

      let ind = getFrequencyNodeById(i);
      let mouseY = e.pageY;


      let newY = Math.min(2000, Math.max(0, 2000 * (botHt - (mouseY - $("#frequencyNodes").offset().top - topHt)) / botHt));

      if (ind < currentFrequencyNodes.length - 1) {
         let mouseX = e.pageX;
         let newX = ((mouseX - $("#frequencyNodes").offset().left) / mainW);
         setEndTimeFreq(ind, newX);
      }

      setEndValueFreq(ind, newY);

      let pos = getPeakValuePositionFreq(ind);

      setFrequencyNodeDims();



   }
}
function moveVerticalFreq(e) {
   if (draggingFreq) {
      let i = draggingFreq - 1;
      console.log(i)

      let ind = getFrequencyNodeById(i);
      let mouseY = e.pageY;


      let newY = Math.min(2000, Math.max(0, 2000 * (botHt - (mouseY - $("#frequencyNodes").offset().top - topHt)) / botHt));



      setStartValueFreq(ind, newY);



      setFrequencyNodeDims();



   }
}
var lastX = 0;
var lastY = 0;