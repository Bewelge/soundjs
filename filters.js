var biquadFilters = {
	lowpass: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
	highpass: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
	bandpass: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
	lowshelf: {
		detune:true,
		Q:false,
		frequency:true,
		gain: true,
	},
	highshelf: {
		detune:true,
		Q:false,
		frequency:true,
		gain: true,
	},
	peaking: {
		detune:true,
		Q:true,
		frequency:true,
		gain: true,
	},
	notch: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
	allpass: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
}
var distortionFilters = {
	lowpass: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
	highpass: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
	bandpass: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
	lowshelf: {
		detune:true,
		Q:false,
		frequency:true,
		gain: true,
	},
	highshelf: {
		detune:true,
		Q:false,
		frequency:true,
		gain: true,
	},
	peaking: {
		detune:true,
		Q:true,
		frequency:true,
		gain: true,
	},
	notch: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
	allpass: {
		detune:true,
		Q:true,
		frequency:true,
		gain: false,
	},
}

function createBiquadFilterSection(name,opts,variable) {
	let id = name.split(" ").join("");
	let cont = createDiv(id,"filterCont",{
		maxHeight:"20px",
		top:0,
		left:0,
		overflow: "hidden",
	})
	let types = {};
	for (let key in biquadFilters) {
		types[key] = key;
	}
	let title = createDiv("biquadFilterTitle","filterTitle",{
		width:"100%",
		height:"20px",
		textAlign: "center",

	}, {
		innerHTML: "Biquad Filter - Off"
	})
	title.addEventListener("click",function(){
		if (biquad) {
			biquad=false;
			
			cont.style.maxHeight = "20px";
			title.innerHTML = "Biquad Filter - Off";
		} else {
			biquad=true;
			cont.style.maxHeight = botHt*3+"px";
			title.innerHTML = "Biquad Filter - On";
		}
	})
	/*let onOff = createCheckbox("biquadFilterOn","biquadFilterOn",{

	},{

	},"biquad");
	title.appendChild(onOff)*/

	let qInp = createSliderInputDiv("biquadFilterQ","settingSetter",{

	},{
		innerHTML:"Q-Value"
	},{
		min:biquadFilter.Q.minValue,
		max:biquadFilter.Q.maxValue,
		value:biquadFilterQ,
		step:0.01,
	},
	"biquadFilterQ");

	let detInp = createSliderInputDiv("biquadFilterdetune","settingSetter",{

	},{
		innerHTML:"Detune"
	},{
		min:biquadFilter.detune.minValue,
		max:biquadFilter.detune.maxValue,
		value:biquadFilterDetune,
		step:0.01,
	},
	"biquadFilterDetune");

	let frqInp = createSliderInputDiv("biquadFilterfrequency","settingSetter",{

	},{
		innerHTML:"Frequency"
	},{
		min:biquadFilter.frequency.minValue,
		max:biquadFilter.frequency.maxValue,
		value:biquadFilterFrequency,
		step:0.01,
	},
	"biquadFilterFrequency");

	let gainInp = createSliderInputDiv("biquadFiltergain","settingSetter",{

	},{
		innerHTML:"Gain"
	},{
		min:biquadFilter.gain.minValue,
		max:biquadFilter.gain.maxValue,
		value:biquadFilterGain,
		step:0.01,
	},
	"biquadFilterGain");
	

	let typeInp = createDropDown("biquadFilterType","settingSetter",types,{
		backgroundColor:"black",
	},{value:biquadFilterType});
	typeInp.addEventListener("change",function() {
		let val = typeInp.value;
		biquadFilterType = val;
		for (let key in biquadFilters[val]) {
			if (biquadFilters[val][key]) {
				$("#biquadFilter"+key).fadeIn();
			} else {
				$("#biquadFilter"+key).fadeOut();
			}
		}	
	})
	
	for (let key in biquadFilters[biquadFilterType]) {
		if (biquadFilters[biquadFilterType][key]) {
			$("#biquadFilter"+key).fadeIn();
		} else {
			$("#biquadFilter"+key).fadeOut();
		}
	}
	cont.appendChild(title)	
	cont.appendChild(typeInp)
	cont.appendChild(gainInp);
	cont.appendChild(frqInp);
	cont.appendChild(detInp);
	cont.appendChild(qInp);

	return cont;
}

function createDynamicCompressorFilterSection(name,opts,variable) {
	let id = name.split(" ").join("");
	let cont = createDiv(id,"filterCont",{
		maxHeight:"20px",
		top:0,
		left:0,
		overflow: "hidden",
	})
	
	let title = createDiv("dynamicCompressorFilterTitle","filterTitle",{
		width:"100%",
		height:"20px",
		textAlign: "center",

	}, {
		innerHTML: "Dynamics Compressor - Off"
	})
	title.addEventListener("click",function(){
		if (dynamicCompressorOn) {
			
			dynamicCompressorOn=false;
			cont.style.maxHeight = "20px";
			title.innerHTML = "Dynamics Compressor - Off";
		} else {
			dynamicCompressorOn=true;
			cont.style.maxHeight = botHt*3+"px";
			title.innerHTML = "Dynamics Compressor - On";
		}
	})
	

	let thresholdInp = createSliderInputDiv("dynamicCompressorFilterthreshold","settingSetter",{

	},{
		innerHTML:"Threshold"
	},{
		min:dynamicCompressorFilter.threshold.minValue,
		max:dynamicCompressorFilter.threshold.maxValue,
		value:dynamicCompressorFilterThreshold,
		step:0.01,
	},
	"dynamicCompressorFilterthreshold");

	let attackInp = createSliderInputDiv("dynamicCompressorFilterattack","settingSetter",{

	},{
		innerHTML:"Attack"
	},{
		min:dynamicCompressorFilter.attack.minValue,
		max:dynamicCompressorFilter.attack.maxValue,
		value:dynamicCompressorFilterAttack,
		step:0.01,
	},
	"dynamicCompressorFilterAttack");

	let releaseInp = createSliderInputDiv("dynamicCompressorFilterrelease","settingSetter",{

	},{
		innerHTML:"Release"
	},{
		min:dynamicCompressorFilter.release.minValue,
		max:dynamicCompressorFilter.release.maxValue,
		value:dynamicCompressorFilterRelease,
		step:0.01,
	},
	"dynamicCompressorFilterRelease");

	let ratioInp = createSliderInputDiv("dynamicCompressorFilterratio","settingSetter",{

	},{
		innerHTML:"Ratio"
	},{
		min:dynamicCompressorFilter.ratio.minValue,
		max:dynamicCompressorFilter.ratio.maxValue,
		value:dynamicCompressorFilterRatio,
		step:0.01,
	},
	"dynamicCompressorFilterRatio");

	let kneeInp = createSliderInputDiv("dynamicCompressorFilterknee","settingSetter",{

	},{
		innerHTML:"Knee"
	},{
		min:dynamicCompressorFilter.knee.minValue,
		max:dynamicCompressorFilter.knee.maxValue,
		value:dynamicCompressorFilterKnee,
		step:0.01,
	},
	"dynamicCompressorFilterKnee");
	

	
	cont.appendChild(title)	
	cont.appendChild(attackInp);
	cont.appendChild(ratioInp);
	cont.appendChild(releaseInp);
	cont.appendChild(kneeInp);
	cont.appendChild(thresholdInp);

	return cont;
}

function createWaveShaperFilterSection(name,opts,variable) {

	let id = name.split(" ").join("");
	let cont = createDiv(id,"filterCont",{
		maxHeight:"20px",
		top:0,
		left:0,
		overflow: "hidden",
	})
	
	let title = createDiv("waveShaperFilterTitle","filterTitle",{
		width:"100%",
		height:"20px",
		textAlign: "center",

	}, {
		innerHTML: "Wave Shaper - Off"
	})
	title.addEventListener("click",function(){
		if (waveShaper) {
			waveShaper=false;
			cont.style.maxHeight = "20px";
			title.innerHTML = "Wave Shaper - Off";
		} else {
			waveShaper=true;
			cont.style.maxHeight = botHt*3+"px";
			title.innerHTML = "Wave Shaper - On";
		}
	})
	

	let options = 	createCheckboxDiv("waveShaperFilterthreshold","settingSetter",{

	},{
		innerHTML:"Oversampling"
	},{
		
	},{
		
		none:"none",
		x2: "2x",
		x4: "4x"
			
		
	}, "waveShaperFilterOversample");

	
	
	let distAmInp = createSliderInputDiv("waveShaperFilterdistortionAmount","settingSetter",{

	},{
		innerHTML:"Distortion Amount"
	},{
		min:0,
		max:1000,
		value:50,
		step:1,
	},
	"waveShaperFilterDistortionAmount");

	
	cont.appendChild(title)	
	cont.appendChild(options);
	cont.appendChild(distAmInp)
	

	return cont;


}

/*var biquadFilterQ=3;
var biquadFilterDetune=3;
var biquadFilterFrequency=880;
var biquadFilterGain=40;
var biquadFilterType="lowpass";*/