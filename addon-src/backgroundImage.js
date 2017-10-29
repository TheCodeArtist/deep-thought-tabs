
function get(url)
{
    var httpReq = new XMLHttpRequest();
    httpReq.open("GET", url, false);
	httpReq.send(null);
    return httpReq.responseText;
}

function loadBackgroundImage(keywords)
{
	/* Reference: https://www.flickr.com/services/feeds/docs/photos_public/ */
	flickrURL = 'https://api.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=1&tagmode=all&tags=,' + keywords
	var response = get(flickrURL);

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
	if (jsonObj.items.length == 0) {
		console.log('No images found!');
		document.body.style.backgroundImage = 'none';
		document.getElementById('imgAttr').innerHTML = '';
		return;
	}
	
	/* Choose one of the images in the list */
	var randomImageId = Math.floor(Math.random() * jsonObj.items.length);
		
	/* Pick an appropriate size of the image
	 * https://www.flickr.com/services/api/misc.urls.html
	 */
	var imageLink = jsonObj.items[randomImageId]['link'];
	var imageSrc = jsonObj.items[randomImageId]['media']['m'].replace("_m", "_z");
	document.getElementById('imgAttr').innerHTML = '<a href="' + imageLink + '" target="_blank">' + imageLink.replace('https://www.', '') + '</a>';
	document.body.style.backgroundImage = 'url(' + imageSrc + ')';	
}