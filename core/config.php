<?php
date_default_timezone_set("Asia/Bangkok");
$servername = "localhost";
$username = "root";
$password = "";
$database = "katf6786_adminbot";

$con = mysqli_connect($servername, $username, $password,$database);

// Check connection
if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  exit;
  }


?>
