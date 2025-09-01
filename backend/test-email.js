const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend('re_gm86tUNd_KFWXvc1zbfPVZb7XpA1UWzd5');

async function testEmail() {
  try {
    console.log('Testing email functionality...');
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Test Email - Contact Form
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Test Contact Details:</h3>
          <p><strong>Name:</strong> Test User</p>
          <p><strong>Email:</strong> test@example.com</p>
          <p><strong>Phone:</strong> +1 (555) 123-4567</p>
          <p><strong>Service Interest:</strong> Networking</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
            This is a test message to verify that the email functionality is working correctly.
          </div>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; font-size: 14px; color: #6c757d;">
          <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d;">
          <p>This is a test email from your IT Partner website contact form.</p>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'shaikrasheed634@gmail.com',
      subject: 'Test Email - Contact Form Working!',
      html: emailHtml,
    });

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', result.data?.id);
    console.log('Check your email at: shaikrasheed634@gmail.com');
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

testEmail();
