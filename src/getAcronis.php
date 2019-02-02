<?php
header('Access-Control-Allow-Origin: *');

// Setting up cookies, required for logging in
$cookie = "/cookie/a_" . htmlspecialchars($_POST["uuid"]) . ".txt";
if (!file_exists($cookie) || !is_writable($cookie)) {
    @mkdir("/cookie", 0744);
    $myfile = fopen($cookie, "w");
    fclose($myfile);
} else {
    unlink($cookie);
    $myfile = fopen($cookie, "w");
	fclose($myfile);
}

// Progress query
$progress = "progress/a_" . htmlspecialchars($_POST["uuid"]) . ".txt";
if (!file_exists($progress) || !is_writable($progress)) {
	@mkdir("progress", 0744);
    $myfile = fopen($progress, "w");
	fwrite($myfile, "0");
    fclose($myfile);
} else {
    unlink($progress);
    $myfile = fopen($progress, "w");
	fwrite($myfile, "0");
	fclose($myfile);
}

try {
	file_put_contents($progress, "0"); // Set progress
	
	
	sleep(1); // Acronis takes the shortest time to generate keys, so I insert a harmless delays so you can watch the progress bar ;)
	
	// Setup cURL request
    $r = curl_init();
    curl_setopt($r, CURLOPT_URL, "http://oem.acronis.com/profile/login.html?target=%2Fpromo%2Fbestbuy.html");
    curl_setopt($r, CURLOPT_POST, 1);
    curl_setopt($r, CURLOPT_COOKIEJAR, $cookie);
    curl_setopt($r, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($r, CURLOPT_POSTFIELDS, $_POST["data"]);
    curl_setopt($r, CURLOPT_RETURNTRANSFER, true);
	
	file_put_contents($progress, "1"); // Set progress
	
	sleep(2); // Another harmless delay
	
	curl_exec($r); // First request, to log in
	
	// Setup a second cURL request
    unset($_POST["data"]["user"]); // We don't need these two anymore
    unset($_POST["data"]["password"]);
    curl_setopt($r, CURLOPT_POSTFIELDS, $_POST["data"]);
    curl_setopt($r, CURLOPT_URL, "http://oem.acronis.com/promo/bestbuy.html");
	file_put_contents($progress, "2");
    $p = curl_exec($r); // Second request, to get key
    $k = substr($p, strpos($p, '<b>Serial Number</b>: ') + 22, 71); // Extract key from page
	
	file_put_contents($progress, "3"); // Set progress
	
    echo $k; // Return key to client
	
}
catch (Exception $e) {
    echo "Unable to generate key";
}

curl_close($r);
unlink($progress); // Delete progress file
unlink($cookie); // Delete old cookie

?>