var ctxS = new(window.AudioContext || window.webkitAudioContext)();

var analyser = ctxS.createAnalyser();
var convolveFilter = ctxS.createConvolver();
var waveShaperFilter = ctxS.createWaveShaper();
var waveShaperFilterOversample = "none";
var waveShaperFilterDistortionAmount = 50;

var biquadFilter = ctxS.createBiquadFilter();
var biquadFilterQ=1;
var biquadFilterDetune=0;
var biquadFilterFrequency=350;
var biquadFilterGain=0;
var biquadFilterType="lowpass";

var dynamicCompressorFilter = ctxS.createDynamicsCompressor();
var dynamicCompressorFilterThreshold=-24;
var dynamicCompressorFilterAttack=0.03;
var dynamicCompressorFilterRelease=0.25;
var dynamicCompressorFilterKnee=30;
var dynamicCompressorFilterRatio=12;


///////From https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js////////////-->
function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};
////////////////////////////////////<--



function getWaveformAt(arrA,arrB,t) {
	//x(t)=∑k=1L−1(a[k]cos2πkt+b[k]sin2πkt)
	let sum = 0;
	for (let i = 1;i < arrA.length; i++) {
		sum+= arrA[i]*Math.cos(2 * Math.PI*t*i) +  arrB[i]*Math.sin(2*Math.PI*i*t)
	}
	return sum;
}
function getPeriodLength(arrA,arrB) {
	let vals = [];
	for (let i = 0;i<2000;i++) {
		let y = getWaveformAt(arrA,arrB,i*0.1);
		
			let cnt = count(y,vals)
			if (cnt >1) {
				return i*0.1;
				
			}
		
		vals.push(y)

	}
	return Math.PI*2;
}
function normalizeCoefficients(arrA,arrB) {
	
	let max1 = 0;
	for (var i = arrA.length - 1; i >= 0; i--) {
		if ( arrA[i] > max1) {
			max1 = arrA[i];
		}
	};
	for (var i = arrA.length - 1; i >= 0; i--) {
		arrA[i]*= 1/max1
	};

	
	let max2 = 0;
	for (var i = arrB.length - 1; i >= 0; i--) {
		if ( arrB[i] > max2) {
			max2 = arrB[i];
		}
	};
	for (var i = arrB.length - 1; i >= 0; i--) {
		arrB[i]*= 1/max2
	};
	return {a:arrA,b:arrB}

}
function getPeriodicCoefficientArrays(type,length) {
	//b[n]=2nπ[1−(−1)n]
	let a = new  Float32Array(length);
	let b = new  Float32Array(length);
	for (let i = 1; i < length;i++) {
		if (type == "square") {
			a[i] = (0);
			b[i] = ((2/i*Math.PI)*(1-Math.pow(-1,i)));
		} else if (type == "sine") {
			if (i == 1) {
				a[i] = (0);
				b[i] = (1);
			}
		} else if (type == "sawtooth") {
			a[i] = (0);
			b[i] = (Math.pow(-1,i+1)* (2 / (i * Math.PI)))
		} else if (type == "triangle") {
			a[i] = (0);
			b[i] = ((8*Math.sin((i*Math.PI)/2)) / Math.pow(Math.PI*i,2))
		} else if (type == "custom") {
			a[i] = (0);
			b[i] = (customWaveFunction(i))
		}
	}

	return {a:a,b:b}
}
var customWaveFunction = function(i) {
	return (1-Math.pow(-1,i)) * Math.PI*2/i;
	//return (1-Math.pow(-1,i)) * 10/Math.ceil(i/2);
	//return Math.pow(Math.pow(-2,i),-i)*Math.pow(-1,i)*Math.PI*2; 
}
var currentO = [];
var currentG = [];
function playNote(note,dur) {
	console.log("playingnote"+note);
	var g = ctxS.createGain();
	g.gain.setValueAtTime(0.0001,ctxS.currentTime);
	
	g.gain.linearRampToValueAtTime(
		0.5, ctxS.currentTime + 0.5
	);
	g.gain.setValueAtTime(0.5,ctxS.currentTime+5);
	g.gain.linearRampToValueAtTime(
		0.00001, ctxS.currentTime + 10
	);

	let type = document.getElementById("oscType").value || "sine";

	let o = oscTypes.normal.getOscillator(ctxS,ctxS.currentTime,0.5);
		if (type == "custom") {

			var wave = ctxS.createPeriodicWave(currentArrays.a, currentArrays.b, {disableNormalization: false});

			o.setPeriodicWave(wave);
		} else {
			o.type = type
		}

		
	

	
	o.frequency.value = getFrequency(note);
	
	o.connect(g);
	g.connect(ctxS.destination);
	g.connect(analyser);
	
	currentG.push(g);
	currentO.push(o);
		
	o.start(ctxS.currentTime);
	o.stop(ctxS.currentTime+10);
	o.onended= function() {
	}
}
function endNotes() {
	console.log("endingnote");
	if (currentG.length>0) {
		for (let key in currentG) {
			currentG[key].gain.setValueAtTime(0.5,ctxS.currentTime);
			currentG[key].gain.linearRampToValueAtTime(0.00001,ctxS.currentTime+0.5);
		}
		currentG = [];
	}
	if (currentO.length>0) {
		for (let key in currentO) {
			currentO[key].stop(ctxS.currentTime+0.5)
		}
		currentO = [];
	}
}
function playGunSound(am) {

	var g = ctxS.createGain();
	g.gain.value = 0.00001
	for (let i = 1;i<am+1;i++) {
		g.gain.exponentialRampToValueAtTime(
			0.2, ctxS.currentTime + 0.1 * i
		);
		g.gain.exponentialRampToValueAtTime(
			0.00001, ctxS.currentTime + 0.05 + 0.1  * i
		);
	}


	var o = ctxS.createOscillator();
	o.type = "sine"
	o.frequency.value = 100 + Math.random() * 0.01 - Math.random() * 0.01;
	g.connect(ctxS.destination);
	o.connect(g);
	o.start(0);
}

function playHarshSound(lv) {
	var g = ctxS.createGain();
	g.gain.value = 0.00001;
	
	g.gain.exponentialRampToValueAtTime(
		0.2, ctxS.currentTime + 0.05
	);
	g.gain.exponentialRampToValueAtTime(
		0.00001, ctxS.currentTime + 0.55
	);



	var o = ctxS.createOscillator();
	o.type = "triangle"
	o.frequency.value = getFrequency(lv) + Math.random() * 0.01 - Math.random() * 0.01;
	g.connect(ctxS.destination);
	o.connect(g);
	o.start(0);
}

function playSound(lv) {
	var g = ctxS.createGain();
	g.gain.value = 0.0001;
	
	g.gain.exponentialRampToValueAtTime(
		0.08, ctxS.currentTime + 0.4
	);
	g.gain.exponentialRampToValueAtTime(
		0.00001, ctxS.currentTime + 0.5
	);

	var o = ctxS.createOscillator();
	o.type = "triangle"
	o.frequency.value = getFrequency(lv);
	g.connect(ctxS.destination);
	o.connect(g);
	o.start(0);
}

function getFrequency(note) {
	note -= 48;
	let frq = 440 * Math.pow(2, note / 12);
	/*console.log(frq,note);*/
	return frq
}

function muteMusic() {

	if (musicMuted) {
		musicMuted = false;
		bgAudio.play();
	} else {
		musicMuted = true;
		bgAudio.pause();
		bgAudio.currentTime = 0;
	}

}
var audioMuted = false;
var musicMuted = false;

function muteAudio() {
	if (audioMuted) {
		audioMuted = false;
	} else {
		audioMuted = true;
	}
}