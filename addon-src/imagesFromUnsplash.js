
function loadBackgroundImageFromUnsplash(keywords)
{
	/* Register your unsplash app here for a free, non-rate-limited developer-key:
	 * https://unsplash.com/documentation#registering-your-application
	 */
	var unsplashKey = 'e4b98f9bf1b0de6148f3ba71010226336fdb5acf93b25b42671ad7dc5660a149';

	/* Reference: https://unsplash.com/documentation#search-photos */
	var unsplashUrl = 'https://api.unsplash.com/search/photos?client_id=' + unsplashKey + '&page=1&query=' + keywords;
	
	/* Trigger an ASYNC request to query list of images */
	get(unsplashUrl, populateBackgroundImageFromUnsplash);
}

/* Function triggerred upon expiry of "back-off from rate-limit" period */
function stopRateLimitingUnsplash()
{
	loadBackgroundImage.atUnsplashRateLimit = 0;
}

function populateBackgroundImageFromUnsplash()
{
	/* Obtain remaining queries as per rate-limit */
	var unsplashQueriesRemaining = this.getResponseHeader("x-ratelimit-remaining");
	
	if (unsplashQueriesRemaining == 0) {
		/* We have hit the unsplash hourly rate-limit.
		 * Set temporary backoff flasg for subsequent requests and fallback to flickr.
		 */
		loadBackgroundImage.atUnsplashRateLimit = 1;
		
		/* Backoff from unsplash for 5 to 15 minutes */
		var backoffDelay = (300000 + Math.floor(Math.random() * 300000));
		setTimeout(stopRateLimitingUnsplash, backoffDelay);
				
		loadBackgroundImageFromFlickr(keywords);
		return;
	}
	
	/* Hopefully received a valid JSON response of img search query */
	var response = this.responseText;
	
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