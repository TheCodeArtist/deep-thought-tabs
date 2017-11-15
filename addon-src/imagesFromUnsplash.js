
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

	/* Abort in case Unsplash returns an error */
	if (this.status != 200) {
		console.log('loadBackgroundImageFromUnsplash() returned error: ' + this.status);
		document.body.style.backgroundImage = 'none';
		document.getElementById('imgAttr').innerHTML = '';
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
		console.log('No images found! for query: ' + this.responseURL);
		document.body.style.backgroundImage = 'none';
		document.getElementById('imgAttr').innerHTML = '';
		return;
	}

	/* Choose upto 10 of the top images in the list */
	var imgSearchSet = 10;
	var randomImageIds = [];
	if (jsonObj.total < 10) {
		imgSearchSet = jsonObj.total;
	}

	/* Generate a Shuffled array of IDs
	 * - with length imgSearchSet
	 * - with values betwwen 0 and imgSearchSet-1
	 */
	for (var i = 0; i < imgSearchSet; i++) {
		randomImageIds[i] = i;
	}
	fyShuffle(randomImageIds);

	for (var i = 0; i < 3; i++) {
		/* Pick upto any 3 images */
		var imgSrc = jsonObj.results[randomImageIds[i]].urls.regular;

		/* Update the image */
		document.getElementById('img' + i).style.backgroundImage = 'url(' + imgSrc + ')';

		/* Select a "Region Of Interest" randomly */
		random = -20 + (Math.random() * 40);
		document.getElementById('img' + i).style.setProperty('--img'+i+'dX', random +'%');
		random = -20 + (Math.random() * 40);
		document.getElementById('img' + i).style.setProperty('--img'+i+'dY', random +'%');
	}

	/* Prepare unsplash attribution for each img used */
	var unsplashUTM = '?utm_source=Deep_Thoughts&utm_medium=referral&utm_campaign=api-credit'
	var uniqueImgAttrs = Math.min(3, randomImageIds.filter(onlyUnique).length);
	var individualImgAttr = '';
	
	for (var i = 0; i < uniqueImgAttrs; i++) {
		var imgLink = jsonObj.results[randomImageIds[i]].links.html;
		var imgDesc = jsonObj.results[randomImageIds[i]].description;
		var imgAuthorName = jsonObj.results[randomImageIds[i]].user.name;
		var imgAuthorLink = jsonObj.results[randomImageIds[i]].user.links.html;
		
		/* Set Image name to its description if provided, else use the backlink as Image name */
		if (imgDesc) {
			var imgName = imgDesc;
		} else {
			var imgName = imgLink.replace('https://', '');
		}

		/* Trim the "url('')" surrounding the image source URL */
		imgSrc = document.getElementById('img' + i).style.backgroundImage.slice(5, -2);
		
		individualImgAttr += '<a class="tooltip" href="' + imgLink + unsplashUTM + '" target="_blank">' + imgName + 
		'<span><img width="240px" src="' + imgSrc + '"/></span>' + '</a>' +
		' by <a href="' + imgAuthorLink + unsplashUTM + '" target="_blank">' + imgAuthorName + '<br\></a>'
	}
	
	/* Update unsplash attribution */
	document.getElementById('imgAttr').innerHTML = individualImgAttr +
		' found in search results for (' + keywords.replace(/,/g, ' / ') +') on ' +
		'<a href="https://unsplash.com' + unsplashUTM + '" target="_blank">' + 'Unsplash' + '</a>';
}