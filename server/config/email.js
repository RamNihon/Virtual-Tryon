const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Welcome Email ────────────────────────
const sendWelcomeEmail = async (seller) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: seller.email,
      subject: "👗 Welcome to VirtualTryOn!",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; 
                     max-width: 600px; margin: 0 auto;
                     padding: 20px; background: #f9f9f9;">
          
          <div style="background: #7C3AED; 
                      padding: 30px; 
                      border-radius: 16px 16px 0 0;
                      text-align: center;">
            <h1 style="color: white; margin: 0;">
              👗 VirtualTryOn
            </h1>
          </div>

          <div style="background: white; 
                      padding: 30px;
                      border-radius: 0 0 16px 16px;">
            
            <h2 style="color: #1f2937;">
              Welcome, ${seller.name}! 🎉
            </h2>
            
            <p style="color: #6b7280;">
              Your account has been successfully created! 
              Now you can set up your shop
            </p>

            <div style="background: #f5f3ff;
                        border-radius: 12px;
                        padding: 20px; margin: 20px 0;">
              <h3 style="color: #7C3AED; margin-top: 0;">
                🚀 Steps to start:
              </h3>
              <ol style="color: #4b5563; 
                         padding-left: 20px;">
                <li style="margin-bottom: 8px;">
                  Login to Dashboard
                </li>
                <li style="margin-bottom: 8px;">
                  Upload products
                </li>
                <li style="margin-bottom: 8px;">
                  Add whatsapp number
                </li>
                <li style="margin-bottom: 8px;">
                  Shop your shop URL with your customers
                </li>
              </ol>
            </div>

            <div style="text-align: center; 
                        margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard"
                 style="background: #7C3AED;
                        color: white;
                        padding: 14px 32px;
                        border-radius: 50px;
                        text-decoration: none;
                        font-weight: bold;
                        font-size: 16px;">
                Dashboard Kholo →
              </a>
            </div>

            <div style="background: #f0fdf4;
                        border-radius: 12px;
                        padding: 16px;
                        margin-top: 20px;">
              <p style="color: #16a34a; 
                         margin: 0; font-size: 14px;">
                🎁 Free Plan: 50 try-ons/month
                <br>
                Upgrade and get more try-ons!
              </p>
            </div>

            <p style="color: #9ca3af; 
                       font-size: 12px;
                       margin-top: 30px;
                       text-align: center;">
              © 2025 VirtualTryOn | 
              Made with ❤️ for Indian Sellers
            </p>
          </div>

        </body>
        </html>
      `,
    });
    console.log("✅ Welcome email sent!");
  } catch (error) {
    console.log("❌ Email error:", error.message);
  }
};

// ─── Payment Success Email ─────────────────
const sendPaymentSuccessEmail = async (seller, plan) => {
  const planDetails = {
    starter: { name: "Starter", limit: "500", price: "₹1,999" },
    pro: { name: "Pro", limit: "Unlimited", price: "₹4,999" },
  };

  const details = planDetails[plan] || {};

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: seller.email,
      subject: "🎉 Payment Successful - Plan Upgraded!",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;
                     max-width: 600px; margin: 0 auto;
                     padding: 20px; background: #f9f9f9;">

          <div style="background: #7C3AED;
                      padding: 30px;
                      border-radius: 16px 16px 0 0;
                      text-align: center;">
            <h1 style="color: white; margin: 0;">
              👗 VirtualTryOn
            </h1>
          </div>

          <div style="background: white;
                      padding: 30px;
                      border-radius: 0 0 16px 16px;">

            <div style="text-align: center; 
                        margin-bottom: 24px;">
              <div style="font-size: 60px;">🎉</div>
              <h2 style="color: #1f2937;">
                Payment Successful!
              </h2>
            </div>

            <div style="background: #f5f3ff;
                        border-radius: 12px;
                        padding: 20px; margin: 20px 0;">
              <h3 style="color: #7C3AED; margin-top: 0;">
                📋 Plan Details:
              </h3>
              <table style="width: 100%; 
                            border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; 
                             color: #6b7280;">
                    Plan Name:
                  </td>
                  <td style="padding: 8px 0;
                             font-weight: bold;
                             color: #1f2937;">
                    ${details.name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;
                             color: #6b7280;">
                    Try-ons:
                  </td>
                  <td style="padding: 8px 0;
                             font-weight: bold;
                             color: #1f2937;">
                    ${details.limit}/month
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;
                             color: #6b7280;">
                    Amount Paid:
                  </td>
                  <td style="padding: 8px 0;
                             font-weight: bold;
                             color: #16a34a;">
                    ${details.price}
                  </td>
                </tr>
              </table>
            </div>

            <div style="text-align: center;
                        margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard"
                 style="background: #7C3AED;
                        color: white;
                        padding: 14px 32px;
                        border-radius: 50px;
                        text-decoration: none;
                        font-weight: bold;">
                Dashboard Dekho →
              </a>
            </div>

            <p style="color: #9ca3af;
                       font-size: 12px;
                       margin-top: 30px;
                       text-align: center;">
              © 2025 VirtualTryOn |
              Made with ❤️ for Indian Sellers
            </p>
          </div>

        </body>
        </html>
      `,
    });
    console.log("✅ Payment email sent!");
  } catch (error) {
    console.log("❌ Email error:", error.message);
  }
};

// ─── Limit Warning Email ───────────────────
const sendLimitWarningEmail = async (seller) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: seller.email,
      subject: "⚠️ Try-On Limit Khatam Hone Wali Hai!",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;
                     max-width: 600px; margin: 0 auto;
                     padding: 20px; background: #f9f9f9;">

          <div style="background: #7C3AED;
                      padding: 30px;
                      border-radius: 16px 16px 0 0;
                      text-align: center;">
            <h1 style="color: white; margin: 0;">
              👗 VirtualTryOn
            </h1>
          </div>

          <div style="background: white;
                      padding: 30px;
                      border-radius: 0 0 16px 16px;">

            <div style="text-align: center;
                        margin-bottom: 24px;">
              <div style="font-size: 60px;">⚠️</div>
              <h2 style="color: #1f2937;">
                Try-On Limit Khatam!
              </h2>
            </div>

            <p style="color: #6b7280;">
              Hi ${seller.name},
              <br><br>
              Aapki monthly try-on limit khatam 
              ho gayi hai! Customers ab try-on 
              nahi kar pa rahe.
            </p>

            <div style="background: #fef3c7;
                        border-radius: 12px;
                        padding: 16px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0;">
                🔢 Current: ${seller.tryonCount}/${seller.tryonLimit} try-ons used
              </p>
            </div>

            <div style="text-align: center;
                        margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/pricing"
                 style="background: #7C3AED;
                        color: white;
                        padding: 14px 32px;
                        border-radius: 50px;
                        text-decoration: none;
                        font-weight: bold;">
                Plan Upgrade Karo →
              </a>
            </div>

            <p style="color: #9ca3af;
                       font-size: 12px;
                       margin-top: 30px;
                       text-align: center;">
              © 2025 VirtualTryOn
            </p>
          </div>

        </body>
        </html>
      `,
    });
    console.log("✅ Warning email sent!");
  } catch (error) {
    console.log("❌ Email error:", error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPaymentSuccessEmail,
  sendLimitWarningEmail,
};
