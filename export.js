/*var Str = "
function getOscillator() {

}

function getGainNode() {

}
var aCtx = new(window.AudioContext || window.webkitAudioContext)();
function playSound(ctx,totalTime) {
	let tT = totalTime;
	let cT = aCtx.currentTime;
	
	currentArrays = getPeriodicCoefficientArrays(type,500);
		real=currentArrays.a;
		imag=currentArrays.b;
		
		let o = getOscillator(cT,tT);
		var wave = aCtx.createPeriodicWave("+[real]+", "+imag+", {disableNormalization: false});
		o.setPeriodicWave(wave);
		
		let g = getGainNode(cT,tT)
		o.connect(g);
		g.connect(analyser);
		analyser.connect(ctxS.destination);

		o.start(cT);
		o.stop(cT+tT);	
}


playSound(aCtx,1);
"*/

function getCompleteString() {
	let tmpStr =
		"//CREATE PURE JAVASCRIPT SOUNDS WITH OSCILLARI.JS//\n" +
		"var aCtx = new(window.AudioContext || window.webkitAudioContext)();" +
		"var perArr = getPeriodicCoefficientArrays('"+currentType+"',100);" +
		"var wave = aCtx.createPeriodicWave(perArr.a, perArr.b, {disableNormalization: false});perArr=null;" +
		getPeriodicFunctionString(currentType);

	if (waveShaper) {
		tmpStr += getMakeDistortionCurveString() + "var waveShaperFilter = aCtx.createWaveShaper();" +
			"waveShaperFilter.oversample = '" + waveShaperFilterOversample + "';" +
			"waveShaperFilter.curve = makeDistortionCurve(" + waveShaperFilterDistortionAmount + ");"
	}
	if (biquad) {
		tmpStr += "var biquadFilter = aCtx.createBiquadFilter();" +
			"biquadFilter.type = " + biquadFilterType + ";" +
			"biquadFilter.Q.setValueAtTime(" + biquadFilterQ + ",0);" +
			"biquadFilter.detune.setValueAtTime(" + biquadFilterDetune + ", 0);" +
			"biquadFilter.frequency.setValueAtTime(" + biquadFilterFrequency + ", 0);" +
			"biquadFilter.gain.setValueAtTime(" + biquadFilterGain + ", 0);";
	}
	if (dynamicCompressorOn) {
		tmpStr +=
			"var dynamicCompressorFilter = aCtx.createDynamicsCompressor();" +
			"dynamicCompressorFilter.threshold=" + dynamicCompressorFilterThreshold + ";" +
			"dynamicCompressorFilter.attack=" + dynamicCompressorFilterAttack + ";" +
			"dynamicCompressorFilter.release=" + dynamicCompressorFilterRelease + ";" +
			"dynamicCompressorFilter.knee=" + dynamicCompressorFilterKnee + ";" +
			"dynamicCompressorFilter.ratio=" + dynamicCompressorFilterRatio + ";";
	}



	tmpStr += getGainNodeString() + getOscillatorString() +
		"function playSound(ctx,totalTime) {" +
		"let tT = totalTime;" +
		"let cT = aCtx.currentTime;" +
		"let o = getOscillator(cT,tT);" +
		"let g = getGainNode(cT,tT);" +
		"o.connect(g);" +
		"let latest = g;";
		if (waveShaper) {
			tmpStr += "latest.connect(waveShaperFilter);"+
			"latest = waveShaperFilter;"
		}
		if (biquad) {
			tmpStr += "latest.connect(biquadFilter);"+
			"latest = biquadFilter;"
		}
		if (dynamicCompressorOn) {
			tmpStr += "latest.connect(dynamicCompressorFilter);"+
			"latest = dynamicCompressorFilter;"
		}

		tmpStr+="latest.connect(aCtx.destination);"+
		"o.start(cT);"+
		"o.stop(cT+tT)}" +
		"playSound(aCtx.currentTime,1)";
	return tmpStr;

}

function getGainNodeString() {
	let tmpStr = "function getGainNode(cT,tT){let g=aCtx.createGain();"
	for (key in currentGainNodes) {
		let ev = currentGainNodes[key];
		switch (ev.type) {

			case "linearRamp":
				tmpStr += "g.gain.setValueAtTime(" + Math.max(0.0001, ev.startVal) + ", cT+tT *" + ev.startTime + ");" +
					"g.gain.linearRampToValueAtTime(" + Math.max(0.0001, ev.endVal) + ", cT+tT*" + ev.endTime + ");"
				break;
			case "exponentialRamp":
				tmpStr += "g.gain.setValueAtTime(" + Math.max(0.0001, ev.startVal) + ",cT+tT*" + ev.startTime + ");" +
					"g.gain.exponentialRampToValueAtTime(" + Math.max(0.0001, ev.endVal) + ",cT+tT*" + ev.endTime + ");"
				break;
			default:
				console.log("sup");
		}
	}
	return tmpStr + "return g}";
}

function getOscillatorString() {
	let tmpStr = "function getOscillator(cT,tT){let o=aCtx.createOscillator();"
	for (key in currentFrequencyNodes) {
		let ev = currentFrequencyNodes[key];

		switch (ev.type) {
			case "linearRamp":
				tmpStr +=
					"o.frequency.setValueAtTime(" + Math.max(0.0001, ev.startVal) + ",cT+tT*" + ev.startTime + ");" +
					"o.frequency.linearRampToValueAtTime(" + Math.max(0.0001, ev.endVal) + ",cT+tT*" + ev.endTime + ");";
				break;
			case "exponentialRamp":
				tmpStr +=
					"o.frequency.setValueAtTime(" + Math.max(0.0001, ev.startVal) + ",cT+tT*" + ev.startTime + ");" +
					"o.frequency.exponentialRampToValueAtTime(" + Math.max(0.0001, ev.endVal) + ",cT+tT*" + ev.endTime + ");";

				break;
		}
	}

	tmpStr += 
		"o.setPeriodicWave(wave);";
		
		return tmpStr + "return o}";
}

function getPeriodicFunctionString(type) {
	let str =
		"function getPeriodicCoefficientArrays(type,length) {" +
		"let a = new  Float32Array(length);" +
		"let b = new  Float32Array(length);" +
		"for (let i = 1; i < length;i++) {";
		if (type == "square") {
			str +=
				"a[i] = (0);" +
				"b[i] = ((2/i*Math.PI)*(1-Math.pow(-1,i)));";
		} else
	if (type == "sine") {
		str +=
			"if (i == 1) {" +
			"a[i] = (0);" +
			"b[i] = (1);" +
			"}";
	} else if (type == "sawtooth") {
		str +=
			"a[i] = (0);" +
			"b[i] = (Math.pow(-1,i+1)* (2 / (i * Math.PI)))";
	} else if (type == "triangle") {
		str +=
			"a[i] = (0);" +
			"b[i] = ((8*Math.sin((i*Math.PI)/2)) / Math.pow(Math.PI*i,2))";
	} else if (type == "custom") {
		str +=
			"a[i] = (0);" +
			"b[i] = (customWaveFunction(i))";
	}
	str += "}" +

		"return {a:a,b:b}}";
	return str;

}

function getMakeDistortionCurveString() {
	return "///////From https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js////////////-->\n" +
		"function makeDistortionCurve(amount) {var k = typeof amount === 'number' ? amount : 50,n_samples = 44100,curve = new Float32Array(n_samples),deg = Math.PI / 180,i = 0,x;for ( ; i < n_samples; ++i ) {x = i * 2 / n_samples - 1;curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );}return curve;};" +
		"////////////////////////////////////<--\n";
}