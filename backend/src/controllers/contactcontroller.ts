import { Request, Response } from 'express';
import { Resend } from 'resend';
import prisma from '../lib/prisma';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_gm86tUNd_KFWXvc1zbfPVZb7XpA1UWzd5');

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, message, phone, service } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required fields',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address',
      });
    }

    // Save contact form submission to database
    const contactSubmission = await prisma.contactForm.create({
      data: {
        name,
        email,
        message,
        phone: phone || null,
        service: service || null,
      },
    });

    // Send email notification to admin
    try {
      console.log('Attempting to send email notification...');
      console.log('From: onboarding@resend.dev');
      console.log('To:', process.env.ADMIN_EMAIL || 'shaikrasheed634@gmail.com');
      console.log('Subject:', `New Contact Form Submission from ${name} (${email})`);
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${service ? `<p><strong>Service Interest:</strong> ${service}</p>` : ''}
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; font-size: 14px; color: #6c757d;">
            <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Submission ID:</strong> ${contactSubmission.id}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d;">
            <p>This email was sent from your IT Partner website contact form.</p>
          </div>
        </div>
      `;

      const emailResult = await resend.emails.send({
        from: 'onboarding@resend.dev', // Use verified sender for reliability
        to: process.env.ADMIN_EMAIL || 'shaikrasheed634@gmail.com',
        subject: `New Contact Form Submission from ${name} (${email})`,
        html: emailHtml,
        replyTo: email, // Add reply-to header so you can reply directly to the submitter
      });

      console.log('✅ Email notification sent successfully');
      console.log('Email ID:', emailResult.data?.id);
    } catch (emailError) {
      console.error('❌ Failed to send email notification:', emailError);
      console.error('Email error details:', emailError instanceof Error ? emailError.message : String(emailError));
      // Don't fail the entire request if email fails
    }

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully! We will get back to you soon.',
      data: {
        id: contactSubmission.id,
        name: contactSubmission.name,
        email: contactSubmission.email,
        message: contactSubmission.message,
        phone: contactSubmission.phone,
        service: contactSubmission.service,
        createdAt: contactSubmission.createdAt,
      },
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form. Please try again.',
    });
  }
};

export const getAllContactSubmissions = async (req: Request, res: Response) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    const submissions = await prisma.contactForm.findMany({
      take: limitNum,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalCount = await prisma.contactForm.count();

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submissions',
    });
  }
};

export const getContactSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.contactForm.findUnique({
      where: { id },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found',
      });
    }

    res.json({
      success: true,
      data: submission,
    });

  } catch (error) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submission',
    });
  }
};
