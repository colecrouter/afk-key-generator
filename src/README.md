# How it works
There's a lot of stuff in here, so I'll try to summarize it in the briefest way possible.

## Page loading
Done by `loadPage()` in `index.js`. Sends an Ajax request to grab the content of the other HTML files. Done to minimize reloading and make the page look pretty.

## Key generation
Done by `getBitdefenderKey()` and `getAcronisKey()` in `index.js`. Formats all information into how it needs to be interpreted by the websites. Then, the information is sent via an Ajax request to the server hosting the page (refer to `getBitdefender.php` and `getAcronis.php`). The server creates an HTTP request to the corresponding sites, emulates logging in and generates the key. The page is filtered for the key, then the key is sent back to the browser.

## Key invalidation
Done by `removeBitdefenderKey()` and `removeAcronisKey()` in `index.js`. Works almost identically to key generation, but the URLs and variables are changed to invalidate the keys instead.

## Key searching
Done by `listBitdefenderKey()` in `index.js`. Works the same as the last two, just with slightly different URLs and variables. At the end however, the server parses the information from HTML into a JSON object. It is passed back to the browser, and updated on the page by `createTable()` in `index.js`

## Progress callbacks
Done by `getBDProgress()` and `getAProgress()` in `index.js`. When a key is being generated or invalidated, a UUID is generated. That UUID is then used to store the cookies and progress of each individual request (multiple could be handled at once). Throughout the process of generating or invalidating a key, the server will put a number into a text file in `/progress` that will indicate how far into the process it is. The browser then repeatedly requests for that file (with the UUID in the name), and sets the progress bar according to the number being read. I know this is a really bad way of doing it, but it was the only way I could make work without rewriting the front-end and back-end.

### Anything else
If there's anything else that's not clear, make an issue, and I'll try to add it in here.
