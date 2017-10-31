
function get(url)
{
    var httpReq = new XMLHttpRequest();
	httpReq.addEventListener("load", populateBackgroundImage);
	httpReq.timeout = 10000;
	httpReq.open("GET", url, true);
	httpReq.send(null);
}

function loadBackgroundImage(keywords)
{
	/* Reference: https://www.flickr.com/services/api/flickr.photos.search.html */
	flickrURL = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search' +
				'&format=json&nojsoncallback=1&api_key=ad573b275cd8e6a1f080c0d22fc99843' +
				'&license=7,9,10&safe_search=1&media=photos&sort=interestingness-desc' +
				'&per_page=50&extras=url_z&tag_mode=any&tags=' + keywords;
	get(flickrURL);
}

function populateBackgroundImage()
{
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
		console.log('No images found!');
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
	var imageSrc = jsonObj.photos.photo[randomImageId]['url_z'];
	document.getElementById('imgAttr').innerHTML = '<a href="' + imageLink + '" target="_blank">' + imageLink.replace('https://www.', '') + '</a> is result ' + randomImageId + ' in search for ' + keywords;
	document.body.style.backgroundImage = 'url(' + imageSrc + ')';	
}