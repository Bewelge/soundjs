function quickSort2(arr) {

	if (arr.length==0) {
		return [];
	}
	if (arr.length == 1) {
		return arr;
	}
	if ( arr.length  > 0 ) {

		var H = [];
		var L = [];
		var pivot = arr[arr.length-1];
		for (var i = 0; i< arr.length;i++) {
			if (arr[i][0]<pivot[0]) {
				H.push(arr[i]);
			} else if (arr[i] != pivot) {
				L.push(arr[i]);
			}
		}
		if (H.length>0) {
			if (H.length==1) {
				// H = H;
			} else {
			//	console.log(H);
				H = quickSort2(H);
			}
		}
		if (L.length>0) {
			if (L.length==1) {
				// H = H;
			} else {
			//	console.log(L);
				L = quickSort2(L);
			}
		}
		
		L.push(pivot);
		for (var j = 0;j<H.length;j++) {
			
			L.push(H[j]);
		}
		return L;

	}
}
function quickSort(arrr) {
	arrr=null;
	let arr=arrr.slice(0);
	if (arr.length==0) {
		return [];
	}
	if (arr.length == 1) {
		return arr;
	}
	if ( arr.length  > 0 ) {

		let H = [];
		let L = [];
		let pivot = arr[arr.length-1];
		for (let i = 0; i< arr.length;i++) {
			if (arr[i]>pivot) {
				H.push(arr[i]);
			} else if (arr[i] != pivot) {
				L.push(arr[i]);
			}
		}
		if (H.length>0) {
			if (H.length==1) {
				// H = H;
			} else {
			//	console.log(H);
				H = quickSort(H.slice(0));
			}
		}
		if (L.length>0) {
			if (L.length==1) {
				// H = H;
			} else {
			//	console.log(L);
				L = quickSort(L.slice(0));
			}
		}
		L.push(pivot);
		for (let j = 0;j<H.length;j++) {
			L.push(H[j]);
		}
		H=null;
		return L;

	}
}
function swap(arr, a, b) {
	var temp = arr[b];
	arr[b] = arr[a];
	arr[a] = temp;
	temp = null;
	return arr;
}