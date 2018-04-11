'use strict';

var width, height, hheight, hwidth, diagLng;
var playingTone = false;
var lastId = -1;
var lastId2 = -1;
const timeConst = 0.03;
var g = null;
var toneDur = 1;
var tmpToneDur = 1;
var ctx, cnv;
var ctx2, cnv2;
var wKeyW, wKeyH, bKeyW, bKeyH;
var keyDims = [];
var freqWidth = 256;

var draggingGain = false;
var draggingFreq = false;
var mainW, mainH;
var looped = false;
var currentType;
var currentArrays;


function init() {

	setDims();
	//setKeyDims();
	//drawPiano();
	draw();
	setArrays();
	document.addEventListener("keydown", keyDownMine);
}

function setArrays() {
	currentArrays = getPeriodicCoefficientArrays("sine", 50);


}

function keyDownMine(e) {
	if (e.key == " ") {
		playCurrentSound();
	}
}

function draw() {


	if (!cnv) {
		cnv = document.createElement("canvas");
		cnv.width = mainW;
		cnv.height = mainH;
		/*cnv.style.position = "absolute";*/
		cnv.style.marginLeft = lMarg + "px";
		cnv.style.bottom = "0px";
		cnv.className = "analyserCanvas"

		document.getElementById("OscilloscopeBody").appendChild(cnv);
		ctx = cnv.getContext("2d");
	}

	if (!cnv2) {
		cnv2 = document.createElement("canvas");
		cnv2.width = mainW;
		cnv2.height = mainH;
		/*cnv2.style.position = "absolute";*/
		cnv2.style.marginLeft = lMarg + "px";
		cnv2.style.bottom = mainH + "px";
		cnv2.className = "analyserCanvas"

		document.getElementById("FrequencyBarBody").appendChild(cnv2);
		ctx2 = cnv2.getContext("2d");
	}

	ctx.clearRect(0, 0, mainW, mainH * 2);
	ctx2.clearRect(0, 0, mainW, mainH * 2);

	drawGainNodes();
	drawFrequencyNodes();

	/*if (playingTone) {
		ctx.beginPath();
		let x = (ctxS.currentTime - toneStartTime)/toneDur * mainH;
		ctx.moveTo(x,0);
		ctx.lineTo(x,mainH);
		ctx.stroke();
		ctx.closePath();
	}*/


	drawOscilloscope();



	drawFrequencyBar();

	window.requestAnimationFrame(draw);
}

function drawOscilloscope() {
	drawPlayBar(ctx);


	analyser.fftSize = 2048;
	let bufferLength = analyser.frequencyBinCount;
	let dataArray = new Uint8Array(bufferLength);

	/*ctx.fillStyle="rgba(255,193,7,1)";
	ctx.font = mainH*0.15+"px Arial bold";
	let tx = "Oscilloscope";
	let wd = ctx.measureText(tx).width;
	ctx.fillText(tx,mainW/2-wd/2,mainH*0.15);*/

	analyser.getByteTimeDomainData(dataArray);
	ctx.beginPath();
	let xStep = mainW / dataArray.length;
	ctx.strokeStyle = "white";

	ctx.moveTo(0, mainH / 2);
	for (let i = 0; i < dataArray.length; i++) {
		let dim = getKeyDim(i);
		/*if (i>0) {
			ctx.moveTo((i-1)*xStep,hheight/2+(dataArray[(i-1)]-128)/128 * hheight/2);
		}*/
		ctx.lineTo(i * xStep, cnvMarg + (mainH - cnvMarg * 2) / 2 + (dataArray[i] - 128) / 128 * (mainH - cnvMarg * 2) / 2);
	}
	ctx.stroke();
	ctx.closePath();
}

function increaseFrequencyShown() {
	if (freqWidth < 512) {
		freqWidth *= 2;
	}
}

function decreaseFrequencyShown() {
	if (freqWidth > 1) {
		freqWidth *= 0.5;
	}
}

function drawFrequencyBar() {
	drawPlayBar(ctx2);
	/*ctx2.fillStyle="rgba(255,193,7,1)";
	ctx2.font = mainH*0.15+"px Arial bold";
	let tx = "Frequency Bars";
	let wd = ctx2.measureText(tx).width;
	ctx2.fillText(tx,mainW/2-wd/2,mainH*0.15);*/

	analyser.fftSize = 512;
	let bufferLength = 512;
	let dataArray2 = new Uint8Array(bufferLength);
	analyser.getByteFrequencyData(dataArray2);
	let xStep = mainW / dataArray2.length;
	//freqWidth=256;
	xStep = mainW / freqWidth;
	for (let i = 0; i < dataArray2.length; i++) {
		let ht = cnvMarg + dataArray2[i] / 256 * (mainH - 2 * cnvMarg);
		ctx2.fillStyle = getLighterColor(i, 0.25);
		ctx2.fillRect(xStep * i, cnvMarg, xStep, (mainH - 2 * cnvMarg));
		ctx2.fillStyle = getLighterColor(i, 1);
		ctx2.fillRect(xStep * i, (mainH) - cnvMarg - ht, xStep, (ht));
	}
}


var gainTypes = {
	normal: {
		getGainNode: function(ctx,curT, totT) {
			g = ctx.createGain();
			g.gain.setValueAtTime(0.00001, curT);
			g.gain.exponentialRampToValueAtTime(1, curT + 0.5 * totT, timeConst);

			g.gain.setValueAtTime(1, curT + 0.5 * totT);
			g.gain.exponentialRampToValueAtTime(0.00001, curT + 1 * totT, timeConst);
			return g;
		}
	},
	custom: {
		getGainNode: function(ctx,curT, totT, params) {
			let g = ctx.createGain();
			for (let key in params) {
				gainTypes.addGainEvent(g, params[key], curT, totT);
			}
			return g;
		}
	},
	addGainEvent: function(g, ev, curT, totT) {
		switch (ev.type) {
			case "setValueAtTime":
				//
				g.gain.setValueAtTime(ev.value, curT + totT * ev.startTime)
				break;
			case "linearRamp":
				//
				g.gain.setValueAtTime(Math.max(0.0001, ev.startVal), curT + totT * ev.startTime)
				g.gain.linearRampToValueAtTime(Math.max(0.0001, ev.endVal), curT + totT * ev.endTime)
				break;
			case "exponentialRamp":
				//
				g.gain.setValueAtTime(Math.max(0.0001, ev.startVal), curT + totT * ev.startTime)
				g.gain.exponentialRampToValueAtTime(Math.max(0.0001, ev.endVal), curT + totT * ev.endTime)

				break;
				/*case "setTarget":
					//
					g.gain.setTargetAtTime(ev.value, curT+totT*ev.startTime, ev.timeConst)
					break;
				case "setValueCurveAtTime":
					//
					g.gain.setValueCurveAtTime(ev.values,curT+totT*ev.startTime,ev.duration)
					break;
				case "cancelScheduledValues":
					//
					g.gain.cancelScheduledValues(curT+totT*ev.cancelTime)
					break;
				case "cancelAndHoldAtTime":
					//
					g.gain.cancelAndHoldAtTime(curT+totT*ev.cancelTime)
					break;*/
			default:
				console.log("sup");
		}
	}
}

var oscTypes = {
	normal: {
		getOscillator: function(ctx,curT, totT) {
			let o = ctx.createOscillator();
			/*
			o.gain.setValueAtTime(0.00001,curT);
			o.gain.exponentialRampToValueAtTime(1, curT+0.1*totT);

			o.gain.setValueAtTime(1,curT+0.1*totT);
			o.gain.exponentialRampToValueAtTime(0.00001, curT+1*totT);*/
			return o;
		}
	},
	custom: {
		getOscillator: function(ctx,curT, totT, params) {
			let o = ctx.createOscillator();
			for (let key in params) {
				oscTypes.addFreqEvent(o, params[key], curT, totT);
			}
			return o;
		}
	},
	addFreqEvent: function(g, ev, curT, totT) {
		switch (ev.type) {
			case "setValueAtTime":
				//
				g.frequency.setValueAtTime(ev.value, curT + totT * ev.startTime)
				break;
			case "linearRamp":
				//
				g.frequency.setValueAtTime(Math.max(0.0001, ev.startVal), curT + totT * ev.startTime)
				g.frequency.linearRampToValueAtTime(Math.max(0.0001, ev.endVal), curT + totT * ev.endTime)
				break;
			case "exponentialRamp":
				//
				g.frequency.setValueAtTime(Math.max(0.0001, ev.startVal), curT + totT * ev.startTime)
				g.frequency.exponentialRampToValueAtTime(Math.max(0.0001, ev.endVal), curT + totT * ev.endTime)

				break;
				/*case "setTarget":
					//
					g.gain.setTargetAtTime(ev.value, curT+totT*ev.startTime, ev.timeConst)
					break;
				case "setValueCurveAtTime":
					//
					g.gain.setValueCurveAtTime(ev.values,curT+totT*ev.startTime,ev.duration)
					break;
				case "cancelScheduledValues":
					//
					g.gain.cancelScheduledValues(curT+totT*ev.cancelTime)
					break;
				case "cancelAndHoldAtTime":
					//
					g.gain.cancelAndHoldAtTime(curT+totT*ev.cancelTime)
					break;*/
			default:
				console.log("sup");
		}
	}
}



/*currentGainNodes.push(new gainEvent({
	type:"setValueAtTime",
	value: 0.00001,
	startTime: 0
}))
currentGainNodes.push(new gainEvent({
	type:"exponentialRampToValueAtTime",
	value: 0.00001,
	startTime: 0
}))*/
//Value Setters
// AudioParam setValueAtTime (float value, double startTime);

// AudioParam linearRampToValueAtTime (float value, double endTime);

// AudioParam exponentialRampToValueAtTime (float value, double endTime);

// AudioParam setTargetAtTime (float target, double startTime, float timeConstant);

// AudioParam setValueCurveAtTime (sequence<float> values, double startTime, double duration);

// AudioParam cancelScheduledValues (double cancelTime);

// AudioParam cancelAndHoldAtTime (double cancelTime);

var toneStartTime = 0;
/*var panning=false;*/
var convolve = false;
var sleepTime = 0.1;
var biquad = false;
var dynamicCompressorOn=false;
var waveShaper = false;
var soundSource, concertHallBuffer;

let ajaxRequest = new XMLHttpRequest();

ajaxRequest.open('GET', 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg', true);
ajaxRequest.onload = function() {
	var audioData = ajaxRequest.response;

	ctxS.decodeAudioData(audioData, function(buffer) {
		concertHallBuffer = buffer;
		soundSource = ctxS.createBufferSource();
		soundSource.buffer = concertHallBuffer;
	}, function(e) {
		console.log("Error with decoding audio data" + e.err);
	});

	//soundSource.connect(audioCtx.destination);
	//soundSource.loop = true;
	//soundSource.start();
};
ajaxRequest.send();


ajaxRequest.responseType = 'arraybuffer';

function connectBiquad() {
	biquadFilter.connect(ctxS.destination);



}

function discBiquad() {
	biquadFilter.disconnect();
}

function playCurrentSound() {
	if (!playingTone) {
		let pTime = ctxS.currentTime;

		playingTone = true;

		tmpToneDur = toneDur;

		document.getElementById("playBut").innerHTML = "Pause";

		let curTime = ctxS.currentTime;
		toneStartTime = curTime;
		let type = document.getElementById("oscType").value || "sine";

		//Oscillator
		currentArrays = getPeriodicCoefficientArrays(type, 100);
		let o = oscTypes.custom.getOscillator(ctxS,curTime, toneDur, currentFrequencyNodes);
		var wave = ctxS.createPeriodicWave(currentArrays.a, currentArrays.b /*, {disableNormalization: false}*/ );
		o.setPeriodicWave(wave);

		//GainNode
		let g = gainTypes.custom.getGainNode(ctxS,curTime, toneDur, currentGainNodes);
		o.connect(g);
		let latest = g;

		//Convolver
		if (convolve) {

			convolveFilter.buffer = concertHallBuffer;
			latest.connect(convolveFilter);
			latest = convolveFilter;
		}
		//Biquad
		if (biquad) {
			console.log(biquadFilterDetune);
			biquadFilter.type = biquadFilterType;
			biquadFilter.Q.setValueAtTime(biquadFilterQ, curTime);
			biquadFilter.detune.setValueAtTime(biquadFilterDetune, curTime);
			biquadFilter.frequency.setValueAtTime(biquadFilterFrequency, curTime);
			biquadFilter.gain.setValueAtTime(biquadFilterGain, curTime);
			latest.connect(biquadFilter)
			latest = biquadFilter;
		}
		//Dynamic Compressor
		if (dynamicCompressorOn) {
			dynamicCompressorFilter.attack.setValueAtTime(dynamicCompressorFilterAttack,curTime);
			dynamicCompressorFilter.release.setValueAtTime(dynamicCompressorFilterRelease,curTime);
			dynamicCompressorFilter.threshold.setValueAtTime(dynamicCompressorFilterThreshold,curTime);
			dynamicCompressorFilter.knee.setValueAtTime(dynamicCompressorFilterKnee,curTime);
			dynamicCompressorFilter.ratio.setValueAtTime(dynamicCompressorFilterRatio,curTime);
			/*
			dynamicCompressorFilter.Q.setValueAtTime(biquadFilterQ, curTime);
			dynamicCompressorFilter.detune.setValueAtTime(biquadFilterDetune, curTime);
			dynamicCompressorFilter.frequency.setValueAtTime(biquadFilterFrequency, curTime);
			dynamicCompressorFilter.gain.setValueAtTime(biquadFilterGain, curTime);*/
			latest.connect(dynamicCompressorFilter)
			latest = dynamicCompressorFilter;
		}
		
		//waveShaper
		if (waveShaper) {
			waveShaperFilter.oversample = waveShaperFilterOversample;
			waveShaperFilter.curve = makeDistortionCurve(waveShaperFilterDistortionAmount);
			latest.connect(waveShaperFilter);
			latest = waveShaperFilter
		}
		latest.connect(analyser);
		latest.connect(ctxS.destination);
		//g.connect(ctxS.destination);

		//g.connect(analyser);
		//g.connect(ctxS.destination);

		analyser.connect(ctxS.destination);

		let timeTaken = 2 * (ctxS.currentTime - pTime);

		o.start(curTime + sleepTime);
		o.stop(curTime + sleepTime + toneDur);

		if (timeTaken) {
			sleepTime = timeTaken;
		}
		o.onended = function() {
			biquadFilter.disconnect();
			waveShaperFilter.disconnect();
			convolveFilter.disconnect();
			dynamicCompressorFilter.disconnect();
			playingTone = false;
			if (looped) {
				window.requestAnimationFrame(playCurrentSound);
			} else {
				document.getElementById("playBut").innerHTML = "Play";
			}
		}
	} else {
		if (ctxS.state == "running") {
			ctxS.suspend().then(function() {
				document.getElementById("playBut").innerHTML = "Play";
				//playingTone=false;
			});
			//playingTone = false;

		} else {
			ctxS.resume().then(function() {
				document.getElementById("playBut").innerHTML = "Pause";
			});
		}
	}
}

function saveCurrentSound() {

	var offCtx = new OfflineAudioContext(2, 44100 * toneDur, 44100);



	let curTime = offCtx.currentTime;

	let freq = Math.min(offCtx.sampleRate / 2, parseInt(document.getElementById("freqInp").value)) || 440;
	let type = document.getElementById("oscType").value || "sine";

	//Oscillator
	currentArrays = getPeriodicCoefficientArrays(type, 100);
	let o = oscTypes.custom.getOscillator(offCtx,curTime + sleepTime, toneDur, currentFrequencyNodes);
	var wave = offCtx.createPeriodicWave(currentArrays.a, currentArrays.b /*, {disableNormalization: false}*/ );
	o.setPeriodicWave(wave);

	//GainNode
	let g = gainTypes.custom.getGainNode(offCtx,curTime + sleepTime, toneDur, currentGainNodes);
	let latest = g;


	//Convolver
	if (convolve) {
	let tmpConvolveFilter = offCtx.createConvolver();
		tmpConvolveFilter.buffer = concertHallBuffer;
		tmpConvolveFilter.connect(g);
		latest = tmpConvolveFilter;
	}
	//Biquad
	if (biquad) {
		let tmpBiquadFilter = offCtx.createBiquadFilter();
		tmpBiquadFilter.Q.setValueAtTime(biquadFilterQ, curTime);
		tmpBiquadFilter.detune.setValueAtTime(biquadFilterDetune, curTime);
		tmpBiquadFilter.frequency.setValueAtTime(biquadFilterFrequency, curTime);
		tmpBiquadFilter.gain.setValueAtTime(biquadFilterGain, curTime);
		tmpBiquadFilter.connect(latest)
		latest = tmpBiquadFilter;
	}
	//waveShaper
	if (waveShaper) {
		let tmpWaveShaperFiler = offCtx.createWaveShaper();
		tmpWaveShaperFilter.connect(latest);
		latest = tmpWaveShaperFilter
	}
	o.connect(latest);
	//g.connect(offCtx.destination);
	g.connect(offCtx.destination);

	


	o.start(curTime+0.1);
	offCtx.startRendering().then(function(renderedBuffer) {
		console.log('Rendering completed successfully');
		console.log(renderedBuffer.getChannelData(0));
		/*window.localStorage["song0"] = renderedBuffer.getChannelData(0);*/
		let file = audioBufferToWav(renderedBuffer);
		console.log(file);

		/*let file = audioBufferToWaveBlob(renderedBuffer);
		file.then(function(result) {
			
			audioBufferToWav(result,"result.wav");
			console.log(result); // "Stuff worked!"
		}, function(err) {
		  console.log(err); // Error: "It broke"
		});*/
		var song = ctxS.createBufferSource();
		song.buffer = renderedBuffer;

		song.connect(ctxS.destination);

		
			song.start();
		
	}).catch(function(err) {
		console.log('Rendering failed: ' + err);
		// Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
	});
	o.stop(curTime + toneDur+0.2);

	
	o.onended = function() {
		biquadFilter.disconnect();
		waveShaperFilter.disconnect();
		convolveFilter.disconnect();
		
	}
}
function audioBufferToWaveBlob(audioBuffer) {

  return new Promise(function(resolve, reject) {

    var worker = new Worker('./waveWorker.js');

    worker.onmessage = function( e ) {
      var blob = new Blob([e.data.buffer], {type:"audio/wav"});
      resolve(blob);
    };

    let pcmArrays = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) {
      pcmArrays.push(audioBuffer.getChannelData(i));
    }

    worker.postMessage({
      pcmArrays,
      config: {sampleRate: audioBuffer.sampleRate}
    });

  });

}

function tick() {

	var now = window.performance.now(); // current time in ms

	var deltaTime = now - lastTick; // amount of time elapsed since last tick

	lastTick = now;


	ticker += deltaTime;


	render(doneTicks);
	doneTicks = 0;

	if (bgAudio.ended && !musicMuted) {
		bgAudio.pause();
		bgAudio.currentTime = 0;
		bgAudio.play();
	}


	if (spawnSounds.length > 0) {
		let totSpawnSounds = 0;
		for (let key in spawnSounds) {
			totSpawnSounds += spawnSounds[key];
		}
		totSpawnSounds = Math.floor(totSpawnSounds / Math.max(1, spawnSounds.length));

		playSound(totSpawnSounds);
		spawnSounds = [];
	}
	if (shotAmount > 0) {
		playGunSound(shotAmount);
	}
	shotAmount = 0;
	if (spawnSoundsAtt.length > 0) {
		let totSpawnSounds = 0;
		for (let key in spawnSoundsAtt) {
			totSpawnSounds += spawnSoundsAtt[key];
		}
		totSpawnSounds = Math.floor(totSpawnSounds / Math.max(1, spawnSoundsAtt.length));

		playHarshSound(totSpawnSounds);
		spawnSoundsAtt = [];
	}
	//  if (moved) {
	//  		moved=false;
	//  		speedMod = 1;
	//  } else {
	//  		speedMod = 5;
	//  }
	//  

	while (ticker > tickSpeed && doneTicks < 100000) {
		ticker -= tickSpeed;
		doneTicks++;
		step();
		saveTick++;
		if (saveTick > 50) {
			saveTick = 0;
			save();
		}
	}
	theLoop = window.requestAnimationFrame(tick);

}



function load() {
	if (window.localStorage.hasOwnProperty(gameName)) {
		let ls = JSON.parse(window.localStorage[gameName]);
		for (let key in ls) {
			if (ls[key] instanceof Object) {
				if (ls[key] instanceof Array) {
					window[key] = ls[key];
				} else {
					//	window[key].assign()
					console.log(key);
					console.log(ls[key]);
					mergeDeep(window[key], ls[key]);
					console.log(window[key]);

				}
			} else {

				try {
					window[key] = ls[key];

				} catch (e) {
					console.log(e);
				}
			}

		}
	}
}

function save() {
	if (window.localStorage.hasOwnProperty(gameName)) {
		let ls = JSON.parse(window.localStorage[gameName]);
		for (let i = 0; i < saveVars.length; i++) {
			ls[saveVars[i]] = window[saveVars[i]];
		}
		window.localStorage[gameName] = JSON.stringify(ls);
	} else {
		setupSave();
	}
}