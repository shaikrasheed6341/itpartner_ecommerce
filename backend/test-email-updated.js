const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend('re_gm86tUNd_KFWXvc1zbfPVZb7XpA1UWzd5');

async function testEmailWithSubmitterFrom() {
  try {
    console.log('Testing email functionality with submitter as from address...');
    
    // Test data - simulating a contact form submission
    const name = 'John Doe';
    const email = 'john.doe@example.com';
    const phone = '+1 (555) 123-4567';
    const service = 'Networking';
    const message = 'I need help with setting up a WiFi network for my office. Can you provide a quote?';
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Contact Details:</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service Interest:</strong> ${service}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; font-size: 14px; color: #6c757d;">
          <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Test ID:</strong> TEST-${Date.now()}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d;">
          <p>This email was sent from your IT Partner website contact form.</p>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: email, // Using submitter's email as from address
      to: 'shaikrasheed634@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: emailHtml,
      replyTo: email, // Reply-to header for direct response
    });

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', result.data?.id);
    console.log('From:', email);
    console.log('To: shaikrasheed634@gmail.com');
    console.log('Reply-To:', email);
    console.log('Check your email at: shaikrasheed634@gmail.com');
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    console.error('Error details:', error.message);
    
    // If using submitter's email as from fails, try with verified sender
    console.log('\n🔄 Trying with verified sender as fallback...');
    try {
      const fallbackResult = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'shaikrasheed634@gmail.com',
        subject: `New Contact Form Submission from John Doe (john.doe@example.com)`,
        html: emailHtml,
        replyTo: 'john.doe@example.com',
      });
      
      console.log('✅ Fallback email sent successfully!');
      console.log('Email ID:', fallbackResult.data?.id);
    } catch (fallbackError) {
      console.error('❌ Fallback email also failed:', fallbackError.message);
    }
  }
}

testEmailWithSubmitterFrom();
