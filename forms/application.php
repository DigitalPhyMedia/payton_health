<?php
/**
 * Application Form Handler using PHPMailer with reCAPTCHA v3
 */

$receiving_email_address = 'help@paytonhealth.com';

if (isset($_SERVER['HTTP_X_REQUESTED_WITH'])
    && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'
    && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $errors = [];
    $apply_position = trim($_POST['apply_position'] ?? '');
    if (empty($apply_position)) { $errors[] = 'Please select the position you are applying for.'; }
    $first_name = trim($_POST['first_name'] ?? '');
    if (empty($first_name)) { $errors[] = 'First Name is required.'; }
    elseif (strlen($first_name) < 2) { $errors[] = 'First Name must be at least 2 characters long.'; }
    $last_name = trim($_POST['last_name'] ?? '');
    if (empty($last_name)) { $errors[] = 'Last Name is required.'; }
    elseif (strlen($last_name) < 2) { $errors[] = 'Last Name must be at least 2 characters long.'; }
    $applicant_email = trim($_POST['email'] ?? '');
    if (empty($applicant_email)) { $errors[] = 'Email is required.'; }
    elseif (!filter_var($applicant_email, FILTER_VALIDATE_EMAIL)) { $errors[] = 'Invalid email format provided.'; }
    $applicant_phone = trim($_POST['phone'] ?? '');
    if (empty($applicant_phone)) { $errors[] = 'Phone number is required.'; }
    elseif (!preg_match('/^[0-9]{10}$/', $applicant_phone)) { $errors[] = 'Phone number must be exactly 10 digits.'; }

    if (!isset($_FILES['resume']) || $_FILES['resume']['error'] !== UPLOAD_ERR_OK) {
        $upload_errors = [
            UPLOAD_ERR_INI_SIZE   => 'The uploaded file exceeds the upload_max_filesize directive in php.ini.',
            UPLOAD_ERR_FORM_SIZE  => 'The uploaded file exceeds the MAX_FILE_SIZE directive specified in the HTML form.',
            UPLOAD_ERR_PARTIAL    => 'The uploaded file was only partially uploaded.',
            UPLOAD_ERR_NO_FILE    => 'No resume file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder on server.',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write resume file to disk.',
            UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the file upload.',
        ];
        $error_code = $_FILES['resume']['error'] ?? UPLOAD_ERR_NO_FILE;
        $errors[] = $upload_errors[$error_code] ?? 'Unknown error uploading resume.';
    } elseif ($_FILES['resume']['size'] > 5 * 1024 * 1024) {
        $errors[] = 'Resume file size exceeds the 5MB limit.';
    } else {
        $allowed_extensions = ['pdf', 'doc', 'docx'];
        $file_info = pathinfo($_FILES['resume']['name']);
        $extension = strtolower($file_info['extension'] ?? '');
        if (!in_array($extension, $allowed_extensions)) {
            $errors[] = 'Invalid resume file type. Allowed types: PDF, DOC, DOCX.';
        }
    }

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

        $applicant_name = filter_var($first_name, FILTER_SANITIZE_STRING) . ' ' . filter_var($last_name, FILTER_SANITIZE_STRING);
        $applicant_email_sanitized = filter_var($applicant_email, FILTER_SANITIZE_EMAIL);
        $mail->setFrom($applicant_email_sanitized, $applicant_name);
        $mail->addAddress($receiving_email_address);
        $mail->addReplyTo($applicant_email_sanitized, $applicant_name);

        $mail->addAttachment($_FILES['resume']['tmp_name'], $_FILES['resume']['name']);

        $mail->isHTML(true);
        $mail->Subject = $applicant_name . " - Application for " . htmlspecialchars($apply_position);

        $template_path = 'email_template_application.html';
        if (file_exists($template_path)) {
            $email_template = file_get_contents($template_path);

            $email_body = str_replace(
                [ '{{apply_position}}', '{{first_name}}', '{{last_name}}', '{{email}}', '{{phone}}' ],
                [
                    htmlspecialchars($apply_position),
                    htmlspecialchars($first_name),
                    htmlspecialchars($last_name),
                    htmlspecialchars($applicant_email),
                    htmlspecialchars($applicant_phone)
                ],
                $email_template
            );
            $mail->Body = $email_body;

            $mail->addEmbeddedImage('../assets/images/logo/logo-white.png', 'logo', 'logo-white.png');

            $mail->AltBody = "New Job Application:\nPosition: " . htmlspecialchars($apply_position) . "\nName: " . $applicant_name . "\nEmail: " . htmlspecialchars($applicant_email) . "\nPhone: " . htmlspecialchars($applicant_phone) . "\n\nResume is attached.";

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
