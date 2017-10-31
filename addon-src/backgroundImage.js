
function get(url, callbackFn)
{
    var httpReq = new XMLHttpRequest();

	/* Who will handle the response */
	httpReq.addEventListener("load", callbackFn);

	/* Wait upto 10s for a response */
	httpReq.timeout = 10000;

	/* ASYNC GET */
	httpReq.open("GET", url, true);
	httpReq.send(null);
}

function loadBackgroundImage(keywords)
{
	/* Immediately clear current background image */
	document.body.style.backgroundImage = "none";
	
	/* Reference: https://www.flickr.com/services/api/flickr.photos.search.html */
	flickrURL = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search' +
				'&format=json&nojsoncallback=1&api_key=ad573b275cd8e6a1f080c0d22fc99843' +
				'&license=7,9,10&safe_search=1&media=photos&sort=interestingness-desc' +
				'&per_page=50&extras=url_z&tag_mode=any&tags=' + keywords;

	/* Trigger an ASYNC request to query list of images */
	get(flickrURL, populateBackgroundImageFromFlickr);
}

function populateBackgroundImage(resultId, imgLink, imgSrc)
{
	document.getElementById('imgAttr').innerHTML = '<a href="' + imgLink + '" target="_blank">' + imgLink.replace('https://www.', '') + '</a> is result ' + resultId + ' in search for ' + keywords;
	document.body.style.backgroundImage = 'url(' + imgSrc + ')';
}

function populateBackgroundImageFromFlickr()
{
	/* Hopefully received a valid JSON response of img search query */
	response = this.responseText;
	
	/* Sometimes we may receive malformed JSON */
	try {
		var jsonObj = JSON.parse(response);
	} catch (e) {
		console.log('Incorrect JSON returned!');
		document.body.style.backgroundImage = 'none';
		document.getElementById('imgAttr').innerHTML = '';
		return;
	}

	/* If no images found... */
	if (jsonObj.photos.total == 0) {
		console.log('No images found! for query:' + flickrURL);
		document.body.style.backgroundImage = 'none';
		document.getElementById('imgAttr').innerHTML = '';
		return;
	}
	
	/* Choose one of the top 50 images in the list */
	/* The value 50 is also hardcoded in the per_page param within the request URL */
	var imgSearchSet = 50;
	if (jsonObj.photos.total < 50) {
		imgSearchSet = jsonObj.photos.total;
	}
	var randomImageId = Math.floor(Math.random() * imgSearchSet);

	/* Pick an appropriate size of the image
	 * https://www.flickr.com/services/api/misc.urls.html
	 */
	var imageLink = 'https://www.flickr.com/photos/' + jsonObj.photos.photo[randomImageId]['owner'] + '/' + jsonObj.photos.photo[randomImageId]['id'];
	var imageSource = jsonObj.photos.photo[randomImageId]['url_z'];

	populateBackgroundImage(randomImageId, imageLink, imageSource);
}
