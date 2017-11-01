
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
	/* Register your unsplash app here for a free, non-rate-limited developer-key:
	 * https://unsplash.com/documentation#registering-your-application
	 */
	var unsplashKey = 'e4b98f9bf1b0de6148f3ba71010226336fdb5acf93b25b42671ad7dc5660a149';

	/* Register at flickr app-garden to get your own free developer-key:
	 * https://www.flickr.com/services/apps/create/
	 */	
	var flickrKey = 'ad573b275cd8e6a1f080c0d22fc99843'
	
	/* Immediately clear current background image before continuing */
	document.body.style.backgroundImage = "none";

	
	/* Reference: https://www.flickr.com/services/api/flickr.photos.search.html */
	var flickrURL = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search' +
				'&format=json&nojsoncallback=1&api_key=' + flickrKey +
				'&license=7,9,10&safe_search=1&media=photos&sort=interestingness-desc' +
				'&per_page=50&extras=url_c&tag_mode=any&tags=' + keywords;

	/* Trigger an ASYNC request to query list of images */
	get(flickrURL, populateBackgroundImageFromFlickr);

// Do NOT switch to unsplash just yet ;-)
//	
//	/* Reference: https://unsplash.com/documentation#search-photos */
//	var unsplashUrl = 'https://api.unsplash.com/search/photos?client_id=' + unsplashKey + '&page=1&query=' + keywords;
//	
//	/* Trigger an ASYNC request to query list of images */
//	get(unsplashUrl, populateBackgroundImageFromUnsplash);

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

function populateBackgroundImageFromUnsplash()
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
	if (jsonObj.total == 0) {
		console.log('No images found! for query:' + unsplashURL);
		document.body.style.backgroundImage = 'none';
		document.getElementById('imgAttr').innerHTML = '';
		return;
	}

	/* Choose one of the top 10 images in the list */
	var imgSearchSet = 10;
	if (jsonObj.total < 10) {
		imgSearchSet = jsonObj.total;
	}
	var randomImageId = Math.floor(Math.random() * imgSearchSet);

	/* Pick an appropriate size of the image
	 * https://www.flickr.com/services/api/misc.urls.html
	 */
	var imgLink = jsonObj.results[randomImageId].links.html;
	var imgSrc = jsonObj.results[randomImageId].urls.regular;
	var imgDesc = jsonObj.results[randomImageId].description;
	var imgAuthorName = jsonObj.results[randomImageId].user.name;
	var imgAuthorLink = jsonObj.results[randomImageId].user.links.html;
	var unsplashUTM = '?utm_source=Deep_Thoughts&utm_medium=referral&utm_campaign=api-credit'

	document.body.style.backgroundImage = 'url(' + imgSrc + ')';

	/* Set Image name to its description if provided, else use the backlink */
	if (imgDesc) {
		var imgName = imgDesc;
	} else {
		var imgName = imgLink.replace('https://', '');
	}

	/* Prepare unsplash attribution */
	document.getElementById('imgAttr').innerHTML = '' +
	'<a href="' + imgLink + unsplashUTM + '" target="_blank">' + imgName + '</a>' +
	' by <a href="' + imgAuthorLink + unsplashUTM + '" target="_blank">' + imgAuthorName + '</a>' + ' / ' +
	'<a href="https://unsplash.com' + unsplashUTM + '" target="_blank">' + 'Unsplash' + '</a>' +
	' is result ' + ++randomImageId + ' in search for (' + keywords.replace(/,/g, ' / ') +')';
}