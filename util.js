function getScrollbarWidth() {
	var outer = document.createElement("div");
	outer.style.visibility = "hidden";
	outer.style.width = "100px";
	outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

	document.body.appendChild(outer);

	var widthNoScroll = outer.offsetWidth;
	// force scrollbars
	outer.style.overflow = "scroll";

	// add innerdiv
	var inner = document.createElement("div");
	inner.style.width = "100%";
	outer.appendChild(inner);

	var widthWithScroll = inner.offsetWidth;

	// remove divs
	outer.parentNode.removeChild(outer);

	return widthNoScroll - widthWithScroll;
}
function addUnique(arr, that) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == that) {
			return arr.slice(0);
		}
	}
	arr.push(that);
	return arr.slice(0);
}

function contains(arr, that) {
	for (let i = 0; i < arr.length; i++) {
		if (parseInt(arr[i]) == parseInt(that)) {
			return true;
		}
	}
	return false;
}
var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (blob, fileName) {
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());




function count(val,arr) {
	let count = 0;
	for (let i = 0;i<arr.length;i++) {
		if (arr[i] == val) {
			count++
		}
	}
	return count;
}

function createPalette(colorCount) {
	let newPalette = [];
	let jump = 5;
	let oneStep = 5;
	let twoStep = 10;
	let hueStep = Math.floor(330 / colorCount);
	let hueStep2 = Math.floor(330 / 5);
	let hue = 0;
	let saturation = 50;
	let luminosity = 50;
	let greenJump = false;

	for (let colorIndex = 0; colorIndex < colorCount; colorIndex++) {
		saturation = 10 + colorIndex * 1 - Math.floor(colorIndex / 5) * 1;
		luminosity = 90 - Math.floor(colorIndex / 5);
		newPalette.push(hslToRgbString(hue, saturation, luminosity));
		hue += hueStep2; //colorIndex*  hueStep -Math.floor(colorIndex/jump)*15;
		if (!greenJump && hue > 100) {
			hue += 30;
			greenJump = true;
		}
	}
	return newPalette;


	/*for (let colorIndex = 0; colorIndex < colorCount; colorIndex++) {
		saturation = 50 + colorIndex * 1 - Math.floor(colorIndex / 5) * 1;
		luminosity = 75 - colorIndex * 5 + Math.floor(colorIndex / 5) * 5 * 5;
		newPalette.push(hslToRgbString(hue, saturation, luminosity));
		hue = colorIndex * hueStep - Math.floor(colorIndex / jump) * 15;
		if (!greenJump && hue > 100) {
			hue += 30;
			greenJump = true;
		}
	}
	return newPalette;*/
}

function hslToRgbString(h, s, l, a) {
	// a = a || 1;
	a = Math.floor(a * 100) / 100;
	dummyContext.fillStyle = 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ' )';
	//str = (String) dummyContext.fillStyle;
	return dummyContext.fillStyle;
}
var dummyContext = document.createElement("canvas").getContext("2d");
function hexToRgb(hex) {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function getColor(n, a) {

	let h = n + Math.floor((n) / 5) * 55 + Math.floor(n / 100) * 30;
	let s = 30 + n - Math.floor(n / 5); //Math.floor(n/10);
	let l = 65 - n * 5 + Math.floor(n / 5) * 25; //Math.floor(n/10);
	if (n < 0) {
		return hslToRgbString(0, 0, 50, a);
	}
	return hslToRgbString(h, s, l, a);

}

function getDarkerColor(n, a) {
	let h = n * 1 + Math.floor((n) / 5) * 55 + Math.floor(n / 100) * 30;
	let s = 30 + n - Math.floor(n / 5); //Math.floor(n/10);
	let l = 55 - n * 5 + Math.floor(n / 5) * 25; //Math.floor(n/10);
	if (n < 0) {
		return hslToRgbString(0, 0, 0, a);
	}
	return hslToRgbString(h, s, l, a);
}
var colors = {

}
// function getLighterColor(n, a) {
// 	if (!colors.hasOwnProperty(n)) {
// 		let h = n * 0.1 + Math.floor((n) / 5) * 55 + Math.floor(n / 100) * 30;
// 		let s =  n - Math.floor(n / 5); //Math.floor(n/10);
// 		let l = 75 - n * 2 + Math.floor(n / 10) * 25; //Math.floor(n/10);
		
// 		colors[n]=hslToRgbString(h, s, l, a);
// 	}
// 	return colors[n];
// }
function getLighterColor(n, a) {
	n++;
	if (!colors.hasOwnProperty(n)) {
		let h = 250-n * 2 ;
		let s = ((250- n) % 250)   ; //Math.floor(n/10);
		let l = 40 ; //Math.floor(n/10);
		
		colors[n]="hsla("+h+","+ s+"%,"+ l+"%,";
	}
	return colors[n]+a+")";
}




function roundRect(ctx, x, y, width, height, radius, fill, stroke, fs) {
	if (typeof stroke == 'undefined') {
		stroke = true;
	}
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = {
			tl: radius,
			tr: radius,
			br: radius,
			bl: radius
		};
	} else {
		var defaultRadius = {
			tl: 0,
			tr: 0,
			br: 0,
			bl: 0
		};
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	ctx.fillStyle = fs;
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
		ctx.fill();
	}
	if (stroke) {
		// ctx.stroke();
	}

}


function getBrightness(col) {
	return Math.sqrt(0.241 * col.r * col.r + 0.691 * col.g * col.g + 0.068 * col.b * col.b);
}


function hiliteClick(that) {
	console.log(that)
	that.target.removeEventListener("click",hiliteClick);
	$("#hiliteOverlay").fadeOut(function() {
		$("#hiliteOverlay").remove();
	})
}
function hiliteEl(el) {
	let over = document.createElement("div");
	over.className = "hiliteOverlay";
	over.id = "hiliteOverlay";

	document.getElementById(el).addEventListener("click",hiliteClick)

	let dims = getDims(el);

	let p1 = {x:dims.l,y:dims.t}
	let p2 = {x:dims.l+dims.w,y:dims.t}
	let p3 = {x:dims.l+dims.w,y:dims.t+dims.h}
	let p4 = {x:dims.l,y:dims.t+dims.h}

	let mg = 4;

	let svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
	svg.setAttribute("viewBox","0 0 "+(width+2*sides)+" "+(height+topp));
	svg.setAttribute("class","hiliteOverlay");
	svg.setAttribute("id","hiliteOverlay");
	
	let pth1 = document.createElementNS("http://www.w3.org/2000/svg","path");
	pth1.setAttribute("d","M"+(dims.l-mg)+","+(dims.t-mg)+" L"+(dims.l+dims.w+mg)+","+(dims.t-mg)+" L"+(dims.l+dims.w+mg)+","+(dims.t+dims.h+mg)+" L"+(dims.l-mg)+","+(dims.t+dims.h+mg)+" L"+(dims.l-mg)+","+0+" L"+0+","+0+" L"+0+","+(height+topp)+" L"+(width+2*sides)+","+(height+topp)+" L"+(width+2*sides)+","+0+" L"+(dims.l-mg)+","+0+" L"+(dims.l-mg)+","+(dims.t-mg)+" Z");
	svg.appendChild(pth1);

	let pth2 = document.createElementNS("http://www.w3.org/2000/svg","path");
	pth2.setAttribute("class","innerPath");
	pth2.setAttribute("d","M"+(dims.l-mg)+","+(dims.t-mg)+" L"+(dims.l+dims.w+mg)+","+(dims.t-mg)+" L"+(dims.l+dims.w+mg)+","+(dims.t+dims.h+mg)+" L"+(dims.l-mg)+","+(dims.t+dims.h+mg)+" Z");

	svg.appendChild(pth2);
	$(svg).fadeIn();
}

function angle(p1x, p1y, p2x, p2y) {

	return Math.atan2(p2y - p1y, p2x - p1x);

}
function Distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}


function myKeyDown(e) {
	//console.log(e);
	if (e.code == "Space") {
		if (tankUnlocked) {
			switchTanks();
		}
		/*if (shootMode && tankUnlocked) {
			shootMode = false
		} else if (tankUnlocked) {
			shootMode = true;
			selected = -1;
		}*/
	}
}

function myMouseMove(e) {
	//console.log(e);
	//e.preventDefault();
	mouseX = e.clientX - sides;
	mouseY = e.clientY - topp;

	moved = true;
}

function myMouseUp(e) {
	//e.preventDefault();
	shooting = false;
	//	console.log(shooting);
}

function myMouseDown(e) {
	var lstSel = selected;
	if (shootMode) {
		shooting = true;

		return;
	}
	if (mouseAttract) {
		attractMouse(getMousePosX(gameCanvas, e), getMousePosY(gameCanvas, e));
		return;
	}
	if (selected > -1) {
		selected = -1;
		return;
	}
	//spawnMob(0,e.clientX,e.clientY,0,0);
	for (var key = arrMons.length - 1; key >= 0; key--) {
		if (key != lstSel) {
			//console.log(Distance(e.clientX,e.clientY,arrMons[key][1],arrMons[key][2]));
			//console.log((arrMons[key][0]+1)*radius);
			if (Distance(getMousePosX(gameCanvas, e), getMousePosY(gameCanvas, e), arrMons[key][1], arrMons[key][2]) < getRad(arrMons[key][0])) {
				//arrMons.splice(key,1);
				selected = key;
				return;
			}

		}
	}
}

function getMousePosX(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return evt.clientX - rect.left;


}

function getMousePosY(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return evt.clientY - rect.top;
}