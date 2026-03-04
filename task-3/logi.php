<?php
$message = "";

// Database connection
$conn = mysqli_connect("localhost", "root", "", "logindb");

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Check form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);

    $sql = "SELECT * FROM users WHERE email='$email' AND password='$password'";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) > 0) {
        $message = "<p class='success'>Login Successful!</p>";
    } else {
        $message = "<p class='error'>Invalid Email or Password!</p>";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login Page</title>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(to right, #4facfe, #00f2fe);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .login-box {
            background: white;
            padding: 30px;
            width: 350px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        h2 {
            text-align: center;
        }

        label {
            display: block;
            margin-top: 15px;
        }

        input {
            width: 100%;
            padding: 8px;
            margin-top: 5px;
            border-radius: 5px;
            border: 1px solid #ccc;
        }

        button {
            margin-top: 20px;
            width: 100%;
            padding: 10px;
            border: none;
            background: #4facfe;
            color: white;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }

        button:hover {
            background: #00c6ff;
        }

        .error {
            color: red;
            text-align: center;
            margin-top: 10px;
        }

        .success {
            color: green;
            text-align: center;
            margin-top: 10px;
        }

        small {
            color: red;
        }
    </style>
</head>
<body>

<div class="login-box">
    <h2>User Login</h2>

    <?php echo $message; ?>

    <form method="POST" id="loginForm">

        <label>Email</label>
        <input type="email" name="email" id="email">
        <small id="emailError"></small>

        <label>Password</label>
        <input type="password" name="password" id="password">
        <small id="passwordError"></small>

        <button type="submit">Login</button>
    </form>
</div>

<script>
document.getElementById("loginForm").addEventListener("submit", function(e){

    let valid = true;

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    document.getElementById("emailError").innerText = "";
    document.getElementById("passwordError").innerText = "";

    if(email === ""){
        document.getElementById("emailError").innerText = "Email is required";
        valid = false;
    }

    if(password === ""){
        document.getElementById("passwordError").innerText = "Password is required";
        valid = false;
    }

    if(!valid){
        e.preventDefault(); // stop form submission
    }
});
</script>

</body>
</html>