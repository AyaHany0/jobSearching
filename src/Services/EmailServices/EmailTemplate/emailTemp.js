export const emailTemp=({content , code , expires})=>{
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> JobSearch</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; background-color: #2563eb; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to JobSearch</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                                Hello there,
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                               ${content}
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 30px 0; text-align: center;">
                                <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">Your code is:</p>
                                <p style="color: #1e293b; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">
                                    ${code}
                                </p>
                                <p style="color: #64748b; font-size: 12px; margin: 10px 0 0 0;">
                                    This code will expire in ${expires}
                                </p>
                            </div>

                            <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                                If you didn't create an account with JobSearch, please ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
                            <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0; text-align: center;">
                                Need help? Contact our support team at
                                <a href="mailto:support@jobsearch.com" style="color: #2563eb; text-decoration: none;">support@jobsearch.com</a>
                            </p>
                            <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                © 2025 JobSearch. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Unsubscribe Footer -->
                <table cellpadding="0" cellspacing="0" border="0" width="600">
                    <tr>
                        <td style="padding: 20px 0; text-align: center;">
                            <p style="color: #64748b; font-size: 12px; margin: 0;">
                                You received this email because you signed up for JobSearch.
                                <br>
                              
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}