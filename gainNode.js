var gainEvent = function(opts) {
   lastId++;
   this["id"] = lastId;
   for (let key in opts) {
      this[key] = opts[key];
   }
}

var ctxGain;
var currentGainNodes = [];
var mouseDownTime = 0;
currentGainNodes.push(new gainEvent({
   type: "exponentialRamp",
   startVal: 0.5,
   endVal: 1,
   startTime: 0,
   endTime: 0.3,
}))
currentGainNodes.push(new gainEvent({
   type: "exponentialRamp",
   startVal: 1,
   endVal: 0.5,
   startTime: 0.3,
   endTime: 0.5,
}))
currentGainNodes.push(new gainEvent({
   type: "exponentialRamp",
   startVal: 0.5,
   endVal: 1,
   startTime: 0.5,
   endTime: 0.7,
}))
currentGainNodes.push(new gainEvent({
   type: "exponentialRamp",
   startVal: 1,
   endVal: 0.000,
   startTime: 0.7,
   endTime: 1,
}))

function removeGainNode(i) {
   if (currentGainNodes.length < 3) {
      message("Minimum 2 Sections!");
      return;
   }
   let mid = (currentGainNodes[i].startTime + currentGainNodes[i].endTime) / 2;
   if (i == 0) {
      currentGainNodes[i + 1].startTime = 0;
   } else if (i == currentGainNodes.length - 1) {
      currentGainNodes[i - 1].endTime = 1;
   } else {
      let midV = (currentGainNodes[i + 1].startVal + currentGainNodes[i - 1].endVal) / 2;
      currentGainNodes[i - 1].endVal = midV;
      currentGainNodes[i + 1].startVal = midV;
      currentGainNodes[i - 1].endTime = mid;
      currentGainNodes[i + 1].startTime = mid;

   }
   console.log(mid);
   $("#gainNode" + currentGainNodes[i].id).remove();
   if (i == currentGainNodes.length - 1) {
      $("#addBehindgainNode" + currentGainNodes[i - 1].id).remove();
   }


   currentGainNodes.splice(i, 1);

   if (i == 0) {
      document.getElementById("gainNode" + currentGainNodes[0].id).appendChild(getStartGainValueGrabberDiv(0));
   }

   setGainNodeDims();
}


function addGainNodeAfter(id) {
   let i = 0;
   i = getGainNodeById(id);
   console.log(i);
   let lng = currentGainNodes.length;
   let newDur = 1 / (lng + 1);
   let lowestDur = 9999;
   for (let j = 0; j < lng; j++) {
      if (currentGainNodes[j].endTime - currentGainNodes[j].startTime < lowestDur) {
         lowestDur = currentGainNodes[j].endTime - currentGainNodes[j].startTime;
      }
   }
   newDur = Math.min(newDur, lowestDur, 0.2);

   //Downwards of i
   for (let j = 0; j <= i; j++) {

      currentGainNodes[j].endTime -= newDur / lng * (j + 1);
      currentGainNodes[j].startTime -= newDur / lng * j;

   }

   //Upwards of i
   for (let j = i + 1; j < lng; j++) {
      currentGainNodes[j].endTime += newDur / (lng) * (lng - 1 - j);
      currentGainNodes[j].startTime += newDur / (lng) * (lng - 1 - j + 1);

   }


   let sV = currentGainNodes[i].endVal;
   let eV = currentGainNodes[i + 1].startVal;
   let sT = currentGainNodes[i].endTime;
   let eT = currentGainNodes[i + 1].startTime;

   addGainNodeAt(sV, eV, sT, eT, i);
   setGainNodeDims();
   //Shift

}

function addGainNodeSimple(sV, eV, sT, eT, i) {

   let gEvent = new gainEvent({
      type: "exponentialRamp",
      startVal: sV,
      endVal: eV,
      startTime: sT,
      endTime: eT,
   })
   currentGainNodes.push(gEvent);
   let id = gEvent.id
   i = currentGainNodes.length - 2;
   let gNodeDiv = getGainNodeDiv(i + 1);
   $("#gainNodes").append(gNodeDiv);
   gEvent.div = gNodeDiv;
}

function addGainNodeWDiv(sV, eV, sT, eT, i) {
   let gEvent = currentGainNodes[i];
   let gNodeDiv = getGainNodeDiv(i);
   $("#gainNodes").append(gNodeDiv);
   gEvent.div = gNodeDiv;
}

function addGainNodeWoDiv(sV, eV, sT, eT, i) {

   let gEvent = new gainEvent({
      type: "exponentialRamp",
      startVal: sV,
      endVal: eV,
      startTime: sT,
      endTime: eT,
   })
   currentGainNodes.push(gEvent);

}

function addGainNodeAt(sV, eV, sT, eT, i) {

   let gEvent = new gainEvent({
      type: "exponentialRamp",
      startVal: sV,
      endVal: eV,
      startTime: sT,
      endTime: eT,
   })

   currentGainNodes.splice(i + 1, 0, gEvent);
   let gNodeDiv = getGainNodeDiv(i + 1);
   $(gNodeDiv).insertBefore('#gainNode' + i);
   gEvent.div = gNodeDiv;
}

function duplicateGainEvents() {
   let clones = [];
   for (let i = 0; i < currentGainNodes.length; i++) {
      let clone = [];
      currentGainNodes[i].startTime *= 0.5;
      currentGainNodes[i].endTime *= 0.5;

   }
   let lng = currentGainNodes.length;
   for (var i = 0; i < lng; i++) {
      /*let clone = Object.assign({},currentGainNodes[i]);
      clone.startTime+=0.5;
      clone.endTime+=0.5;
      currentGainNodes.push(clone);*/
      let n = currentGainNodes[i];
      addGainNodeWoDiv(n.startVal, n.endVal, n.startTime + 0.5, n.endTime + 0.5, 0);
   };
   for (var i = lng; i < lng * 2; i++) {
      /*let clone = Object.assign({},currentGainNodes[i]);
      clone.startTime+=0.5;
      clone.endTime+=0.5;
      currentGainNodes.push(clone);*/
      let n = currentGainNodes[i];
      addGainNodeWDiv(n.startVal, n.endVal, n.startTime + 0.5, n.endTime + 0.5, i);
   };
   setGainNodeDims();
}

function setEndTime(i, endTime) {
   if (i < currentGainNodes.length - 1) {
      if (currentGainNodes[i].startTime >= endTime - 0.01) {
         currentGainNodes[i].endTime = currentGainNodes[i].startTime + 0.01;
         currentGainNodes[i + 1].startTime = currentGainNodes[i].startTime + 0.01;
      } else if (currentGainNodes[i + 1].endTime <= endTime + 0.01) {
         currentGainNodes[i].endTime = currentGainNodes[i + 1].endTime - 0.01;
         currentGainNodes[i + 1].startTime = currentGainNodes[i + 1].endTime - 0.01;
      } else {
         currentGainNodes[i].endTime = endTime;
         currentGainNodes[i + 1].startTime = endTime;
      }

   }

}
function setStartTimeGain(i, startTime) {
   if (i > 0) {
      if (currentGainNodes[i].endTime <= startTime ) {
         currentGainNodes[i].startTime = currentGainNodes[i].endTime + 0.01;
         currentGainNodes[i - 1].endTime = currentGainNodes[i].startTime - 0.01;
      } else if (currentGainNodes[i - 1].startTime >= startTime ) {
         currentGainNodes[i].startTime = currentGainNodes[i - 1].endTime + 0.01;
         currentGainNodes[i - 1].endTime = currentGainNodes[i].startTime - 0.01;
      } else {
         currentGainNodes[i].startTime = startTime;
         currentGainNodes[i - 1].endTime = startTime;
      }

   }

}

function getGainNodeById(id) {
   for (let i = 0; i < currentGainNodes.length; i++) {
      if (currentGainNodes[i].id == id) {
         return i;
      }
   }
}

function getNextNodeById(id) {
   let gn = currentGainNodes[getGainNodeById(id)];
   let lowest = 1;
   let lowstId = -1;
   for (let i = 0; i < currentGainNodes.length; i++) {
      if (currentGainNodes[i].endTime <= lowest && gn.endTime < currentGainNodes[i].endTime) {
         lowest = currentGainNodes[i].endTime;
         lowestId = i;
      }
   }
   return lowestId;
}

function setEndValue(i, endValue) {
   let node1 = currentGainNodes[i];
   let val = Math.min(1, Math.max(0, endValue));
   node1.endVal = val;
   if (currentGainNodes.length > i + 1) {
      let node2 = currentGainNodes[i + 1];
      node2.startVal = val;

   }
}

function setStartValueOfGain(i, endValue) {

   let node1 = currentGainNodes[i];
   let val = Math.min(1, Math.max(0, endValue));
   node1.startVal = val;
   if (0 < i) {
      let node2 = currentGainNodes[i - 1];
      node2.endVal = val;
   }
   $("#grabberInput" + node1.id).val(val); //("value",val);
}

function setStartValueGain(i, endValue) {
   let node1 = currentGainNodes[0];
   let val = Math.min(1, Math.max(0, endValue));
   node1.startVal = val;

}

function newGainNode(type, startVal, endVal, startTime, endTime) {
   currentGainNodes.push(new gainEvent({
      type: type,
      startVal: startVal,
      endVal: endVal,
      startTime: startTime,
      endTime: endTime
   }))
}

function cleanGainTransitions() {
   for (let i = 0; i < currentGainNodes.length - 1; i++) {
      if (currentGainNodes[i].endVal != currentGainNodes[i].startVal) {
         let mVal = Math.floor(100 * (currentGainNodes[i].endVal + currentGainNodes[i].startVal)) / 200;
         currentGainNodes[i].endVal = mVal;
         currentGainNodes[i].startVal = mVal;
      }
   };
}


function getPeakValuePosition(ind) {
   let node = currentGainNodes[ind];
   let x = mainW * (node.endTime);
   let y = (1 - node.endVal) * botHt;
   return {
      x: x,
      y: y
   }
}

function getExponentialRampPoint(curTime, startTime, endTime, startVal, endVal) {
   let dur = endTime - startTime;
   return Math.max(0.0001, startVal) * Math.pow((Math.max(0.0001, endVal) / Math.max(0.0001, startVal)), ((curTime - startTime) / dur));

}

function gainNodeContainer() {

   let cont = createDiv("gainNodes", "gainNodes secondColor", {

      width: mainW + "px",
      marginLeft: lMarg + "px",
      marginRight: rMarg + "px",
      height: (mainH)+topHt/2 + "px",
      position: "relative",
   });

   let titleLab = createDiv("durInputLabel","labelTop",{
      position: "relative",
      height:topHt/2+"px",
      top: 0+ "px",
      left: 0+"px",
   },{
      innerHTML: "Gain"
   })
   cont.appendChild(titleLab)
   let lng = currentGainNodes.length;
   for (let i = 0; i < lng; i++) {
      currentGainNodes[i].div = getGainNodeDiv(i);
      cont.appendChild(currentGainNodes[i].div);

   }

   let cnv = document.createElement("canvas");
   cnv.width = mainW;
   cnv.height = botHt;
   cnv.style.position = "absolute";
   cnv.style.bottom = "0px";
   cont.appendChild(cnv);

   ctxGain = cnv.getContext("2d");

   document.addEventListener("mouseup", function(e) {
      if (draggingGain) {
         let i = draggingGain - 1;
         console.log(i)
         let now = window.performance.now();
         let ind = getGainNodeById(i);
         let node1 = currentGainNodes[ind];
         let node2 = currentGainNodes[ind + 1];
         let mouseX = e.pageX;
         let mouseY = e.pageY;
         /*if (now - mouseDownTime > 200) {
            let newX = ((mouseX - $("#gainNodes").offset().left) / mainW);
            let newY = Math.min(1,Math.max(0,(botHt - (mouseY - $("#gainNodes").offset().top-topHt))/botHt));
            
            console.log(ind);
            setEndTime(ind,newX);
            setEndValue(ind,newY);
            $("#grabber"+  node1.id + " span").html(Math.floor(100*node1.endVal)/100);
            $("#gainNode"+ node1.id).css("width",(node1.endTime-node1.startTime)*mainW);
            $("#gainNode"+(node1.id  )).css("left",(node1.startTime)*mainW);
            
            if (node2) {
               $("#gainNode"+(node2.id)).css("width",(node2.endTime-node2.startTime)*mainW);
               $("#gainNode"+(node2.id)).css("left",(node2.startTime)*mainW);
               
            }

            let pos = getPeakValuePosition(ind);

            $("#grabber"+i).css("top",pos.y+topHt- $("#grabber" + i).height() / 2);
            
         } else {

            $("#grabber"+node1.id + " input").val(node1.endVal);

            $("#grabber"+node1.id).addClass("clicked"); 
            $("#grabber"+node1.id+" input").focus();
            
            settingGain=ind;
             
            document.addEventListener("keydown",setGainKey);
             
         }
           
           
         $('#ghostGrabberGain').remove();
         document.removeEventListener("mousemove",showGhostGrabGain)*/
         if (now - mouseDownTime < 200) {

            if (settingGain >= -1) {
               console.log(3);
               setGain();

            } else {

               if (ind == 0 && e.target.id.split("Start").length > 1) {

                  $("#grabberStart" + currentGainNodes[ind].id + " input").val(currentGainNodes[ind].endVal);
                  $("#grabberStart" + currentGainNodes[ind].id).addClass("clicked");
                  $("#grabberStart" + currentGainNodes[ind].id + " input").focus();
                  settingGain = -1;

               } else {

                  $("#grabber" + currentGainNodes[ind].id + " input").val(currentGainNodes[ind].endVal);
                  $("#grabber" + currentGainNodes[ind].id).addClass("clicked");
                  $("#grabber" + currentGainNodes[ind].id + " input").focus();
                  settingGain = ind;
               }

               // showPiano($("#gainNodes").offset().left, $("#gainNodes").offset().top + $("#gainNodes").height(), gainPianoMoveCallback, gainPianoClickCallback);



            }
         }

         document.removeEventListener("mousemove", moveAllGain)
         document.removeEventListener("mousemove", moveVerticalGain)
         setGainNodeDims();
         draggingGain = false;
      }
   })
   return cont;
}
var settingGain = -2;

function setGain(e) {
   $(".clicked").removeClass("clicked");
   if (pianoShown) hidePiano();

   if (settingGain == -1) {
      let origVal = currentGainNodes[0].startVl;
      let val = $("#grabberStart" + currentGainNodes[0].id + " input").val();
      if (val <= 1 && val >= 0) {
         currentGainNodes[0].startVal = val;

      }
   } else {
      console.log(settingGain);
      let origVal = currentGainNodes[settingGain].endVal;
      let val = $("#grabber" + currentGainNodes[settingGain].id + " input").val();
      if (val <= 1 && val >= 0) {
         currentGainNodes[settingGain].endVal = val;
         if (settingGain < currentGainNodes.length - 1) {
            currentGainNodes[settingGain + 1].startVal = val;
         }
      }

   }
   settingGain = -2;
   setGainNodeDims();


}

function setGainKey(e) {
   if (e.key == "Enter") {
      if (settingGain >= 0) {
         $("#grabber" + currentGainNodes[settingGain].id).removeClass("clicked");
         console.log(1);
         setGain();
      } else if (settingGain == -1) {
         $("#grabberStart" + currentGainNodes[0].id).removeClass("clicked");
         console.log(2);
         setGain();
      }
      //$("#grabber" + currentGainNodes[settingGain].id).blur();
      //$("#grabber" + currentGainNodes[settingGain].id).removeClass("clicked");
   } //


}

function getStartGainValueGrabberDiv(i) {

   let y = ((1 - currentGainNodes[0].startVal) / 1) * botHt;
   let grabber = createDiv("grabberStart" + currentGainNodes[0].id, "grabber secondColor", {
      top: (y + topHt) + "px",
      zIndex: 100,
      left: "-15px",
   })
   let span = document.createElement("span");
   console.log(i);
   span.innerHTML = Math.floor(currentGainNodes[i].startVal);
   grabber.appendChild(span);


   let grabInp = createTextInput("grabberInputStart" + currentGainNodes[0].id, "grabberInput");
   grabber.appendChild(grabInp);
   let lab = createDiv("grabberInputStartLabel" + currentGainNodes[0].id, "grabberInputLabel", {

   }, {
      innerHTML: "Click Field or Press enter to Confirm"
   })
   grabber.appendChild(lab);
   //grabInp.addEventListener("blur", setGain);
   return grabber;
}

function getGainValueGrabberDiv(i) {
   let pos = getPeakValuePosition(i);
   let grabber = createDiv("grabber" + currentGainNodes[i].id, "grabber secondColor", {
      top: (pos.y + topHt) + "px",
      zIndex: 100,
   })

   if (i == currentGainNodes.length - 1) {
      grabber.style.right = "-15px";
   }
   let span = document.createElement("span");
   span.innerHTML = Math.floor(100 * currentGainNodes[i].endVal) / 100;
   grabber.appendChild(span);


   let grabInp = createTextInput("grabberInput" + currentGainNodes[i].id, "grabberInput");
   grabber.appendChild(grabInp);
   let lab = createDiv("grabberInputLabel" + currentGainNodes[i].id, "grabberInputLabel", {

   }, {
      innerHTML: "Click Field or Press enter to Confirm"
   })
   grabber.appendChild(lab);
   /*grabInp.addEventListener("blur", setGain);*/
   return grabber;
}



function showGhostBar(e) {
   $("#ghostbar").css("left", e.pageX + 2);
}

function showGhostGrabGain(e) {
   if (!$("#ghostGrabberGain").length) {
      let gg = $('<div>', {
         id: 'ghostGrabberGain',
         css: {
            top: e.pageY - $("#grabber" + (draggingGain - 1)).height() / 2,
            left: e.pageX - $("#grabber" + (draggingGain - 1)).width() / 2
         }
      }).appendTo('body');

   }
   $("#ghostGrabberGain").css("left", e.pageX - $("#grabber" + (draggingGain - 1)).width() / 2);
   $("#ghostGrabberGain").css("top", e.pageY - $("#grabber" + (draggingGain - 1)).height() / 2);
}

function clamp(id1, id2) {
   let el1 = document.getElementById(id1);
   let el2 = document.getElementById(id2);

}

function drawGainNodes() {
   ctxGain.clearRect(0, 0, mainW, botHt);
   drawPlayBar(ctxGain);

   for (let i = 0; i < currentGainNodes.length; i++) {
      let node = currentGainNodes[i];

      let xEnd = node.endTime * mainW;
      let xStart = node.startTime * mainW;
      let yEnd = botHt - node.endVal * botHt;
      let yStart = botHt - node.startVal * botHt;

      let dur = Math.floor(100 * (node.endTime - node.startTime)) / 100;
      let nodeW = xStart - xEnd;
      if (currentGainNodes.length - 1 > i) {
         drawDashline(ctxGain, xEnd, botHt);
      }
      ctxGain.lineWidth = 2;
      ctxGain.strokeStyle = "white";
      if (node.type == "linearRamp") {
         ctxGain.beginPath();

         ctxGain.moveTo(xStart, yStart);
         ctxGain.lineTo(xEnd, yEnd);
         ctxGain.stroke();
         ctxGain.closePath();
      };
      if (currentGainNodes[i].type == "exponentialRamp") {
         ctxGain.beginPath();
         ctxGain.moveTo(xStart, yStart);
         for (let j = 1; j < 100; j += 1) {
            let curT = (node.startTime + dur * j / 100);
            let x = mainW * curT;
            let y = botHt - getExponentialRampPoint(curT, node.startTime, node.endTime, Math.max(0.0001, node.startVal), Math.max(0.0001, node.endVal)) * botHt;
            ctxGain.lineTo(x, y);
         }
         ctxGain.lineTo(xEnd, yEnd);
         ctxGain.stroke();
         ctxGain.closePath();
      };
   }
}

function getDividerGainNode(ind) {
   let gn1 = currentGainNodes[ind];
   let gn2 = currentGainNodes[ind + 1];

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

function setGainNodeDims() {
   for (let i = 0; i < currentGainNodes.length; i++) {
      currentGainNodes[i].div.style.width = (currentGainNodes[i].endTime - currentGainNodes[i].startTime) * mainW + "px";
      $("#gainNode" + currentGainNodes[i].id).css("width", (currentGainNodes[i].endTime - currentGainNodes[i].startTime) * mainW);
      $("#gainNode" + currentGainNodes[i].id).css("left", (currentGainNodes[i].startTime) * mainW);


      let pos = getPeakValuePosition(i);
      $("#grabber" + currentGainNodes[i].id + " span").html(Math.floor(100 * currentGainNodes[i].endVal) / 100);
      $("#grabber" + currentGainNodes[i].id).css("top", pos.y + topHt);

      $("#grabberStart0 span").html(Math.floor(100 * currentGainNodes[0].startVal) / 100);
      $("#grabberStart0").css("top", (1 - currentGainNodes[0].startVal) * botHt + "px");
   }
}

function getOwnIndex(gainNode) {
   for (let key in currentGainNodes) {
      if (currentGainNodes[key].id == gainNode.id) {
         return key;
      }
   }
}

function getGainNodeDiv(i) {
   let gainNode = currentGainNodes[i];

   let idNUm = gainNode.id;
   let id = "gainNode" + gainNode.id;
   let outer = createDiv(id, "gainNode", {
      /*left:gainNode.startTime*100+"%",*/
      width: (gainNode.endTime - gainNode.startTime) * mainW + "px",
      height: topHt + "px",
      position: "absolute",
      left: gainNode.startTime * mainW + "px",

   });

   let hoverOpts = createDiv(id + "hoverOpts", "hoverOpts", {
      position: "relative",
   }, {
      /*innerHTML:"Settings",*/
   })
   let img = new Image();

   img.src = "img/Settings.png"
   hoverOpts.append(img)
   hoverOpts.addEventListener("click", function(e) {
      if (e.target.className.split("addBeh").length < 2) {
         openGainNodeSettings(i);
      }
   })

   /*let dropDown = createDropDown(id + "type", "gainNodeDropdown", {
      exponentialRamp: "Exponential Ramp",
      linearRamp: "Linear Ramp",

   }, {
      left: "0px",
      width: "100%",
      position: "relative",
   })
   dropDown.addEventListener("change", function(e) {
      currentGainNodes[i].type = "linearRamp";
   })
   hoverOpts.appendChild(dropDown)*/
   outer.appendChild(hoverOpts);

   if (i < currentGainNodes.length - 1) {
      let addBehind = createDiv("addBehind" + id, "addBehind", {
         float: "right"
      }, {
         innerHTML: "+",
      })
      addBehind.addEventListener("click", function(e) {
         addGainNodeAfter(gainNode.id);
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
      let grab0 = getStartGainValueGrabberDiv(i);
      grab0.addEventListener("mousedown", function(e) {

         draggingGain = parseInt(gainNode.id) + 1;

         mouseDownTime = window.performance.now();


         document.addEventListener("mousemove", moveVerticalGain)
      })
      outer.appendChild(grab0);
   }
   /*if (i < currentGainNodes.length - 1) {*/
   let grab = getGainValueGrabberDiv(i);
   outer.appendChild(grab);
   grab.addEventListener("mousedown", function(e) {

      draggingGain = parseInt(gainNode.id) + 1;

      mouseDownTime = window.performance.now();
      let dms = $(currentGainNodes[i].div).offset();


      document.addEventListener("mousemove", moveAllGain)
   })
   /*}*/



   return outer;

}

function openGainNodeSettings(ind) {
   let node = currentGainNodes[ind];
   let id = node.id;
   let el = $("#gainNode" + id);
   let existNode = $(".nodeSettings");
   let l = el.offset().left;
   let t = el.offset().top+el.height();
   if (existNode.length) {
      l = $(existNode[0]).offset().left;
      t = t+botHt;
      $(".nodeSettings").fadeOut().remove();
   }
   let cont = createDiv("gainNodeSettings", "nodeSettings", {
      width: Math.max(100, el.width()) + "px",

      top: t + "px",
      left: l+ "px",
      position: "absolute",
      zIndex: 10001
   })

   let close = createDiv("closeBut", "closeBut", {
      height: "15px",
      width: "15px",
      position: "absolute",
      borderRadius: "7px",
      top: "1px",
      right: "1px",
   }, {
      innerHTML: "X",
   })
   close.addEventListener("click", function() {
      $(".nodeSettings").fadeOut().remove();
   })



   let dropDown = createDropDown("gainNode" + id + "type", "gainNodeDropdown", {
      exponentialRamp: "Exponential Ramp",
      linearRamp: "Linear Ramp",

   }, {
      left: "10%",
      width: "80%",
      position: "relative",
   })

   let moveLR = createDiv("moveLR", "move", {})
   if (ind > 0) {
      let movL = createDiv("moveLeft", "button", {
         float: "left",
         width: "30%",
         marginTop: "5px",
         marginLeft: "10%",
      }, {
         innerHTML: "<---",
         onclick: function(e) {
            if (ind > 0) {
               openGainNodeSettings(ind - 1)
            }
         }
      });
      moveLR.appendChild(movL);

   }
   if (ind < currentGainNodes.length - 1) {
      let movR = createDiv("moveRight", "button", {
         float: "left",
         width: "30%",
         marginTop: "5px",
         marginLeft: "5%",
      }, {
         innerHTML: "--->",
         onclick: function(e) {
            if (ind < currentGainNodes.length - 1) {
               openGainNodeSettings(ind + 1)
            }
         }
      })
      moveLR.appendChild(movR);

   }

   dropDown.addEventListener("change", function(e) {
      currentGainNodes[ind].type = dropDown.value;
   })
   let setTime = createDiv("setTime", "setTime", {
      width: "80%",
      minWidth: "80%",
      marginLeft: "10%"
   });
   let titleTimeLab = createDiv("label", "label", {
      width: "80%",
      height:"10%",
      textAlign: "center",
      marginLeft: "10%",
      marginTop: "4%",
      float: "none",
   }, {
      innerHTML: "Time",
   })
   setTime.appendChild(titleTimeLab);
   if (ind > 0) {
      let timeCont = createDiv("timeCont", "timeCont", {

      });
      if (ind == currentGainNodes.length-1) {
         timeCont.style.width="80%";
         timeCont.style.marginLeft = "10%";
      }
      let startTimeLab = createDiv("label", "label", {

      }, {
         innerHTML: "Start",
      })
      let startTimeSlider = createSlider("setTimeSlider", "setTimeSlider", {}, {

      }, {
         min: currentGainNodes[ind - 1].startTime + 0.01 || 0.01,
         max: currentGainNodes[ind].endTime - 0.01 || 0.99,
         value: currentGainNodes[ind].startTime,
         step: 0.01,
      })
      startTimeSlider.value = currentGainNodes[ind].starTime;
      startTimeSlider.addEventListener("change", function() {

         setStartTimeGain(ind, parseFloat(startTimeSlider.value));
         setGainNodeDims();
      })
      startTimeSlider.addEventListener("input", function() {

         setStartTimeGain(ind, parseFloat(startTimeSlider.value));
         setGainNodeDims();
      })
      timeCont.appendChild(startTimeLab);
      timeCont.appendChild(startTimeSlider);
      setTime.appendChild(timeCont);

   }
   if (ind < currentGainNodes.length - 1) {
      let timeCont = createDiv("timeCont", "timeCont", {

      });
      if (ind == 0) {
         timeCont.style.width="80%";
         timeCont.style.marginLeft = "10%";
      }
      let startTimeLab = createDiv("label", "label", {

      }, {
         innerHTML: "End",
      })
      let startTimeSlider = createSlider("setTimeSlider", "setTimeSlider", {}, {

      }, {
         max: currentGainNodes[ind + 1].endTime - 0.01 || 0.01,
         min: currentGainNodes[ind].startTime + 0.01 || 0.99,
         value: currentGainNodes[ind].endTime,
         step: 0.01,
      })
      startTimeSlider.value = currentGainNodes[ind].endTime;
      startTimeSlider.addEventListener("change", function() {

         setEndTime(ind, parseFloat(startTimeSlider.value));
         setGainNodeDims();
      })
      startTimeSlider.addEventListener("input", function() {

         setEndTime(ind, parseFloat(startTimeSlider.value));
         setGainNodeDims();
      })
      timeCont.appendChild(startTimeLab);
      timeCont.appendChild(startTimeSlider);
      setTime.appendChild(timeCont);

   }

   let titleGainLab = createDiv("label", "label", {
      width: "80%",
      height:"10%",
      textAlign: "center",
      marginLeft: "10%",
      marginTop: "4%",
      float: "none",
   }, {
      innerHTML: "Gain",
   })
   setTime.appendChild(titleGainLab);
   let timeCont = createDiv("timeCont", "timeCont", {

   });
   let startValLab = createDiv("label", "label", {

   }, {
      innerHTML: "Start",
   })
   let startValSlider = createSlider("setTimeSlider", "setTimeSlider", {}, {

   }, {
      min: 0,
      max: 1,
      value: currentGainNodes[ind].startVal,
      step: 0.01,
   })
   startValSlider.value = currentGainNodes[ind].startVal;
   startValSlider.addEventListener("change", function() {

      setStartValueOfGain(ind, parseFloat(startValSlider.value));
      setGainNodeDims();
   })
   startValSlider.addEventListener("input", function() {

      setStartValueOfGain(ind, parseFloat(startValSlider.value));
      setGainNodeDims();
   })
   timeCont.appendChild(startValLab);
   timeCont.appendChild(startValSlider);
   setTime.appendChild(timeCont);

   let timeCont2 = createDiv("timeCont", "timeCont", {

   });
   let endValLab = createDiv("label", "label", {

   }, {
      innerHTML: "End",
   })
   let endValSlider = createSlider("setTimeSlider", "setTimeSlider", {}, {

   }, {
      min: 0,
      max: 1,
      value: currentGainNodes[ind].endVal,
      step: 0.01,
   })
   endValSlider.value = currentGainNodes[ind].endVal;
   endValSlider.addEventListener("change", function() {

      setEndValue(ind, parseFloat(endValSlider.value));
      setGainNodeDims();
   })
   endValSlider.addEventListener("input", function() {

      setEndValue(ind, parseFloat(endValSlider.value));
      setGainNodeDims();
   })
   timeCont2.appendChild(endValLab);
   timeCont2.appendChild(endValSlider);
   setTime.appendChild(timeCont2);


   let del = createDiv(id + "delete", "button", {

      width: "80%",
      left: "10%",
      position: "relative",
      borderRadius: "7px",
      marginTop: "5px",
      float: "left",
   }, {
      innerHTML: "Delete Section",
   })

   del.addEventListener("click", function() {
      //$("#gainNode"+id).fadeOut().remove();
      removeGainNode(ind);
      $(".nodeSettings").fadeOut().remove();
      if (currentGainNodes[ind]) {

         openGainNodeSettings(ind);
      } else if (currentGainNodes[ind - 1]) {
         openGainNodeSettings(ind - 1);
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
   cont.style.top = el.offset().top + el.height() + botHt + "px";


}

function moveVerticalGain(e) {
   if (draggingGain) {
      let i = draggingGain - 1;
      console.log(i)

      let ind = 0;

      let mouseY = e.pageY;
      let newY = Math.min(1, Math.max(0, (botHt - (mouseY - $("#gainNodes").offset().top - topHt)) / botHt));



      setStartValueGain(0, newY);



      setGainNodeDims();



   }
}

function moveAllGain(e) {
   if (draggingGain) {
      let i = draggingGain - 1;
      console.log(i)

      let ind = getGainNodeById(i);
      let mouseY = e.pageY;

      let newY = Math.min(1, Math.max(0, (botHt - (mouseY - $("#gainNodes").offset().top - topHt)) / botHt));

      if (ind < currentGainNodes.length - 1) {
         let mouseX = e.pageX;
         let newX = ((mouseX - $("#gainNodes").offset().left) / mainW);
         setEndTime(ind, newX);
      }
      setEndValue(ind, newY);

      setGainNodeDims();



   }
}
var lastX = 0;
var lastY = 0;