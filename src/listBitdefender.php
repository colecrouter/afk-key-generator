<?php
require('simple_html_dom.php');
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
    
	if ($_POST["data1"]["gcid"] == "   ") {
		curl_setopt($r, CURLOPT_URL, "https://pan.bitdefender.com/partners/BestBuy_Index/");
	} else {
		curl_setopt($r, CURLOPT_URL, "https://pan.bitdefender.com/partners/BestBuy_Index/filterBy:BestBuy.gcid/filterVal:" . $_POST["data1"]["gcid"]);
	}
	
    curl_setopt($r, CURLOPT_POSTFIELDS, "");
    $p = curl_exec($r); // Third request, search for key
	$s = strpos($p, '<table>');
    $table =  str_get_html(substr($p, $s, strpos($p, '</table>') - $s)); // Get key from page
	
	$rowData = array();

	foreach ($table->find('tr') as $row) {
		// initialize array to store the cell data from each row
		$flight = array();
		foreach ($row->find('td') as $cell) {
			// push the cell's text to the array
			$flight[] = $cell->plaintext;
		}
		$rowData[] = $flight;
	}
	
	$rowData = array_slice($rowData, 2);
    echo json_encode($rowData); // Return key to client
	
}
catch (Exception $e) {
    echo "Unable to generate key";
}

curl_close($r);
unlink($cookie); // Delete old cookie

?>