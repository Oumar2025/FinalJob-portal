// Simple email notification system
export const sendApplicationNotification = async (
    applicantEmail: string,
    applicantName: string,
    jobTitle: string,
    company: string,
    status: string
) => {
    console.log('\n📧 EMAIL NOTIFICATION');
    console.log('To:', applicantEmail);
    console.log('Subject: Application Update -', jobTitle);
    console.log('Message:');
    console.log(`Hello ${applicantName},`);
    console.log(`Your application for "${jobTitle}" at ${company} has been ${status.toLowerCase()}.`);
    console.log('Thank you for using JobPortal!');
    console.log('---\n');

    // In a real application, you would integrate with:
    // - SendGrid, Mailgun, AWS SES, etc.
    // For now, we'll just log to console
};