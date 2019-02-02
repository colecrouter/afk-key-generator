// JavaScript Document

// Change here
var bdEmail "email@email.com";
var aEmail = "email@email.com";

// Other variables
var done;
var loader;
var progressa;
var progressb;
var gcid;
var uuid;
var oldLength = 0;
var oldLengthP = 0;
var currPage;
var popover;

// Get progress of Bitdefender key generation
function getBDProgress() {
	try {
		$.get("/progress/b_" + uuid + ".txt", {}, function(e){
			var result = parseInt(e);
			var bar = document.getElementById("bpr");
			
			// Updates progress bar if it has not finished already
			if (bar.style.width != "100%") {
				bar.classList = "progress-bar progress-bar-striped bg-warning";
				
				switch (result) {
					default:
					case 0:
						bar.style.width = "0%";
						break;
					case 1:
						bar.style.width = "25%";
						break;
					case 2:
						bar.style.width = "50%";
						break;
					case 3:
						bar.style.width = "75%";
						break;
					case 4:
						bar.classList = "progress-bar progress-bar-striped bg-success";
						bar.style.width = "100%";
						break;
				}
			}
		});
	} catch (Exception) {
		clearInterval(progressb);
	}
}

// Get progress of Acronis key generation
function getAProgress() {
	try {
		$.get("/progress/a_" + uuid + ".txt", {}, function(e){
			var result = parseInt(e);
			var bar = document.getElementById("apr");
			
			// Updates progress bar if it has not finished already
			if (bar.style.width != "100%") {
				bar.classList = "progress-bar progress-bar-striped bg-warning";
				switch (result) {
					default:
					case 0:
						bar.style.width = "0%";
						break;
					case 1:
						bar.style.width = "33%";
						break;
					case 2:
						bar.style.width = "67%";
						break;
					case 3:
						bar.classList = "progress-bar progress-bar-striped bg-success";
						bar.style.width = "100%";
						break;
				}
			}
		});
	} catch (Exception) {
		clearInterval(progressa);
	}
}

// Sends request for Bitdefender key
function getBitdefenderKey() {
	var data;
	var bp;

	// Reset progress bar
	document.getElementById("bpr").style.width = "0%";

	// Gets info from fields
	bp = document.getElementById("bp").value;
	gcid = document.getElementById("gcid").value;
	var program;
	
	if (document.getElementById("type").innerHTML === "GSHM") {
		program = "gshm";
	} else {
		program = "ultimate_setup";
	}

	// Contructing data to send
	var product = "1293";
	var bb_store_no = gcid.substring(0, 4);
	var bb_purchase_date = gcid.substring(20, 22) + gcid.substring(14, 16) + gcid.substring(17, 19);
	var bb_purchase_date2 = "2005" + gcid.substring(14, 16) + gcid.substring(17, 19);
	var bb_purchase_date3 = gcid.substring(20, 22) + gcid.substring(14, 16) + gcid.substring(17, 19);
	var bb_till_no = gcid.substring(5, 8);
	var bb_invoice_no = gcid.substring(9, 13);
	var type = "consumer";
	var gcid = bb_store_no + " " + bb_purchase_date + " " + bb_till_no + " " + bb_invoice_no;
	var login = bdEmail;
	var passwd = bp;

	data = {
		program,
		product,
		bb_store_no,
		bb_purchase_date,
		bb_purchase_date2,
		bb_purchase_date3,
		bb_till_no,
		bb_invoice_no,
		type,
		gcid,
		login,
		passwd
	};

	// Send request to make key
	try {
		$.post("getBitdefender.php", {
			data1: data, uuid: uuid, gcid: document.getElementById("gcid").value
		}, BDSuccess);
	} catch (Exception) {
		console.error("Error: Could not generate key: " + Exception.message);
		return;
	}
}

// Sends request to search for Bitdefender key
function listBitdefenderKey() {
	if (document.getElementById("bp").value.length === 0) {
		return;
	}
	
	document.getElementById("submit").disabled = true;
	
	// Gets info from fields
	var bp = document.getElementById("bp").value;
	gcid = document.getElementById("gcid").value;
	
	uuid = window.crypto.getRandomValues(new Uint32Array(4)).join('-'); // Generate UUID
	
	// Contructing data to send
	var gcid = gcid.substring(0, 4) + " " + gcid.substring(20, 22) + gcid.substring(14, 16) + gcid.substring(17, 19) + " " + gcid.substring(5, 8) + " " + gcid.substring(9, 13);
	var login = bdEmail;
	var passwd = bp;
	
	var data = {
		gcid,
		login,
		passwd
	};
	
	// Send toast
	notification(0, "Searching...");
	
	// Send request to make key
	try {
		$.post("listBitdefender.php", {
			uuid: uuid, data1: data
		}, (function(e){createTable(e);document.getElementById("submit").disabled = false;}));
	} catch (Exception) {
		console.error("Error: Could not search key: " + Exception.message);
		document.getElementById("submit").disabled = false;
		return;
	}
}

// Sends request to invalidate Bitdefender key
function removeBitdefenderKey() {

	if (document.getElementById("bk").value.length !== 10) {
		return;
	}
	
	document.getElementById("bpr").style = "width: 0%";
	document.getElementById("brbutton").disabled = true;
	
	if (document.getElementById("bp").value !== "") {
		progressb = setInterval(getBDProgress, 1000); // Begin to check progress of Bitdefender key
	}
	
	var data;
	var bp;
	
	uuid = window.crypto.getRandomValues(new Uint32Array(4)).join('-'); // Generate UUID

	// Gets info from fields
	bp = document.getElementById("bp").value;

	// Contructing data to send
	var keys = document.getElementById("bk").value;
	var reason = document.getElementById("br").value;
	var login = bdEmail;
	var passwd = bp;

	data = {
		keys,
		reason,
		login,
		passwd
	};

	// Send request to make key
	try {
		$.post("removeBitdefender.php", {
			data1: data, uuid: uuid
		}, function(e){
			if (e === "Success"){
				notification(0, "Key Invalidated!"); 
				document.getElementById("bpr").classList = "progress-bar progress-bar-striped bg-success";
				document.getElementById("bpr").style = "width: 100%";
				console.log("Bitdefender key: Invalidated!");
			} 
			else {
				notification(2, "Failed to Invalidate"); 
				document.getElementById("bpr").classList = "progress-bar progress-bar-striped bg-danger";
				document.getElementById("bpr").style = "width: 100%";
				console.warn("Bitdefender key: Unable to log in");
			}
			clearInterval(progressb);
			document.getElementById("brbutton").disabled = false;
		});
	} catch (Exception) {
		console.error("Error: Could not invalidate key: " + Exception.message);
		return;
	}
}

// Ran on response from server for Bitdefender
function BDSuccess(result) {
	if (result === '-Type" con') {
		document.getElementById("bk").value = "Unable to login";
		done[0] = 2;
		document.getElementById("bpr").classList = "progress-bar progress-bar-striped bg-danger";
		document.getElementById("bpr").style = "width: 100%";
		console.warn("Bitdefender key: Unable to log in");
	} else {
		document.getElementById("bk").value = result;
		document.getElementById("bdg").value = result;
		done[0] = 1;
		document.getElementById("bpr").classList = "progress-bar progress-bar-striped bg-success";
		document.getElementById("bpr").style = "width: 100%";
		console.log("Bitdefender key: " + result);
	}
}

// Sends request for Acronis key
function getAcronisKey() {
	
	var data;
	var ap;

	// Reset progress bar
	document.getElementById("apr").style.width = "0%";

	// Gets info from fields
	gcid = document.getElementById("gcid").value;
	ap = document.getElementById("ap").value.toString();
	
	// Constructs data to send
	var Source = "GCID";
	var Platform = "All";
	var Service = "GS Home Membership";
	var OBTitle = 9;
	var Category = "Computer";
	var partner_key = "";
	var store = gcid.substring(1, 4);
	var date = gcid.substring(20, 22) + gcid.substring(14, 16) + gcid.substring(17, 19);
	var till = gcid.substring(6, 8);
	var invoice = gcid.substring(9, 13);
	var scan_gcid = "";
	var getpromo = 1;
	var user = aEmail;
	var password = ap;
	data = {
		Source,
		Platform,
		Service,
		OBTitle,
		Category,
		partner_key,
		store,
		date,
		till,
		invoice,
		scan_gcid,
		getpromo,
		user,
		password
	};
	data['-back'] = "";

	// Sends data to make key
	try {
		$.post("getAcronis.php", {
			data: data, uuid: uuid, gcid: gcid
		}, ASuccess);
	} catch (Exception) {
		console.error("Error: Could not generate key: " + Exception.message);
		return;
	}
}

// Sends request to invalidate Acronis key
function removeAcronisKey() {
	if (document.getElementById("gcid").value.length !== 22) {
		return;
	}
	
	document.getElementById("apr").style = "width: 0%";
	document.getElementById("arbutton").disabled = true;
	
	if (document.getElementById("ap").value !== "") {
		progressa = setInterval(getAProgress, 1000); // Begin to check progress of Bitdefender key
	}
	
	var data;
	var ap;
	
	uuid = window.crypto.getRandomValues(new Uint32Array(4)).join('-'); // Generate UUID

	// Gets info from fields
	ap = document.getElementById("ap").value.toString();
	
	// Constructs data to send
	var aGCID = gcid.substring(1,4) + "-" + gcid.substring(20,22) + gcid.substring(14,16) + gcid.substring(17,19) + "-" + gcid.substring(6,8) + "-" + gcid.substring(9,13);
	var lSerial = 0;
	var action = "replace";
	var user = aEmail;
	var password = ap;
	data = {
		aGCID,
		lSerial,
		user,
		password,
		action
	};
	data['-back'] = "";

	// Sends data to make key
	try {
		$.post("removeAcronis.php", {
			data: data, uuid: uuid
		}, function(e){
			console.log(e);
			if (e === "Success"){
				notification(0, "Key Invalidated!"); 
				document.getElementById("apr").classList = "progress-bar progress-bar-striped bg-success";
				document.getElementById("apr").style = "width: 100%";
				console.log("Acronis key: Invalidated!");
			} 
			else {
				notification(2, "Failed to Invalidate"); 
				document.getElementById("apr").classList = "progress-bar progress-bar-striped bg-danger";
				document.getElementById("apr").style = "width: 100%";
				console.warn("Acronis key: Unable to log in");
			}
			clearInterval(progressa);
			document.getElementById("arbutton").disabled = false;
		});
	} catch (Exception) {
		console.error("Error: Could not invalidate key: " + Exception.message);
		return;
	}
}

// Ran on response from server for Acronis 
function ASuccess(result) {
	if (result === '"-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/D') {
		document.getElementById("ak").value = "Unable to log in";
		done[1] = 2;
		document.getElementById("apr").classList = "progress-bar progress-bar-striped bg-danger";
		document.getElementById("apr").style = "width: 100%";
		console.warn("Acronis key: Unable to log in");
	} else {
		document.getElementById("ak").value = result;
		document.getElementById("ag").value = result;
		done[1] = 1;
		document.getElementById("apr").classList = "progress-bar progress-bar-striped bg-success";
		document.getElementById("apr").style = "width: 100%";
		console.log("Acronis key:\n" + result);
	}
}

// Figures out and manages which key functions need to run
function getBothKeys() {
	
	// Determines if the GCID field is filled or not
	if (document.getElementById("gcid").value.length !== 22) {
		return;
	}
	
	uuid = window.crypto.getRandomValues(new Uint32Array(4)).join('-'); // Generate UUID
	
	// Prepare page to receive keys
	done = [false, false];
	document.getElementById("submit").disabled = true;
	document.getElementById("bpr").style = "width: 0%";
	document.getElementById("apr").style = "width: 0%";
	
	if (document.getElementById("bp").value !== "") {
		progressb = setInterval(getBDProgress, 1000); // Begin to check progress of Bitdefender key
		getBitdefenderKey();
	}
	else {
		done[0] = 1;
	}
	
	// Runs only if Acronis key is needed
	if (document.getElementById("type").innerHTML === "GSHM" && document.getElementById("ap").value !== "") {
		setTimeout(function(){progressa = setInterval(getAProgress, 1000);}, 500); // Begin to check progress of Acronis key
		getAcronisKey();
	} else {
		done[1] = 1;
	}
	
	loader = setInterval(checkFinished, 100); // Begin to check if finished
}

// Auto inserts dashes and slashes, also formats if you use a regular barcode scanner on a receipt
function checkGCID() {
	
	if (currPage === undefined) {
		return;
	}
	
	var length = document.getElementById("gcid").value.length;
	gcid = document.getElementById("gcid").value;

	if (length === 4 && length > oldLength) {
		document.getElementById("gcid").value += "-";
	}

	if (length === 8 && length > oldLength) {
		document.getElementById("gcid").value += "-";
	}

	if (length === 13 && length > oldLength) {
		document.getElementById("gcid").value += "-";
	}

	if (length === 16 && length > oldLength) {
		document.getElementById("gcid").value += "/";
	}

	if (length === 19 && length > oldLength) {
		document.getElementById("gcid").value += "/";
	}

	if (length === 22) {
		/*if (gcid.match(/[a-z]/i)) {
			document.getElementById("gcid").classList = "input-group-text col-12 form-control bg-danger";
		} else {
			document.getElementById("gcid").classList = "input-group-text col-12 form-control bg-success";
		}*/
		if (gcid.indexOf("-") === -1) {
			var scannerFix = "";
			scannerFix += gcid.substring(2, 6) + "-";
			scannerFix += gcid.substring(6, 9) + "-";
			scannerFix += gcid.substring(9, 13) + "-";
			scannerFix += gcid.substring(13, 15) + "/";
			scannerFix += gcid.substring(15, 17) + "/";
			scannerFix += gcid.substring(19, 21);
			document.getElementById("gcid").value = scannerFix;
		}
		popoverGCID();
	} else {
		document.getElementById("gcid").classList = "input-group-text col-12 form-control";
	}

	oldLength = length;
}

// Create popover for GCID
function popoverGCID() {
	if (currPage === undefined) {
		return;
	}
	
	gcid = document.getElementById("gcid").value;
	popover = $('#gcid').data('bs.popover');
	if (gcid.length !== oldLengthP) {
		if (gcid !== "" && gcid.length < 22) {
			if ($("#gcid").is(":focus")) {
				$("#gcid").popover("show");
			}
			if (gcid.length >= 1 && gcid.length <= 4) {
				document.getElementById("gcid").setAttribute("data-content", "<b>XXXX</b>-XXX-XXXX-MM/DD/YY");
			}
			else if (gcid.length >= 5 && gcid.length <= 8) {
				document.getElementById("gcid").setAttribute("data-content", "XXXX-<b>XXX</b>-XXXX-MM/DD/YY");
			}
			else if (gcid.length >= 9 && gcid.length <= 13) {
				document.getElementById("gcid").setAttribute("data-content", "XXXX-XXX-<b>XXXX</b>-MM/DD/YY");
			}
			else if (gcid.length >= 14 && gcid.length <= 21) {
				document.getElementById("gcid").setAttribute("data-content", "XXXX-XXX-XXXX-<b>MM/DD/YY</b>");
			}
			$("#gcid").popover("show");
		}
		else {
			$("#gcid").popover("hide");
		}
		if (!$("#gcid").is(":focus")) {
			$("#gcid").popover("hide");
		}
	}
	oldLengthP = gcid.length;
}

// Makes checkGCID run every 0.1 seconds. Number can be increased to improve browser performance, but will screw up with fast typers
// Makes popoverGCID run every 0.5 seconds. Number can be increase to improve browser performance, but will decrease visual integrity
setInterval(checkGCID, 100);
setInterval(popoverGCID, 500);

// Checks if browser has received keys back so it can close the loading thingy
function checkFinished() {
	if (done[0] === 1 && done[1] === 1) {
		clearInterval(progressb);
		clearInterval(progressa);
		clearInterval(loader);
		document.getElementById("submit").disabled = false;
		document.getElementById("setupbtn").disabled = false;
	} else if (done[0] === 0 || done[1] === 0) {
	} else if (done[0] === 2 || done[1] === 2) {
		clearInterval(progressb);
		clearInterval(progressa);
		clearInterval(loader);
		document.getElementById("submit").disabled = false;
		document.getElementById("setupbtn").disabled = true;
	}
}

// For switching between Ultimate and GSHM configuration
function switchType(type) {
	if (type === 0) {
		document.getElementById("type").innerHTML = "GSHM";
		document.getElementById("ap").readOnly = false;
		document.getElementById("ap").placeholder = "Password for Acronis Portal";
		document.getElementById("setup").action = "getGSHMGuide.php";
	} else {
		document.getElementById("type").innerHTML = "Ultimate";
		document.getElementById("ap").readOnly = true;
		document.getElementById("ap").placeholder = "";
		document.getElementById("ap").value = "";
		document.getElementById("setup").action = "getUltimateGuide.php";
	}
}

// Toaster notification (type -> 0 = success, 1 = warning, 2 = error)
function notification(type, string) {
	document.getElementById("toaster").style.opacity = 1;
	switch (type) {
		default:
		case 0:
			document.getElementById("toaster").innerHTML += "<div class=\"alert alert-success toast\" role=\"alert\">" + string + "</div>";
			break;
		case 1:
			document.getElementById("toaster").innerHTML += "<div class=\"alert alert-warning toast\" role=\"alert\">" + string + "</div>";
			break;
		case 2:
			document.getElementById("toaster").innerHTML += "<div class=\"alert alert-danger toast\" role=\"alert\">" + string + "</div>";
			break;
	}
	//toaster.style.opacity = 1;
	setTimeout(function(){document.getElementById("toaster").style.opacity = 0;}, 2000);
	setTimeout(function(){document.getElementById("toaster").innerHTML = "";}, 3000);
}

// Function for dynamic content loading
function loadPage(n) {
	if (n !== currPage) {
		var page;
		var buttonClass = document.getElementsByClassName("sidebar")[0].children[0];
		var cont = document.getElementById("container");
		cont.style.opacity = "0";
		switch(n) {
			default:
			case 0:
				buttonClass.children[0].classList = "btn btn-success col-4";
				buttonClass.children[1].classList = "btn btn-outline-danger col-4";
				buttonClass.children[2].classList = "btn btn-outline-warning col-4";
				page = "generator.html";
				break;
			case 1:
				buttonClass.children[0].classList = "btn btn-outline-success col-4";
				buttonClass.children[1].classList = "btn btn-danger col-4";
				buttonClass.children[2].classList = "btn btn-outline-warning col-4";
				page = "invalidate.html";
				break;
			case 2:
				buttonClass.children[0].classList = "btn btn-outline-success col-4";
				buttonClass.children[1].classList = "btn btn-outline-danger col-4";
				buttonClass.children[2].classList = "btn btn-warning col-4";
				page = "list.html";
				break;
		}
		$.get(page, {}, function(e){
			setTimeout(function(){
				cont.innerHTML = e;
				currPage = n;
				cont.style.opacity = "1";
				$('[data-toggle="popover"]').popover();
				if (currPage === 2) {
					createTable(0);
				}
			}, 500);
		});
	}
}

// Create table for Bitdefender key list
function createTable(t) {
	document.getElementById("keys").innerHTML = "";
	if (t === 0) {
		for (var i = 0; i < 10; i++) {
			document.getElementById("keys").innerHTML += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
		}
	} else {
		var l = [];
		t = JSON.parse(t);
		for (var i = 0; i < t.length; i++) {
			var o = {};
			o.date = t[i][5];
			o.gcid = t[i][0].substring(0,4) + "-" + t[i][0].substring(12,15) + "-" + t[i][0].substring(16,20) + "-" + t[i][0].substring(7,9) + "/" + t[i][0].substring(9,11) + "/" + t[i][0].substring(5,7);
			o.type = t[i][2];
			o.author = t[i][3];
			o.key = t[i][4];
			document.getElementById("keys").innerHTML += '<tr><td>' + t[i][5] + '</td><td>' + t[i][0].substring(0,4) + "-" + t[i][0].substring(12,15) + "-" + t[i][0].substring(16,20) + "-" + t[i][0].substring(7,9) + "/" + t[i][0].substring(9,11) + "/" + t[i][0].substring(5,7) + '</td><td>' + t[i][2] + '</td><td>' + t[i][3] + '</td><td>' + t[i][4] + '</td></tr>';
			l.push(o);
		}
		if (t.length < 10) {
			for (var i = 0; i < 10 - t.length; i++) {
				document.getElementById("keys").innerHTML += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
			}
		}
		console.table(l);
	}

}

// Makes pressing enter work (working with an actual <form> was janky and inconsistent)
$(document).keypress(function (e) {
	if (e.which === 13) {
		getBothKeys();
	}
});
