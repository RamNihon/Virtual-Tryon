const { google } = require("googleapis");
const nodemailer = require("nodemailer");

// ─── OAuth2 Setup ──────────────────────────
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground",
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// ─── Create Transporter ────────────────────
const createTransporter = async () => {
  try {
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    console.log("❌ Transporter error:", error.message);
    throw error;
  }
};

// ─── Send Email Helper ─────────────────────
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent to:", to);
    return true;
  } catch (error) {
    console.log("❌ Email send error:", error.message);
    return false;
  }
};

// ─── 1. Welcome Email ──────────────────────
const sendWelcomeEmail = async (seller) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;
                 max-width: 600px; margin: 0 auto;
                 padding: 20px; background: #f9f9f9;">

      <div style="background: #7C3AED; padding: 30px;
                  border-radius: 16px 16px 0 0;
                  text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">
          👗 VirtualTryOn
        </h1>
      </div>

      <div style="background: white; padding: 30px;
                  border-radius: 0 0 16px 16px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

        <h2 style="color: #1f2937; margin-top: 0;">
          Welcome aboard, ${seller.name}! 🎉
        </h2>

        <p style="color: #6b7280; line-height: 1.6;">
          Your VirtualTryOn account has been 
          successfully created. You're all set to 
          give your customers an amazing shopping 
          experience!
        </p>

        <div style="background: #f5f3ff; border-radius: 12px;
                    padding: 20px; margin: 20px 0;
                    border-left: 4px solid #7C3AED;">
          <h3 style="color: #7C3AED; margin-top: 0;">
            🚀 Get Started in 3 Steps:
          </h3>
          <ol style="color: #4b5563; padding-left: 20px;
                     line-height: 1.8;">
            <li>Go to your Dashboard</li>
            <li>Upload your products</li>
            <li>Share your shop link with customers</li>
          </ol>
        </div>

        <div style="background: #ecfdf5; border-radius: 12px;
                    padding: 16px; margin: 20px 0;">
          <p style="color: #065f46; margin: 0; font-size: 14px;">
            🎁 <strong>Free Plan:</strong> 
            You have 50 free try-ons this month!
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="background: #7C3AED; color: white;
                    padding: 14px 36px; border-radius: 50px;
                    text-decoration: none; font-weight: bold;
                    font-size: 16px; display: inline-block;">
            Open Dashboard →
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px;
                   text-align: center; margin-top: 30px;
                   border-top: 1px solid #f3f4f6;
                   padding-top: 20px;">
          © 2025 VirtualTryOn · 
          Made with ❤️ for Indian Sellers
        </p>
      </div>
    </body>
    </html>
  `;
  return sendEmail(seller.email, "👗 Welcome to VirtualTryOn!", html);
};

// ─── 2. Reset Password Email ───────────────
const sendResetPasswordEmail = async (seller, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;
                 max-width: 600px; margin: 0 auto;
                 padding: 20px; background: #f9f9f9;">

      <div style="background: #7C3AED; padding: 30px;
                  border-radius: 16px 16px 0 0;
                  text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">
          👗 VirtualTryOn
        </h1>
      </div>

      <div style="background: white; padding: 30px;
                  border-radius: 0 0 16px 16px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 52px;">🔐</div>
          <h2 style="color: #1f2937;">
            Password Reset Request
          </h2>
        </div>

        <p style="color: #6b7280; line-height: 1.6;">
          Hi <strong>${seller.name}</strong>,
          <br><br>
          We received a request to reset your 
          VirtualTryOn account password. 
          Click the button below to set a new password.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background: #7C3AED; color: white;
                    padding: 14px 36px; border-radius: 50px;
                    text-decoration: none; font-weight: bold;
                    font-size: 16px; display: inline-block;">
            🔑 Reset My Password
          </a>
        </div>

        <div style="background: #fef3c7; border-radius: 12px;
                    padding: 16px; margin: 20px 0;
                    border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            ⚠️ <strong>Important:</strong> This link 
            expires in <strong>1 hour</strong>.
            <br><br>
            If you did not request a password reset, 
            please ignore this email. Your account 
            remains secure.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 13px;">
          If the button above doesn't work, 
          copy and paste this link:
          <br>
          <a href="${resetUrl}"
             style="color: #7C3AED; word-break: break-all;">
            ${resetUrl}
          </a>
        </p>

        <p style="color: #9ca3af; font-size: 12px;
                   text-align: center; margin-top: 30px;
                   border-top: 1px solid #f3f4f6;
                   padding-top: 20px;">
          © 2025 VirtualTryOn · Security Email
        </p>
      </div>
    </body>
    </html>
  `;
  return sendEmail(seller.email, "🔐 Password Reset - VirtualTryOn", html);
};

// ─── 3. Payment Success Email ──────────────
const sendPaymentSuccessEmail = async (seller, plan) => {
  const planDetails = {
    starter: {
      name: "Starter",
      limit: "500 try-ons/month",
      price: "₹1,999",
    },
    pro: {
      name: "Pro",
      limit: "Unlimited try-ons",
      price: "₹4,999",
    },
  };
  const details = planDetails[plan] || {};

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;
                 max-width: 600px; margin: 0 auto;
                 padding: 20px; background: #f9f9f9;">

      <div style="background: #7C3AED; padding: 30px;
                  border-radius: 16px 16px 0 0;
                  text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">
          👗 VirtualTryOn
        </h1>
      </div>

      <div style="background: white; padding: 30px;
                  border-radius: 0 0 16px 16px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 60px;">🎉</div>
          <h2 style="color: #1f2937;">
            Payment Successful!
          </h2>
          <p style="color: #6b7280;">
            Your plan has been upgraded successfully.
          </p>
        </div>

        <div style="background: #f5f3ff; border-radius: 12px;
                    padding: 20px; margin: 20px 0;">
          <h3 style="color: #7C3AED; margin-top: 0;">
            📋 Plan Details
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">
                Plan Name
              </td>
              <td style="padding: 10px 0; font-weight: bold;
                         color: #1f2937; text-align: right;">
                ${details.name}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">
                Try-ons
              </td>
              <td style="padding: 10px 0; font-weight: bold;
                         color: #1f2937; text-align: right;">
                ${details.limit}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">
                Amount Paid
              </td>
              <td style="padding: 10px 0; font-weight: bold;
                         color: #16a34a; text-align: right;
                         font-size: 18px;">
                ${details.price}
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="background: #7C3AED; color: white;
                    padding: 14px 36px; border-radius: 50px;
                    text-decoration: none; font-weight: bold;
                    font-size: 16px; display: inline-block;">
            Go to Dashboard →
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px;
                   text-align: center; margin-top: 30px;
                   border-top: 1px solid #f3f4f6;
                   padding-top: 20px;">
          © 2025 VirtualTryOn · Payment Receipt
        </p>
      </div>
    </body>
    </html>
  `;
  return sendEmail(seller.email, "🎉 Payment Successful - VirtualTryOn", html);
};

// ─── 4. Limit Warning Email ────────────────
const sendLimitWarningEmail = async (seller) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;
                 max-width: 600px; margin: 0 auto;
                 padding: 20px; background: #f9f9f9;">

      <div style="background: #7C3AED; padding: 30px;
                  border-radius: 16px 16px 0 0;
                  text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">
          👗 VirtualTryOn
        </h1>
      </div>

      <div style="background: white; padding: 30px;
                  border-radius: 0 0 16px 16px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 52px;">⚠️</div>
          <h2 style="color: #1f2937;">
            Try-On Limit Reached!
          </h2>
        </div>

        <p style="color: #6b7280; line-height: 1.6;">
          Hi <strong>${seller.name}</strong>,
          <br><br>
          Your monthly try-on limit has been reached. 
          Customers are currently unable to use the 
          virtual try-on feature on your shop.
        </p>

        <div style="background: #fef3c7; border-radius: 12px;
                    padding: 16px; margin: 20px 0;
                    border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; margin: 0; font-size: 15px;">
            📊 Usage: 
            <strong>
              ${seller.tryonCount}/${seller.tryonLimit}
            </strong> 
            try-ons used this month
          </p>
        </div>

        <p style="color: #6b7280; line-height: 1.6;">
          Upgrade your plan to continue offering 
          virtual try-on to your customers and 
          boost your sales!
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/pricing"
             style="background: #7C3AED; color: white;
                    padding: 14px 36px; border-radius: 50px;
                    text-decoration: none; font-weight: bold;
                    font-size: 16px; display: inline-block;">
            Upgrade Plan →
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px;
                   text-align: center; margin-top: 30px;
                   border-top: 1px solid #f3f4f6;
                   padding-top: 20px;">
          © 2025 VirtualTryOn
        </p>
      </div>
    </body>
    </html>
  `;
  return sendEmail(
    seller.email,
    "⚠️ Try-On Limit Reached - VirtualTryOn",
    html,
  );
};

// ─── 5. Login Alert Email ──────────────────
const sendLoginAlertEmail = async (seller, loginInfo) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;
                 max-width: 600px; margin: 0 auto;
                 padding: 20px; background: #f9f9f9;">

      <div style="background: #7C3AED; padding: 30px;
                  border-radius: 16px 16px 0 0;
                  text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">
          👗 VirtualTryOn
        </h1>
      </div>

      <div style="background: white; padding: 30px;
                  border-radius: 0 0 16px 16px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 52px;">🔐</div>
          <h2 style="color: #1f2937;">
            New Login Detected
          </h2>
        </div>

        <p style="color: #6b7280; line-height: 1.6;">
          Hi <strong>${seller.name}</strong>,
          <br><br>
          A new login was detected on your 
          VirtualTryOn account.
        </p>

        <div style="background: #f5f3ff; border-radius: 12px;
                    padding: 20px; margin: 20px 0;">
          <h3 style="color: #7C3AED; margin-top: 0;">
            📋 Login Details
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">
                📅 Time
              </td>
              <td style="padding: 10px 0; font-weight: bold;
                         color: #1f2937; text-align: right;">
                ${loginInfo.time}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">
                📧 Account
              </td>
              <td style="padding: 10px 0; font-weight: bold;
                         color: #1f2937; text-align: right;">
                ${seller.email}
              </td>
            </tr>
          </table>
        </div>

        <div style="background: #fef2f2; border-radius: 12px;
                    padding: 16px; margin: 20px 0;
                    border-left: 4px solid #ef4444;">
          <p style="color: #991b1b; margin: 0; font-size: 14px;">
            🚨 <strong>Was this you?</strong>
            <br><br>
            If you did NOT login, someone may have 
            access to your account. Please reset 
            your password immediately!
          </p>
        </div>

        <div style="text-align: center; margin: 24px 0;
                    display: flex; gap: 12px;
                    justify-content: center;">
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="background: #7C3AED; color: white;
                    padding: 12px 24px; border-radius: 50px;
                    text-decoration: none; font-weight: bold;
                    font-size: 14px; display: inline-block;
                    margin: 4px;">
            ✅ Yes, This Was Me
          </a>
          <a href="${process.env.FRONTEND_URL}/forgot-password"
             style="background: #ef4444; color: white;
                    padding: 12px 24px; border-radius: 50px;
                    text-decoration: none; font-weight: bold;
                    font-size: 14px; display: inline-block;
                    margin: 4px;">
            🔑 Reset Password Now
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px;
                   text-align: center; margin-top: 30px;
                   border-top: 1px solid #f3f4f6;
                   padding-top: 20px;">
          © 2025 VirtualTryOn · Security Alert
          <br>
          If you have concerns, contact us immediately.
        </p>
      </div>
    </body>
    </html>
  `;
  return sendEmail(seller.email, "🔐 New Login Alert - VirtualTryOn", html);
};

// ─── 6. Contact Form Email ─────────────────
const sendContactEmail = async (data) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;
                 max-width: 600px; margin: 0 auto;
                 padding: 20px; background: #f9f9f9;">

      <div style="background: #1f2937; padding: 24px;
                  border-radius: 16px 16px 0 0;">
        <h2 style="color: white; margin: 0;">
          📩 New Contact Form Submission
        </h2>
      </div>

      <div style="background: white; padding: 24px;
                  border-radius: 0 0 16px 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; color: #6b7280;
                       width: 120px; font-weight: bold;">
              Name:
            </td>
            <td style="padding: 12px 0; color: #1f2937;">
              ${data.name}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; color: #6b7280;
                       font-weight: bold;">
              Email:
            </td>
            <td style="padding: 12px 0; color: #1f2937;">
              <a href="mailto:${data.email}"
                 style="color: #7C3AED;">
                ${data.email}
              </a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; color: #6b7280;
                       font-weight: bold;">
              Subject:
            </td>
            <td style="padding: 12px 0; color: #1f2937;">
              ${data.subject}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #6b7280;
                       font-weight: bold; vertical-align: top;">
              Message:
            </td>
            <td style="padding: 12px 0; color: #1f2937;
                       line-height: 1.6;">
              ${data.message}
            </td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 12px;
                    background: #f9fafb; border-radius: 8px;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Reply directly to: ${data.email}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(
    process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    `📩 Contact: ${data.subject} - ${data.name}`,
    html,
  );
};

module.exports = {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendPaymentSuccessEmail,
  sendLimitWarningEmail,
  sendLoginAlertEmail,
  sendContactEmail,
};
