/*****************************************************************************************************************/

try {
	var domain = "http://object/";
	var objectURL = "http://object.local/";
	var rawData = getData(); // function will by added by c#
	var rawFilesList = rawData.Data.files;
	var folderPath = rawData.Data.folderPath;
	var data = group(rawData);
	var settings = data.settings;
	var categories = data.settings.categories;
	var filesList = data.filesList;
} catch {
}

/*****************************************************************************************************************/
 
function group(data) {
	var files = [];
	arr = [];
	sidebarArr = [];
	
	rawFilesList.forEach(function (item, index) {
		var obj = {};
		var folderPath = item.split("\\").slice(0,-1);
		obj["filePath"] = item;
		obj["folderPath"] = folderPath;
		files.push(obj);	
	});
	
	result = groupBy(files, "folderPath", "filePath");

	var resultV = Object.values(result);
	var resultK = Object.keys(result);
	
	resultV.forEach(function (item, index) {
		var obj = {};
		var sideBarOBJ = {};

		for (let i = 0; i < item.length; i++) {
			var fileNameWithoutExtension = (item[i].replace(/^.*[\\\/]/, '')).split('.').slice(0, -1).join('.');
			var fileExtension = item[i].split('.').pop();	
			// build sidebar

			if (fileExtension == "svg" && fileNameWithoutExtension == "icon" ) {
				sideBarOBJ["sidebarCategoryName"] = (item[i].match(/(.*)[\/\\]/)[1]||'').split(/(\\|\/)/g).pop();
				sideBarOBJ["sidebarPath"] = fixURL(objectURL+item[i]);
				sideBarOBJ["sidebarCategoryDescription"] = readFile(sideBarOBJ["sidebarPath"].replace("icon.svg", "description.txt"));
				sideBarOBJ["sidebarFolderPath"] = fixPath(folderPath + item[i].match(/(.*)[\/\\]/)[1]||'');
				sidebarArr.push(sideBarOBJ);
			}
		}
		
		var filePath = String(item[0]);
		
		// build files list
		obj["fileName"] = filePath.split("\\").slice(0,-1).join("\\").split(/(\\|\/)/g).pop();
		obj["filePaths"] = item.flatMap(el => (!el.includes("cover.") && !el.includes("icon.")) ? fixPath(folderPath + el) : []);
		obj["fileExtensions"] = item.map(el => el.split('.').pop())
		obj["fileCategory"] = filePath.split("\\")[0];
		obj["fileCategorySlug"] = getSlug(obj["fileCategory"]);
		obj["fileSubCategories"] = filePath.split('\\').slice(0, -2);
		obj["fileSubCategoriesSlugs"] = obj["fileSubCategories"].map(el => getSlug(el));

		// fileImgCover
		var fileImgCover = (item.map(el => getCover(el,"jpg",objectURL))).filter(Boolean);
		if (fileImgCover !== null)
			obj["fileImgCover"] = fileImgCover[0];

		// fileSvgCover
		var fileSvgCover = (item.map(el => getCover(el,"svg",objectURL))).filter(Boolean);
		if (fileSvgCover !== null)
			obj["fileSvgCover"] = fileSvgCover[0];

		// fileGlbCover
		var fileGlbCover = (item.map(el => getCover(el,"glb",objectURL))).filter(Boolean);
		if (fileGlbCover !== null)
			obj["fileGlbCover"] = fileGlbCover[0];

		// fileMp4Cover
		var fileMp4Cover = (item.map(el => getCover(el,"mp4",objectURL))).filter(Boolean);
		if (fileMp4Cover !== null)
			obj["fileMp4Cover"] = fileMp4Cover[0];

		arr.push(obj);
	});
	
	result = {settings:{folderPath:folderPath,categories:sidebarArr}, filesList:arr};

	return result;
}

/*****************************************************************************************************************/

function groupBy(arr, mainKey, singleKey) {   
	result = arr.reduce(function (r, a) {
		var item = a[singleKey];
		r[a[mainKey]] = r[a[mainKey]] || [];
		r[a[mainKey]].push(item);
		return r;
	}, Object.create(null));
	
	return result;
}

/*****************************************************************************************************************/

function fixURL(str) {
	str = str.replaceAll("\\","/");
	return str;
}

/*****************************************************************************************************************/

function fixPath(str) {
	str = str.replaceAll("\\","\\\\");
	return str;
}

/*****************************************************************************************************************/

function getCover(el,fileFormat,objectURL) {

	var file_name = el.replace(/\\$/,'').split('\\').pop();
	var file_extension = el.substr(el.lastIndexOf('.') + 1);

	if ((file_name.includes("cover")) && file_extension == fileFormat) {
		return fixURL(objectURL+el);
	} else if (file_extension == fileFormat) {
		return fixURL(objectURL+el);
	} else {
		return null;
	}
}

/*****************************************************************************************************************/

function sendMessage(title,content) {
	var obj = new Object();
	obj.title = title;
	obj.content = content;
	var jsonString = JSON.stringify(obj);
	chrome.webview.postMessage(jsonString);
}

/*****************************************************************************************************************/

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

/*****************************************************************************************************************/

function hideElement(elementId, delay) {
	var el = document.getElementById(elementId);
	el.style.opacity = "0";

	setTimeout(function() {
		el.style.visibility = "hidden";
	}, delay);
}

/*****************************************************************************************************************/

function showElement(elementId, delay) {
	
	var el = document.getElementById(elementId);
	el.style.transition = ".4s";

	setTimeout(function() {
		el.style.opacity = "1";
		el.style.visibility = "visible";
	}, delay);
}

/*****************************************************************************************************************/

async function doRequest() {

	let url = new URL('http://httpbin.org/get');
	let params = {'name': 'John Doe', 'occupation': 'John Doe'};
	url.search = new URLSearchParams(params);

	let res = await fetch(url);

	if (res.ok) {
		let json = await res.json();
		return json;
	} else {
		return `HTTP error: ${res.status}`;
	}
}

doRequest().then(data => {
	console.log(data);
});

/*****************************************************************************************************************/

function closeWindow() {	
	sendMessage("close","");
}

function minimizeWindow() {	
	sendMessage("minimize","");
}

/*****************************************************************************************************************/

function renderSidebar() {
	
	let html = '';
	
	html +=`
	  <div class='button' id='button' onclick='closeWindow();'><img class="close" id='button' src="${domain}kernel/img/close.svg"></div>
	  <div class='button' id='button' onclick='sendMessage("reload","");'><img class="logo" id='button' src="${domain}kernel/img/logo.svg"></div>
	  <div class='button' id='button' onclick='sendMessage("selectFolder","");'><img id='button' src="${domain}kernel/img/selectFolder.svg"></div>
	  <div class='button' id='button' onclick='renderPage("");'><img id='button' src="${domain}kernel/img/library.svg"></div>
	`;
	
	try {
		if (categories.length > 0) {
			html +=`<div class="separator"></div>`;
			html +=`<div title="Home" class='button' id='button' onclick='renderPage("");'><img id='button' src="${domain}kernel/img/home.svg"></div>`;
			for (let i of categories) {
				html +=`<div title="${i.sidebarCategoryName}" class='button' id='button' onclick='renderPage(${JSON.stringify(i)});'><img id='button' src="${i.sidebarPath}"></div>`;
			}
		}
	} catch {
	}
	
	html +=`<div class="separator"></div>`;
	html +=`<div title="info" class='button' id='button' onclick='renderMarkDown("http://object.c/Users/Osama/Documents/test.txt");'><img id='button' src="${domain}kernel/img/info.svg"></div>`;

	if (html != "") {
		document.getElementById('sidebar').innerHTML = html;
	}
}

/*****************************************************************************************************************/

async function renderPage(filter) {
	
	var header = document.getElementById('header');
	let html = '';
	
	if (filter) {
		for (let i of filesList) {
			if (i.fileSubCategories.length && Object.values(i.fileSubCategories).includes(filter.sidebarCategoryName)) {
				try {
					html += build(i);
				} catch {
					console.log("error");
				}
			}
		}
	} else {
		filesList = shuffle(filesList);
		for (let i of filesList) {
			if ((i.filePaths).length > 0) {
				try {
					html += build(i);
				} catch {
					console.log("error");
				}
			}
		}
	}

	if (filter.sidebarCategoryName)
		header.innerHTML = `<div class="title" id="title">` + `<img class='sidebarIcon' src="${filter.sidebarPath}">` + filter.sidebarCategoryName +`</div>`;
	else
		header.innerHTML = `<div class="title" id="title">` + `<img class='sidebarIcon' src="${domain}kernel/img/home.svg">` + "Home" +`</div>`;
	
	if (filter.sidebarCategoryDescription)
		header.innerHTML += `<div class="description" id="description">` + filter.sidebarCategoryDescription + `</div>`;

	if (html != "") {
		renderSearch();
		content.innerHTML = `<div class="items" id="items" data-grid="">` + html  + `</div>`;
	} else {
		html = `<div class='message'>😕 No assets found!</div>`;
		content.innerHTML = html;
	}
	
	resize(true, false);
	page.classList.add("loaded");
}

/*****************************************************************************************************************/

function renderSearch() {
	
	let html = '';
	html +=`
	<div class="search-container" id="search-container">
	  <div class="search" id="search">
		<input type="text" id="search-bar" onkeyup="searchFunction();" placeholder="Search" spellcheck="false">
		<img class="search-icon" height="1rem" src="${domain}kernel/img/search-icon.svg">
	  </div>
	</div>
	`;
	
	header.innerHTML += html;
}

/*****************************************************************************************************************/

function renderFooter() {
	
	let html = '';
	html +=`<div class="footer" id="footer">&copy; object.to</div>`;
	
	page.innerHTML += html;
}

/*****************************************************************************************************************/

function renderMarkDown(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
				content.innerHTML = `<div class='article'>` + marked.parse(rawFile.responseText) + `</div>`;
            }
        }
    }
	page.classList.add("loaded");
    rawFile.send(null);
}

/*****************************************************************************************************************/

function readFile(file) {
	try {
		var rawFile = new XMLHttpRequest();
		var allText = ""; // var declared in readTextFile scope
		rawFile.open("GET", file, false);
		rawFile.onreadystatechange = function () {
			if(rawFile.readyState === 4) {
				if(rawFile.status === 200 || rawFile.status == 0) {
					allText = rawFile.responseText;
				}
			}
		}
		rawFile.send(null);
		return allText;
	} catch {
		return allText;
	}
}

/*****************************************************************************************************************/

function build(i) {
	let html = '';
		html +=`<main class="item" data-filter="${i.fileCategorySlug} ${i.fileExtensions.join(' ')}">`
					html +=`<div class="entry-script">`;
								html +=`<div class="entry-title">`;
												if (i.fileGlbCover) {
													html +=`		<model-viewer
																		src="${i.fileGlbCover}"
																		camera-controls
																		shadow-intensity="1"
																		disable-tap auto-rotate
																		interaction-prompt="none"
																		disable-zoom
																		loading="lazy"
																		onload="loadImage(this)"
																		style="background-color: #efefef;"
																	</model-viewer>
													`;
												}
												if (i.fileImgCover && !i.fileGlbCover) {
													html +=`
																	<img class="entry-cover" draggable="false" src="${i.fileImgCover}" loading="lazy" onload="loadImage(this)">
													`;
												}
												if (i.fileSvgCover && !i.fileGlbCover && !i.fileImgCover) {
													html +=`
																	<img class="entry-cover" draggable="false" src="${i.fileSvgCover}" loading="lazy" onload="loadImage(this)">
													`;
													}
												if (i.fileMp4Cover && !i.fileSvgCover && !i.fileGlbCover && !i.fileImgCover) {
													html +=`
																	<video autoplay muted loop>
																	  <source src="${i.fileMp4Cover}" type="video/mp4" loading="lazy" onload="loadImage(this)">
																	</video>
													`;
												}
												if (!i.fileImgCover && !i.fileGlbCover && !i.fileSvgCover && !i.fileMp4Cover) {
													html +=`
																	<img class="entry-cover" draggable="false" src="${domain}kernel/img/emptyCover.jpg" loading="lazy" onload="loadImage(this)">
													`;
												}
								html +=`</div>`;
									
								html +=`<div class="entry-meta">`;
											html +=`<div class="entry-name">${i.fileName}</div>`;
											html +=`<div class="entry-description">${i.fileSubCategories.join(' > ')}</div>`;

											html +=`<div class="drag-items">`;
											if ((i.filePaths).length > 0) {
												for (const [key, value] of Object.entries(i.filePaths)) {
														html +=`
															<div class="drag-item" onmousedown="sendMessage('drag', '${value}')">${value.split('.').pop()}<span class="tooltiptext">${value.replace(/^.*[\\\/]/, '')}</span></div>
														`;
												}
											}
											html +=`</div>`;

								html +=`</div>`;
					html +=`</div>`;
		html +=`</main>`;

		return html;
}

/*****************************************************************************************************************/

function loadImage(el) {
	setTimeout(function() {
		el.parentElement.parentElement.parentElement.classList.add("loaded");
	}, 200);
	resize(false, true);
}

/*****************************************************************************************************************/

function resize(resize, pack) {
	const sizes = [
		{ columns: 1, gutter: 25 },
		{ mq: "650px", columns: 2, gutter: 25 },
		{ mq: "920px", columns: 3, gutter: 25 },
		{ mq: "1190px", columns: 4, gutter: 25 },
		{ mq: "1460px", columns: 5, gutter: 25 },
		{ mq: "1730px", columns: 6, gutter: 25 },
		{ mq: "2000px", columns: 7, gutter: 25 },
		{ mq: "2270px", columns: 7, gutter: 25 }
	];

	// create an instance
	const instance = Bricks({
		container: ".items",
		packed: "data-packed",
		sizes: sizes,
		position: true
	});

	// pack ALL grid items
	/*
	instance
		.on("pack", () => console.log("ALL grid items packed."))
		.on("update", () => console.log("NEW grid items packed."))
		.on("resize", (size) =>
			console.log("The grid has be re-packed to accommodate a new BREAKPOINT.")
		);

	*/
	
	if (resize)
		instance.resize(true); // bind resize handler
	if (pack)
		instance.pack(); // pack initial items
}

/*****************************************************************************************************************/

function debounce(callback, wait) {
  let timeout;
  return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(function () { callback.apply(this, args); }, wait);
  };
}

/*****************************************************************************************************************/

function searchFunction() {	
	window.addEventListener('keyup', debounce( () => {
		var input, filter, ul, li, a, i, txtValue;
		input = document.getElementById("search-bar");
		filter = input.value.toUpperCase();
		ul = document.getElementById("items");
		li = ul.getElementsByTagName("main");	
		for (i = 0; i < li.length; i++) {
			a = li[i];
			txtValue = a.textContent || a.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				a.style.display = "";
			} else {
				a.style.display = "none";
			}
		}
		resize(false, true);
		document.getElementsByClassName("hidden").length;
	}, 200))
}

/*****************************************************************************************************************/

window.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('mousedown', evt => {
        const { target } = evt;
		if (target.getAttribute('draggable') == "true") {
			chrome.webview.hostObjects.sync.eventForwarder.MouseDownDrag();
			evt.preventDefault();
			evt.stopPropagation();
		}
    });
});

/*****************************************************************************************************************/

window.addEventListener('DOMContentLoaded', () => {
	showElement("loader", 0);
	document.onreadystatechange = function () {
		if (document.readyState == "complete") {
			hideElement("loader", 0);
			showElement("container", 500);
			resize(true, true);
		}
	}
});
