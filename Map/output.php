<?php
	if(isset($_POST["SMap"])){
		$WMap = fopen("./map2.json", "w");
		if( fwrite($WMap,$_POST["SMap"]) ){
			echo "OK";
		}
		else{
			echo "書き込めません。";
		}
	}
	else{
		echo "NG";
	}
?>