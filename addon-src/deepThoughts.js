
/* Shuffle the array on quotes once at launch */
fyShuffle(quotes);

/* Populate an initial quote */
newQuote();

/* Allow user to generate new quotes */
document.getElementById("getQuoteBtn").addEventListener("click", newQuote);

/* Can use this to avoid warnings about - "Unsafe assignment to innerHTML" */
function escapeHTML(str) {
	escapeHTML.replacements = { "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" };
	return str.replace(/[&"'<>]/g, (m) => escapeHTML.replacements[m]);
}

/* Fisher-Yates Shuffle algorithm
 * Reference: https://stackoverflow.com/a/18806417/319204
 */
function fyShuffle(array) {
    var i = array.length,
        j = 0,
        temp;

    while (i--) {
        j = Math.floor(Math.random() * (i+1));

        /* swap randomly chosen element with current element */
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

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
	/* Check and Initialise rateLimit detected flag */
    if ( typeof loadBackgroundImage.atUnsplashRateLimit == 'undefined' ) {
        var atUnsplashRateLimit = 0;
    }
	
	/* Immediately clear current background image before continuing */
	document.body.style.backgroundImage = "none";
	
	/* ...and immediately clear the background image attribution as well */
	document.getElementById('imgAttr').innerHTML = '';
	
	/* TODO: Add logic to choose image source here.
	 * For now prefer unsplash over flickr
	 * unless recently rate-limited by unsplash.
	 */

	if (loadBackgroundImage.atUnsplashRateLimit == 1) {
		/* If temporarily backing-off unsplash, directly use flickr */
		loadBackgroundImageFromFlickr(keywords);
	} else {
		/* Try unsplash. If response received is failure,
		 * then async response handler will initiate fallback to flickr.
		 */
		loadBackgroundImageFromUnsplash(keywords);
	}
}

/* Returns a random quote with random font */
function newQuote() {

	/* Hide the button first */
	document.getElementById("getQuoteBtn").style.opacity = 0;
	
	/* Also hide the image attribution text */
	document.getElementById('imgAttr').style.opacity = 0;
	
	/* Next hide the quote text */
	document.getElementById('quoteText').style.opacity = 0;

	/* Check and Initialise the quote pointer */
    if ( typeof newQuote.quoteId == 'undefined' ) {
        newQuote.quoteId = -1;
    }
	
	/* Pick the next quote from the shuffled list of quotes */
	newQuote.quoteId++;
	
	/* If hit the end, re-shuffle array of quotes and repeat at the beginning */
	if (newQuote.quoteId >= quotes.length) {
		fyShuffle(quotes);
		newQuote.quoteId = 0;
	}
	
	/* Do NOT show the new quote yet */
	
	/* Update quoteText font-family randomly */
	var randomFontFamily = Math.floor(Math.random() * 7);
	var supportedFonts = [ "Arima Madurai", "Farsan", "Gruppo", "Special Elite", "Love Ya Like A Sister", "Miriam Libre"];
	document.getElementById("quoteText").style.fontFamily = supportedFonts[randomFontFamily]

	/* Update a quoteText font-size randomly */
	var randomFontSize = Math.floor(Math.random() * 12);
	document.getElementById("quoteText").style.fontSize = (20 + randomFontSize) + 'px';

	/* Split the quote into an array of individual words
	 *
	 * Note: Define any characters/words to ignore as a separator.
	 */
	var separators = ['-', ' ', '"', '\'',  '+', '(', ')', '*', ':', ';', '?', '.', ',', '<', '>', '&', '!',];
	var wordsArray = quotes[newQuote.quoteId].toLowerCase().split(new RegExp('(quot)|[' + separators.join('') + ']', 'g'));

	/* Sort the array in order of decreasing word-length */
	var wordsArray = wordsArray.sort(function(a, b) { 
		return b.length - a.length;
	});

	/* Pick the 3 longest words in the quote */
	keywords = wordsArray[0] + ',' + wordsArray[1] + ',' + wordsArray[2];
		
	/* Attempt to fetch a relevant backgroundimage, and update it if found */
	loadBackgroundImage(keywords)

	/* Show the image attribution */
	document.getElementById('imgAttr').style.opacity = 1.0;
	
	/* Finally show the new quote */
	document.getElementById('quoteText').innerHTML = quotes[newQuote.quoteId] + '<br />' + '<br />';
	document.getElementById('quoteText').style.opacity = 1.0;
	
	/* and Finally show the button */
	document.getElementById("getQuoteBtn").style.opacity = 1.0;

}