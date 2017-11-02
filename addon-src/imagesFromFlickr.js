
function loadBackgroundImageFromFlickr(keywords)
{
	/* Register at flickr app-garden to get your own free developer-key:
	 * https://www.flickr.com/services/apps/create/
	 */	
	var flickrKey = 'ad573b275cd8e6a1f080c0d22fc99843'
	
	/* Reference: https://www.flickr.com/services/api/flickr.photos.search.html */
	var flickrURL = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search' +
				'&format=json&nojsoncallback=1&api_key=' + flickrKey +
				'&license=7,9,10&safe_search=1&media=photos&sort=interestingness-desc' +
				'&per_page=50&extras=url_c&tag_mode=any&tags=' + keywords;

	/* Trigger an ASYNC request to query list of images */
	get(flickrURL, populateBackgroundImageFromFlickr);
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
	var imgLink = 'https://www.flickr.com/photos/' + jsonObj.photos.photo[randomImageId]['owner'] + '/' + jsonObj.photos.photo[randomImageId]['id'];
	var imgSrc = jsonObj.photos.photo[randomImageId]['url_c'];

	document.body.style.backgroundImage = 'url(' + imgSrc + ')';

	/* Prepare flickr attribution */
	document.getElementById('imgAttr').innerHTML = '' +
	'<a href="' + imgLink + '" target="_blank">' + imgLink.replace('https://www.', '') + '</a>' +
	' is result ' + ++randomImageId + ' in search for ' + '(' + keywords.replace(/,/g, ' / ') +')';
}
