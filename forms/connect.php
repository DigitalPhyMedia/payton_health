<?php
/**
 * Generic Form Handler (Hero/Consultation) using PHPMailer with reCAPTCHA v3
 */

$receiving_email_address = 'help@paytonhealth.com';

if (isset($_SERVER['HTTP_X_REQUESTED_WITH'])
    && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'
    && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $errors = [];
    $name = trim($_POST['name'] ?? '');
    if (empty($name)) { $errors[] = 'Name is required.'; }
    elseif (strlen($name) < 2) { $errors[] = 'Name must be at least 2 characters long.'; }
    $email = trim($_POST['email'] ?? '');
    if (empty($email)) { $errors[] = 'Email is required.'; }
    elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) { $errors[] = 'Invalid email format provided.'; }
    $phone = trim($_POST['phone'] ?? '');
    if (empty($phone)) { $errors[] = 'Phone number is required.'; }
    elseif (!preg_match('/^[0-9]{10}$/', $phone)) { $errors[] = 'Phone number must be exactly 10 digits.'; }
    $user_type = trim($_POST['user_type'] ?? '');
    if (empty($user_type)) { $errors[] = 'Please select whether you are a Healthcare Provider or Patient.'; }
    elseif (!in_array($user_type, ['Healthcare Provider', 'Patient'])) { $errors[] = 'Invalid user type selected.'; }

    if (!empty($errors)) { die(implode('<br>', $errors)); }

    $library_path = '../assets/vendor/php-email-form/php-email-form.php';
    if (file_exists($library_path)) {
        require_once($library_path);
    } else {
        die('Internal Server Error: Unable to load email library file.');
    }

    $mail = new PHPMailer(true);

    try {
        $recaptchaSecret = '6LfsmfUrAAAAANWHU8HRTMfC0gFM8J089m11lyEW';
        if (!empty($recaptchaSecret)) {
            $recaptchaResponse = $_POST['recaptcha-response'] ?? '';
            if (empty($recaptchaResponse)) {
                 throw new Exception('Please complete the reCAPTCHA challenge.');
            }
            $verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
            $verifyData = http_build_query([
                'secret' => $recaptchaSecret,
                'response' => $recaptchaResponse,
                'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
            ]);
            $options = ['http' => ['header' => "Content-type: application/x-www-form-urlencoded\r\n", 'method' => 'POST', 'content' => $verifyData]];
            $context = stream_context_create($options);
            $response = file_get_contents($verifyURL, false, $context);
            $responseKeys = json_decode($response, true);
            if (!isset($responseKeys['success']) || !$responseKeys['success']) {
                 throw new Exception('reCAPTCHA validation failed. Please try again.');
            }
            if (isset($responseKeys['score']) && $responseKeys['score'] < 0.5) {
                 throw new Exception('Security check failed. Please try again.');
            }
        }

        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'help@paytonhealth.com';
        $mail->Password   = 'ghqfmlmhqecxkmez';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        $mail->setFrom(filter_var($email, FILTER_SANITIZE_EMAIL), filter_var($name, FILTER_SANITIZE_STRING));
        $mail->addAddress($receiving_email_address);
        $mail->addReplyTo(filter_var($email, FILTER_SANITIZE_EMAIL), filter_var($name, FILTER_SANITIZE_STRING));

        $mail->isHTML(true);
        $mail->Subject = "New PaytonHealth Website Lead/Inquiry from " . filter_var($name, FILTER_SANITIZE_STRING);

        $template_path = 'email_template_connect.html';
        if (file_exists($template_path)) {
            $email_template = file_get_contents($template_path);

            $email_body = str_replace(
                ['{{user_type}}', '{{name}}', '{{email}}', '{{phone}}'],
                [
                    htmlspecialchars($user_type),
                    htmlspecialchars($name),
                    htmlspecialchars($email),
                    htmlspecialchars($phone)
                ],
                $email_template
            );
            $mail->Body = $email_body;

            $mail->addEmbeddedImage('../assets/images/logo/logo-white.png', 'logo', 'logo-white.png');

            $mail->AltBody = "New Inquiry:\nUser Type: " . htmlspecialchars($user_type) . "\nName: " . htmlspecialchars($name) . "\nEmail: " . htmlspecialchars($email) . "\nPhone: " . htmlspecialchars($phone);

        } else {
             throw new Exception('Email template file not found.');
        }

        $mail->send();
        echo 'OK';

    } catch (Exception $e) {
        die("Mailer Error: " . htmlspecialchars($mail->ErrorInfo ?: $e->getMessage()));
    }

} else {
  die('Direct access to this script is not permitted.');
}
?>
