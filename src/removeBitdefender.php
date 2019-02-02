<?php
header('Access-Control-Allow-Origin: *');

// Setting up cookies, required for logging in
$cookie = "cookie/b_" . htmlspecialchars($_POST["uuid"]) . ".txt";
if (!file_exists($cookie) || !is_writable($cookie)) {
    @mkdir("cookie", 0744);
    $myfile = fopen($cookie, "w");
    fclose($myfile);
} else {
    unlink($cookie);
    $myfile = fopen($cookie, "w");
	fclose($myfile);
}

// Progress query
$progress = "progress/b_" . htmlspecialchars($_POST["uuid"]) . ".txt";
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

file_put_contents($progress, "0"); // Set progress

// Setup cURL request
$r = curl_init();
curl_setopt($r, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36');
curl_setopt($r, CURLOPT_AUTOREFERER, true);
curl_setopt($r, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($r, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($r, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($r, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($r, CURLOPT_COOKIEFILE, $cookie);
curl_setopt($r, CURLOPT_COOKIEJAR, $cookie);

file_put_contents($progress, "1"); // Set progress

// First request, to get token
try {
    curl_setopt($r, CURLOPT_URL, "https://pan.bitdefender.com/login");
    $p  = curl_exec($r);
    $t1 = substr($p, strpos($p, "<input type=\"hidden\" name=\"data[_Token][key]\" value=\"") + 53, 40);
    $t2 = substr($p, strpos($p, "<input type=\"hidden\" name=\"data[_Token][fields]\" value=\"") + 56, 43);
}
catch (Exception $e) {
    return "Unable to get auth token";
    curl_close($r);
}

file_put_contents($progress, "2"); // Set progress

// Setup second cURL request
try {
    $_POST["data"]["data[_Token][key]"] = $t1;
    
    $_POST["data"]['data[User][login]']  = $_POST["data1"]["login"];
    $_POST["data"]['data[User][passwd]'] = $_POST["data1"]["passwd"];
    
    $_POST["data"]['data[_Token][fields]']   = $t2;
    $_POST["data"]['data[_Token][unlocked]'] = "";
    
    curl_setopt($r, CURLOPT_URL, "https://pan.bitdefender.com/login");
    curl_setopt($r, CURLOPT_POST, 1);
    curl_setopt($r, CURLOPT_POSTFIELDS, http_build_query($_POST["data"]));
    $p = curl_exec($r); // Second request, to log in
}
catch (Exception $e) {
    return "Unable to log in";
    curl_close($r);
}

file_put_contents($progress, "3"); // Set progress

// Setup third cURL request
try {
    //curl_exec($r); // Load page again, just be sure everything is loaded
    
    unset($_POST["data"]["data[_Token][key]"]);
    unset($_POST["data"]['data[User][login]']);
    unset($_POST["data"]['data[User][passwd]']);
    unset($_POST["data"]['data[_Token][fields]']);
    unset($_POST["data"]['data[_Token][unlocked]']);
    
    $_POST["data"]["_method"]           = "POST";
    $_POST["data"]['data[_Token][key]'] = $t1;
    
    $_POST["data"]['data[InvalidateKeys][keys]']           = $_POST["data1"]["keys"];
    $_POST["data"]['data[InvalidateKeys][reason]']        = $_POST["data1"]["reason"];
    
    $_POST["data"]['data[_Token][keys]']   = $t2 . "BestBuyKeys.type";
    $_POST["data"]['data[_Token][unlocked]'] = "";
    
    curl_setopt($r, CURLOPT_URL, "https://pan.bitdefender.com/best-buy/invalidate-keys");
    curl_setopt($r, CURLOPT_POSTFIELDS, http_build_query($_POST["data"]));
    $p = curl_exec($r); // Third request, to get key
	
	file_put_contents($progress, "4"); // Set progress
	
	// Check if succeeded
	if (strpos($p, "Added") != FALSE) {
		echo "Success";
		
		/*$files = glob(".txt");
    	foreach (glob(dirname(".txt") . '/*', GLOB_ONLYDIR | GLOB_NOSORT) as $dir) {
			$ol = file_get_contents($dir);
			foreach ($ol as &$o) {
				if (json_decode($o)[1] == $_POST["data1"]["keys"]) {
					$o = json_decode($o);
					$o[3] = FALSE;
					$o = json_encode($o);				
				}
				$ol = implode("\n", $ol);
				file_put_contents($dir, $ol);
			}
    	}*/
	}
	else {
		echo "Unable to login";
	}
}
catch (Exception $e) {
    echo "Unable to generate key";
}

curl_close($r);
unlink($cookie); // Delete old cookie
unlink($progress); // Delete progress file

?>