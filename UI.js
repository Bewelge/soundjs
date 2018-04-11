 var contHt;
var topHt;
var botHt;
var cnvMarg;
var pCtx;
var ctxT;
var lMarg;
var rMarg;

function setDims() {
	width = window.innerWidth || document.documentElement.clientWidth / 1 || document.body.clientWidth
	height = window.innerHeight || document.documentElement.clientHeight / 1 || document.body.clientHeight / 1;
	lMarg = Math.floor(width*0.1/2);
	rMarg = lMarg*3;
	width = width - lMarg - rMarg;
	hheight = height / 2;
	hwidth = width / 2;

	diagLng = Math.sqrt(width*height);
	 contHt = height*0.18;
   topHt = contHt * 0.25;
   botHt = contHt - topHt; 
   cnvMarg = Math.ceil(botHt / 19);
	
	mainW = width;
	mainH = contHt;
	setKeyDims();

	document.body.appendChild(createMenu());
	setFrequencyNodeDims();
	setGainNodeDims();
	document.addEventListener("keydown", setFrequencyKey);
	document.addEventListener("keydown",setGainKey);

}
function createMenu() {
	let cont = createDiv("container","container thirdColor",
		{
			left:0,
			width:"100%",
			height:"91%",
			top:"0px",

			float: "left",
		});

	cont.appendChild(createOscWindow()); 

	document.body.appendChild(createBottomBar());
	drawTypeCurve(ctxT);
	


	let main = createDiv("main","main",
		{	
			marginLeft:lMarg+"px",
			marginRight:rMarg+"px",
			width:mainW+"px",
			bottom:0+"px",
			height:mainH*4+"px",
			position:"relative",
		});
	main.appendChild(createBiquadFilterSection("Biquad Filter"))
	main.appendChild(createDynamicCompressorFilterSection("Dynamics Compressor"))
	main.appendChild(createWaveShaperFilterSection("Wave Shaper"));

	let dur = createDurationDiv();
	cont.appendChild(dur);
	cont.appendChild(gainNodeContainer());
	cont.appendChild(frequencyNodeContainer());
	cont.appendChild(main);
	
	let piano = createDiv("piano","piano",{
		position: "absolute",
		left:"-100%",
		top: mainH*2 + "px",
		width:mainW+"px",
		height: mainH/2+"px",
		zIndex: 10000,
	})
	let pCnv = document.createElement("canvas");
	pCnv.width = mainW;
	pCnv.height= mainH/2;
	pCtx = pCnv.getContext("2d");
	drawPiano(pCtx);
	piano.addEventListener("mouseleave",mouseLeavePiano);
	piano.appendChild(pCnv);
	cont.appendChild(piano);

	return cont;
}

function createOscWindow() {
	let osc = createDiv("osc","osc secondColor",
		{	
			right:"0%",
			top:"10%",
			width:mainW*0.13+"px",
			position:"fixed",
		});

	let playBut = createDiv("playBut","playBut firstColor",{
		marginTop: "5%",
		zIndex: 10101,

	},{
		innerHTML: "Play"
	})
	
	playBut.addEventListener("click",playCurrentSound);

	osc.appendChild(playBut);

	let typeFunc = createDropDown("oscType","oscType",
	{
		sine: "Sine",
		triangle: "Triangle",
		square: "Square",
		sawtooth: "Sawtooth",
		custom: "Custom",
	});
	typeFunc.addEventListener("change",function(){
		currentType = typeFunc.value;
		currentArrays= getPeriodicCoefficientArrays(currentType,1000);
		drawTypeCurve(ctxT);
	})
	currentType = typeFunc.value;

	let typeCnv = document.createElement("canvas");
	typeCnv.width = mainW*0.13;
	typeCnv.height = mainH * 0.5;
	typeCnv.id = "typeCanvas";
	ctxT = typeCnv.getContext("2d");
	

	osc.appendChild(typeFunc);
	osc.appendChild(typeCnv);

	let checkLoop = createDiv("checkLoop","checkLoop");

	let checkLoopInp = document.createElement("input");
	checkLoopInp.id = "checkLoopInp";
	checkLoopInp.className ="checkLoopInp";
	checkLoopInp.type = "checkbox";
	checkLoopInp.addEventListener("change",function(e) {
		if (e.srcElement.checked) {
			looped=true; 
		} else {
			looped=false;
		}

	})
	let lab = document.createElement("label");
	lab.innerHTML="Loop";
	lab.setAttribute("for",checkLoop.id);

	checkLoop.appendChild(checkLoopInp);
	checkLoop.appendChild(lab);

	osc.appendChild(checkLoop);

	/*let freqInp = createTextInput("freqInp","freqInp",{
		width:"80%",
	});
	osc.appendChild(freqInp);*/

	let but = createDiv("export","export button",{

	},{
		innerHTML:"Export",
		onclick:function(){
			console.log("exportiong");
			//saveCurrentSound()
		}
	})
	osc.appendChild(but);


	

	

	return osc;
}
function createBottomBar() {
	let botBar = createDiv("botBar","botBar",{
		position: "fixed",
		width:"100%",
		bottom:"0px"
	})

	let botSect = createDiv("Oscilloscope","botSect",{
		width:"100%",
		position: "relative"
	})
	botBar.appendChild(botSect);
	let botSectBody = createDiv("OscilloscopeBody","botSectBody", {
		height: mainH+"px",
		width:"100%",

	})
	let botSectTitle = createDiv("OscilloscopeTitle","botSectTitle", {
		height: topHt+"px",
		width:"100%",

	})
	botSectTitle.innerHTML = "Oscilloscope";
	botSectTitle.addEventListener("click",function() {
		let ht = $(botSectBody).height();
		if (ht >40) {
			botSectBody.style.height = 0+"px";
		} else {
			botSectBody.style.height = mainH+"px";
		}
	})
	botSect.appendChild(botSectTitle);
	botSect.appendChild(botSectBody);


	let botSect2 = createDiv("FrequencyBar","botSect",{
		width:"100%",
		position: "relative"
	})
	botBar.appendChild(botSect2);
	let botSectBody2 = createDiv("FrequencyBarBody","botSectBody", {
		height: mainH+"px",
		width:"100%",

	})
	let botSectTitle2 = createDiv("FrequencyBarTitle","botSectTitle", {
		height: topHt+"px",
		width:"100%",

	})
	botSectTitle2.innerHTML = "Frequency Bar Graph";
	botSectTitle2.addEventListener("click",function() {
		let ht = $(botSectBody2).height();
		if (ht >40) {
			botSectBody2.style.height = 0+"px";
		} else {
			botSectBody2.style.height = mainH+"px";
		}
	})

	let incFreq = createDiv("incrFreq","incDecButton",{
		position: "absolute",
		right:rMarg+10+"px",
		top: topHt+20+"px",
	},{
		innerHTML:"+",
	})
	incFreq.addEventListener("click",increaseFrequencyShown);
	let deFreq = createDiv("incrFreq","incDecButton",{
		position: "absolute",
		right:rMarg+10+"px",
		top: mainH-20+"px",
	},{
		innerHTML:"-",
	})
	deFreq.addEventListener("click",decreaseFrequencyShown);

	botSect2.appendChild(incFreq);
	botSect2.appendChild(deFreq);
	botSect2.appendChild(botSectTitle2);
	botSect2.appendChild(botSectBody2);

	return botBar;

	
}
function createDurationDiv() {
	let dur = createDiv("dur","dur",{
		width:mainW+"px",
		left:lMarg+"px",
		height:topHt+"px",
		position: "relative",
	})
	let durInp = createSlider("durInput","durInput",{
		width:"100%",
		left:"0px",
		height:"0px",
		position: "relative",
	},{
	},{
		min:0.2,
		max:100,
		step:0.01,
		value:toneDur,

	})
	let durInpLab = createDiv("durInputLabel","labelTop",{
		position: "relative",
		top: 0+ "px",
		left: 0+"px",
	})
	let durInpLabInp = createTextInput("durInputInput","durInput",{

	},{
		value: toneDur,
		type:"number",
		min:"0.02",
		max:"100",
	})
	let span = document.createElement("span");
	span.innerHTML = "Duration: "+toneDur+"s";
	durInpLab.appendChild(span);
	durInpLab.appendChild(durInpLabInp)
	

	durInpLabInp.addEventListener("change",function() {
		let val = parseFloat(durInpLabInp.value);
		if (val>=0.1 && val <= 100 && !isNaN(val)) {
			toneDur = val;
			span.innerHTML = "Duration: "+toneDur+"s";
			durInp.value = val;
		}
	})

	durInp.addEventListener("change",function(e){
		let val = parseFloat(durInp.value);
		if (!isNaN(val)) {
			durInpLab.style.left = $(durInp).offset().left;
			durInpLab.innerHTML="Duration: "+toneDur+"s";
			toneDur = val; 
		}
	})
	durInp.addEventListener("input",function(e){
		let val = parseFloat(durInp.value);
		if (!isNaN(val)) {
			durInpLab.style.left = $(durInp).offset().left;
			durInpLab.innerHTML="Duration: "+toneDur+"s";
			toneDur = val; 
		}
	})

	dur.appendChild(durInpLab);




	dur.appendChild(durInp);
	return dur;
}
function setKeyDims() {
	// white keys are x1.6 width of black keys.
	wKeyW = (mainW / (52));
	bKeyW = wKeyW / 1.6;
	wKeyH = Math.max(60, mainH*0.5 * 0.1);
	bKeyH = Math.max(45, mainH*0.5 * 0.075);
}
function getKeyByDim(x,y) {
	for (let i = 0;i < keyDims.length;i++) {
		if (keyDims[i].black) {
			if (collides(x,y,keyDims[i])) {
				return i;
			}
		}
	}
	for (let i = 0;i < keyDims.length;i++) {
		if (!keyDims[i].black) {
			if (collides(x,y,keyDims[i])) {
				return i;
			}
		}
	}
}
function collides(x,y,obj) {
	if (x > obj.x && x < obj.x + obj.w) {
		if (y > obj.y && y < obj.y + obj.h) {
			return true;
		}
	}
}
function getKeyDim(key) {
	//check whether key is black;
	let blackKey = 0;
	if (
		((key + 11) % 12 == 0) ||
		((key + 8) % 12 == 0) ||
		((key + 6) % 12 == 0) ||
		((key + 3) % 12 == 0) ||
		((key + 1) % 12 == 0)
	) {

		blackKey = 1;
	}
	//for xPos only the amount of white keys matter since the black are placed on top.
	let x = (key -
		Math.floor(Math.max(0, (key + 11)) / 12) -
		Math.floor(Math.max(0, (key + 8)) / 12) -
		Math.floor(Math.max(0, (key + 6)) / 12) -
		Math.floor(Math.max(0, (key + 3)) / 12) -
		Math.floor(Math.max(0, (key + 1)) / 12)
	) * wKeyW + (wKeyW - bKeyW / 2) * blackKey;
	let y = 0;
	return {
		x: x,
		y: y,
		w: wKeyW * (1 - blackKey) + (blackKey * bKeyW),
		h: (1 - blackKey) * wKeyH + blackKey * bKeyH,
		noteX: x + 2,
		noteW: wKeyW * (1 - blackKey) + (blackKey * bKeyW) - 4,
		black: blackKey,
	}
}
function drawPiano(ct) {

	/*if (!ct) {
		let cn = document.createElement("canvas");
		cn.width = mainW;
		cn.height = mainH*0.5;
		cn.style.position = "absolute";
		cn.style.left = "0px";
		cn.style.top = "0px";

		document.getElementById("main").appendChild(cn);
		ct = cn.getContext("2d");
		console.log(123);
	}*/
	/*ct.fillStyle="rgba(0,0,0,0.5)";
	ct.fillRect(0,mainH*0.4,mainW,mainH*0.1);
	ct.fillStyle="rgba(255,255,255,0.5)";
	ct.fillRect(0,0,mainW,mainH);
	let rgr = ct.createLinearGradient(mainW/2,mainH*0.05,mainW/2,mainH*0.9);
	rgr.addColorStop(1,"white");
	rgr.addColorStop(0,"black");*/
	
	ct.fillStyle = "white";//"rgba(255,255,255,0.5)";
	console.log(ct);
	for (let i = 0; i < 88; i++) {
		let dims = getKeyDim(i);
		keyDims.push(dims);
		if (!dims.black) {
			
			ct.fillRect(dims.x + 1, dims.y + 2, dims.w - 2, dims.h);
			/*roundRect(ct,dims.x + 1, dims.y + 2, dims.w - 2, dims.h,dims.w/10);
			ct.fill();*/
		}
	}
	ct.fillStyle = "rgba(0,0,0,1)";
	for (let i = 0; i < 88; i++) {
		let dims = keyDims[i];
		if (dims.black) {
			/*roundRect(ct,dims.x, dims.y, dims.w, dims.h,dims.w/3);
			ct.fill();*/
			ct.fillRect(dims.x, dims.y, dims.w, dims.h);
		}
	}
	ct.fillStyle = "rgba(0,0,0,1)";

}
function openExportWindow() {
	
}
function replaceDiv(divId) {
	var el = document.getElementById(divId);
    let elClone = el.cloneNode(true);

	el.parentNode.replaceChild(elClone, el);
}
function mouseLeavePiano() {
	endNotes();
}
var pianoShown=false;
function showPiano(x,y,callbackMove,callbackClick){
	pianoShown=true;
	let piano = document.getElementById("piano");
	piano.style.left = x+"px";
	piano.style.top = y+"px";
	tmpCbMove = callbackMove;
	tmpCbClick=callbackClick;
	piano.addEventListener("mousemove",tmpCbMove);
	piano.addEventListener("click",tmpCbClick);
}
var tmpCbMove;
var tmpCbClick;
function hidePiano(){
	pianoShown=false;
	let piano = document.getElementById("piano");
	piano.style.left = "-200%";
	/*piano.style.top = $("#frequencyNodes").offset().top+$("#frequencyNodes").height()+"px";*/
	removeEventListener("mousemove",tmpCbMove)
	removeEventListener("mousemove",tmpCbClick)
}
function message(msg) {
	console.log("message"+ msg);
}

function drawDashline(ct,x,h) {
	
	ct.lineWidth = 2;
	ct.setLineDash([3,3,3]);
	ct.strokeStyle="rgba(250,250,250,0.5)";
	ct.beginPath();
	ct.moveTo(x,0);
	ct.lineTo(x,h);
	ct.stroke();
	ct.closePath();
	ct.setLineDash([]);
}
function drawPlayBar(ct) {
	if (playingTone) {
		let cn = ct.canvas;
		let w =  ct.canvas.width;
		let h = ct.canvas.height;
		ct.lineWidth = 2;
		ct.strokeStyle="rgba(250,250,250,0.5)";
		ct.beginPath();
		let x = (ctxS.currentTime - toneStartTime)/tmpToneDur * w;
		ct.moveTo(x,0);
		ct.lineTo(x,h);
		ct.stroke();
		ct.closePath();
		
	}
}
function drawTypeCurve(ct) {
	let type = currentType;
	currentArrays = getPeriodicCoefficientArrays(type,500);	
	let nArrays = normalizeCoefficients(currentArrays.a.slice(0),currentArrays.b.slice(0));
	let lng  = getPeriodLength(currentArrays.a,currentArrays.b);
	console.log(lng);
	let am = 200;
	let stepW = mainW*0.13/am;
	let x = 0;
	let y = mainH*0.25;
	ctxT.clearRect(0,0,mainW,mainH);
	console.log(currentArrays);
	let points = [];
	for (let i=0;i<am;i++) {
		if (type == "sine") {
			x+=stepW;
			y=Math.sin(x/(mainW*0.13)*(lng)*2)
			/*console.log("sine");*/
		} else if (type == "triangle") {
			x+=stepW;
			y=  getWaveformAt(currentArrays.a,currentArrays.b,x/(mainW*0.13)*(lng));
		} else if (type == "square") {
			x+=stepW;
			y=  getWaveformAt(currentArrays.a,currentArrays.b,x/(mainW*0.13)*(lng/50));
			/*console.log("square");*/
		} else if (type == "sawtooth") {
			x+=stepW;
			y=  getWaveformAt(currentArrays.a,currentArrays.b,x/(mainW*0.13)*(lng));
			/*console.log("sawtooth");*/
		} else if (type == "custom") {
			x+=stepW;
			y=  getWaveformAt(currentArrays.a,currentArrays.b,x/(mainW*0.13)*(lng));
			/*console.log("custom");*/
		}
		/*console.log(x,y);*/
		points.push([x,y]);
	}
	let min= 99999;
	let max= -999;
	for (let i = 0;i<points.length;i++) {
		if (points[i][1]>max) {	
			max=points[i][1];
		} 
		if (points[i][1]<min) {
			min = points[i][1]
		} 
	}
	let sc = mainH*0.2 / (max-min);

	console.log(points);
	console.log(sc,min,max);
	ctxT.beginPath();
	ctxT.strokeStyle="white";
	ctxT.moveTo(0,mainH*0.25);
	for (var i = 0; i < am; i++) {
		ctxT.lineTo(i*stepW,mainH*0.25-points[i][1]*sc);
	};
	ctxT.stroke();
	ctxT.closePath();
}

function createSliderInputDiv(id,className,styles,props,attributes,variable) {
	let div = createDiv(id,className,styles,props,attributes);
	div.innerHTML="";
	div.style.paddingBottom = "5%";
	let lab = createDiv(id,className+"lab",styles,props,attributes);
	lab.style.width = "100%";
	let slid = createSlider(id+"slider",className+"slider",styles,props,attributes);
	slid.style.width = "60%";
	slid.style.float = "left";
	
	let inp = createTextInput(id+"txt",className+"txt",styles,props,attributes);
	inp.style.width = "30%";
	inp.style.marginLeft = "5%";
	inp.style.marginBottom = "5%";
	inp.style.float = "right";
	
	slid.addEventListener("change", function(e) {
			let val = parseFloat(slid.value);
			if (!isNaN(val)) {
				inp.value = val;
				window[variable] = val; 
				
			}
		});
	slid.addEventListener("input", function(e) {
			let val = parseFloat(slid.value);
			if (!isNaN(val)) {
				inp.value = val;
				window[variable] = val; 
				
			}
		});
	inp.addEventListener("change", function(e) {
			let val = parseFloat(inp.value);
			if (!isNaN(val)) {
				slid.value = parseFloat(val);
				window[variable] = val; 
				
			}
		});
	inp.addEventListener("input", function(e) {
			let val = parseFloat(inp.value);
			if (!isNaN(val)) {
				slid.value = parseFloat(val);
				window[variable] = val; 
				
			}
		});
	div.appendChild(lab);
	div.appendChild(slid);
	div.appendChild(inp);
	return div;

}
function createCheckboxDiv(id,className,styles,props,attributes,options,variable) {
	let div = createDiv(id,className,styles,props,attributes);
	div.innerHTML="";
	div.style.paddingBottom = "5%";
	
	let lab = createDiv(id,className+"lab",styles,props,attributes);
	lab.style.width = "100%";
	div.appendChild(lab);
	let wd = 100 / (1+Object.keys(options).length) || 20;

	for (key in options)  {
		let checkBox = createDiv(id+key,className+"Opt",{
			width:wd+"%",
		});
		let str = options[key];
		checkBox.innerHTML = options[key];
		if (options[key] == window[variable]) {
			$(checkBox).addClass('checked')
		}
		checkBox.addEventListener("click",function() {
			$("."+className+"Opt").removeClass("checked");
			$(checkBox).addClass("checked");
			window[variable]=str;

		})/*
		div.appendChild(checkboxLab);*/
		div.appendChild(checkBox);
	}

	
	

	return div;

}
/*let startEndTime = createDoubleSlider(id+"slider0","slider",{
		left:0+"%",
		width:100+"%",
		top:"0%",
		position:"relative",
	},{
		min:0,
		max:1,
		step:0.001,
		value:0.5,
	})*/
function createDoubleSlider(id,className,styles,props,attributes) {
	let wrap = createDiv(id,"gainNode",styles);
	props.min = props.min || 0;
	props.max = props.max || 1;
	props.step = props.step || 0.01;
	let dif = props.max - props.min;

	for (let key in styles) {
		wrap.style[key] = styles[key];
	}
	for (let key in props) {
		wrap[key] = props[key];
	}
	for (let key in attributes) {
		wrap.setAttribute(key,attributes[key]);
	}

	styles.left = "0px";
	styles.width = "100%";
	styles.position = "absolute";
	styles.top = "0px";
	props.value = Math.floor((props.min + dif * 0.25) / props.step )* props.step;
	props.defaultValue = Math.floor((props.min + dif * 0.25) / props.step )* props.step;
	let inp1 = createSlider(id+"0",className,styles,props,attributes);
	props.value = Math.floor((props.min + dif * 0.75) / props.step )* props.step;
	props.defaultValue = Math.floor((props.min + dif * 0.75) / props.step )* props.step;
	let inp2 = createSlider(id+"1",className,styles,props,attributes);
	wrap.appendChild(inp1);
	wrap.appendChild(inp2);
	inp1.addEventListener("change",function() {
		if (inp1.value >= inp2.value) {
			if (inp1.value+0.01 <= inp1.max) {
				inp2.value=inp1.value+0.01;
			} else {
				inp1.value = inp1.max-0.01;
				inp2.value = inp2.max;
			}
		}
	})
	inp2.addEventListener("change",function() {
		if (inp1.value >= inp2.value) {
			if (inp2.value-0.01 >= inp2.min) {
				inp1.value=inp2.value-0.01;
			} else {
				inp2.value = inp1.min+0.01;
				inp1.value = inp2.min;
			}
		}
	})
	return wrap;
}
function createSlider(id,className,styles,props,attributes) {
	let inp = document.createElement("input");
	inp.type = "range";
	inp.id = id;
	inp.className = className;
	for (let key in styles) {
		inp.style[key] = styles[key];
	}
	for (let key in props) {
		inp[key] = props[key];
	}
	for (let key in attributes) {
		inp.setAttribute(key,attributes[key]);
	}
	return inp;

}

    function createRadioInput(id,className,styles,props,attributes) {
    	let div = documentElement.createDiv(id,className,styles,props,attributes);
    	for (let key in opts) {

    		let rad = document.createElement("input");
    		rad.id = id + key;
    		rad.type = "radio";
    		rad.value = key;
    		rad.name = id;
			
			div.appendChild(opt);
			let lab = document.createElement("label");
			lab.innerHTML = opts[key];
			lab.setAttribute("for",id+key)
			div.appendChild(lab);
    	}
    	
	for (let key in styles) {
		div.style[key] = styles[key];
	}
	for (let key in props) {
		div[key] = props[key];
	}
	for (let key in attributes) {
		div.setAttribute(key,attributes[key]);
	}
	return div;
    }
function createTextInput(id,className,styles,props,attributes) {
	let inp = document.createElement("input");
	inp.type = "number";
	inp.id = id;
	inp.className = className;
	for (let key in styles) {
		inp.style[key] = styles[key];
	}
	for (let key in props) {
		inp[key] = props[key];
	}
	for (let key in attributes) {
		inp.setAttribute(key,attributes[key]);
	}
	return inp;

}
function createCheckbox(id,className,styles,props,attribute) {
	let check = document.createElement("input");
	check.type = "checkbox";
	for (let key in styles) {
		check.style[key] = styles[key];
	}
	for (let key in props) {
		check[key] = props[key];
	}
	if (attribute) {
		check.addEventListener("change",function(e) {
			if (e.srcElement.checked) {
				window[attribute]=true; 
			} else {
				window[attribute]=false;
			}

		})
		
	}
	return check;
}
function createDropDown(id, className, opts, styles, props, attributes) {
	let sel = document.createElement("select");
	sel.id = id;
	sel.className = className;
	for (let key in opts) {
		let opt = document.createElement("option");
		opt.value = key;
		opt.innerHTML = opts[key]
		sel.appendChild(opt);
	}
	for (let key in styles) {
		sel.style[key] = styles[key];
	}
	for (let key in props) {
		sel[key] = props[key];
	}
	for (let key in attributes) {
		sel.setAttribute(key,attributes[key]);
	}
	return sel;
}
function createDiv(id, classNames, styles, props, attributes) {
	let div = document.createElement("div");
	div.id = id;
	div.className = classNames;
	for (let key in styles) {
		div.style[key] = styles[key];
	}
	for (let key in props) {
		div[key] = props[key];
	}
	for (let key in attributes) {
		div.setAttribute(key,attributes[key]);
	}
	return div;
}