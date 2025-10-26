<?php
/**
 * Contact Form Handler using PHPMailer with reCAPTCHA v3
 */

$receiving_email_address = 'help@paytonhealth.com';

if (isset($_SERVER['HTTP_X_REQUESTED_WITH'])
    && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'
    && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $errors = [];
    $i_am_a = trim($_POST['i-am-a'] ?? '');
    if (empty($i_am_a)) { $errors[] = 'Please select who you are.'; }
    elseif (!in_array($i_am_a, ['provider', 'patient', 'other'])) { $errors[] = 'Invalid selection for "I am a...".'; }
    $first_name = trim($_POST['first-name'] ?? '');
    if (empty($first_name)) { $errors[] = 'First Name is required.'; }
    elseif (strlen($first_name) < 2) { $errors[] = 'First Name must be at least 2 characters long.'; }
    $last_name = trim($_POST['last-name'] ?? '');
    if (empty($last_name)) { $errors[] = 'Last Name is required.'; }
    elseif (strlen($last_name) < 2) { $errors[] = 'Last Name must be at least 2 characters long.'; }
    $email = trim($_POST['email'] ?? '');
    if (empty($email)) { $errors[] = 'Email is required.'; }
    elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) { $errors[] = 'Invalid email format provided.'; }
    $phone = trim($_POST['phone-number'] ?? '');
    if (empty($phone)) { $errors[] = 'Phone number is required.'; }
    elseif (!preg_match('/^[0-9]{10}$/', $phone)) { $errors[] = 'Phone number must be exactly 10 digits.'; }
    $message = trim($_POST['message'] ?? '');
    if (empty($message)) { $errors[] = 'Message cannot be empty.'; }
    elseif (strlen($message) < 10) { $errors[] = 'Message must be at least 10 characters long.'; }

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

        $sender_name = filter_var($first_name, FILTER_SANITIZE_STRING) . ' ' . filter_var($last_name, FILTER_SANITIZE_STRING);
        $sender_email = filter_var($email, FILTER_SANITIZE_EMAIL);
        $mail->setFrom($sender_email, $sender_name);
        $mail->addAddress($receiving_email_address);
        $mail->addReplyTo($sender_email, $sender_name);

        $mail->isHTML(true);
        $mail->Subject = "New Contact Message from PaytonHealth Website - " . $sender_name;

        $template_path = 'email_template_contact.html';
        if (file_exists($template_path)) {
            $email_template = file_get_contents($template_path);

            $user_type_display = '';
            switch ($i_am_a) {
                case 'provider': $user_type_display = 'Healthcare Provider'; break;
                case 'patient': $user_type_display = 'Patient'; break;
                case 'other': $user_type_display = 'Other'; break;
                default: $user_type_display = htmlspecialchars($i_am_a);
            }

            $email_body = str_replace(
                [ '{{i-am-a}}', '{{first-name}}', '{{last-name}}', '{{email}}', '{{phone-number}}', '{{message}}' ],
                [
                    $user_type_display,
                    htmlspecialchars($first_name),
                    htmlspecialchars($last_name),
                    htmlspecialchars($email),
                    htmlspecialchars($phone),
                    nl2br(htmlspecialchars($message))
                ],
                $email_template
            );
            $mail->Body = $email_body;

            $mail->addEmbeddedImage('../assets/images/logo/logo-white.png', 'logo', 'logo-white.png');

            $mail->AltBody = "New Contact Message:\nUser Type: " . $user_type_display . "\nName: " . $sender_name . "\nEmail: " . htmlspecialchars($email) . "\nPhone: " . htmlspecialchars($phone) . "\n\nMessage:\n" . htmlspecialchars($message);

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
