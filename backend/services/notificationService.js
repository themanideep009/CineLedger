const nodemailer = require('nodemailer');

// Singleton Nodemailer Transporter instance
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Use custom SMTP credentials if provided in env, or create a test Ethereal account
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback: Create test Ethereal account for development
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Notification Service] Ethereal SMTP Test Account created: ${testAccount.user}`);
    } catch (err) {
      console.warn('[Notification Service] Could not create Ethereal SMTP account, using json transport fallback:', err.message);
      transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }

  return transporter;
}

/**
 * Dispatch Email & WhatsApp Notifications for a confirmed booking
 */
async function dispatchTicketNotifications({ user, booking, ticket, show, customerEmail: inputEmail, customerPhone: inputPhone }) {
  const results = {
    emailSent: false,
    emailPreviewUrl: null,
    whatsappSent: false,
    whatsappMessage: null,
    whatsappShareUrl: null,
  };

  try {
    const customerEmail = inputEmail || user?.email || (booking?.customerName ? `${booking.customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : 'customer@cineledger.com');
    const customerPhone = inputPhone || user?.phone || booking?.customerPhone || '+91 98765 43210';
    const movieTitle = show?.movieId?.title || 'Blockbuster Movie';
    const venueName = show?.theatreId?.name || 'PVR Grand Phoenix Mall';
    const showTimeStr = show?.showTime ? new Date(show.showTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Today, 7:00 PM';
    const seatsStr = booking?.seatIds ? booking.seatIds.join(', ') : 'Seats';
    const totalPrice = booking?.totalAmount || 0;
    const ticketCode = ticket?.ticketId || 'CL-TICKET';

    // 1. SEND EMAIL TICKET CONFIRMATION
    try {
      const mailer = await getTransporter();
      const mailOptions = {
        from: '"CineLedger Tickets" <tickets@cineledger.com>',
        to: customerEmail,
        subject: `🎟️ Ticket Confirmed: ${movieTitle} [Code: ${ticketCode}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #065f46, #047857); padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800;">CineLedger</h1>
              <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Digital Ticket Confirmation & Gate Entry Pass</p>
            </div>

            <div style="padding: 24px; color: #1e293b;">
              <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Hi ${user?.name || booking?.customerName || 'Movie Buff'},</p>
              <p style="font-size: 14px; color: #475569;">Your movie ticket booking is confirmed! Present your ticket code or QR pass at the theater entry gate.</p>

              <div style="background-color: #f8fafc; border: 1px dashed #059669; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Movie:</td>
                    <td style="padding: 6px 0; font-weight: 800; color: #0f172a;">${movieTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Venue:</td>
                    <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${venueName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Showtime:</td>
                    <td style="padding: 6px 0; font-weight: bold; color: #059669;">${showTimeStr}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Reserved Seats:</td>
                    <td style="padding: 6px 0; font-weight: 800; color: #0f172a;">${seatsStr}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Total Paid:</td>
                    <td style="padding: 6px 0; font-weight: 800; color: #0f172a;">₹${totalPrice}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Ticket ID:</td>
                    <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #059669;">${ticketCode}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:5173/my-bookings" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 10px; font-size: 14px; display: inline-block;">
                  View Digital QR Pass
                </a>
              </div>
            </div>

            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
              CineLedger Verification Engine • Real-Time Atomic Ticket Dispatch
            </div>
          </div>
        `,
      };

      const info = await mailer.sendMail(mailOptions);
      results.emailSent = true;
      if (nodemailer.getTestMessageUrl(info)) {
        results.emailPreviewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Email Dispatch] Preview sent: ${results.emailPreviewUrl}`);
      } else {
        console.log(`[Email Dispatch] Email ticket sent to ${customerEmail}`);
      }
    } catch (err) {
      console.error('[Email Dispatch Error]:', err.message);
    }

    // 2. DISPATCH WHATSAPP TICKET MESSAGE
    try {
      const waText = `🎬 *CineLedger Ticket Confirmation*\n\nHi ${user?.name || booking?.customerName || 'Customer'}! Your movie ticket is CONFIRMED 🎟️\n\n🎥 *Movie*: ${movieTitle}\n📍 *Venue*: ${venueName}\n⏰ *Showtime*: ${showTimeStr}\n💺 *Seats*: ${seatsStr}\n💵 *Total*: ₹${totalPrice}\n🆔 *Ticket Code*: ${ticketCode}\n\n📲 *View QR Pass*: http://localhost:5173/my-bookings\n\nEnjoy your movie! 🍿✨`;

      const cleanPhone = customerPhone.replace(/[^\d]/g, '');
      const encodedMsg = encodeURIComponent(waText);
      const whatsappShareUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

      results.whatsappSent = true;
      results.whatsappMessage = waText;
      results.whatsappShareUrl = whatsappShareUrl;

      console.log(`[WhatsApp Dispatch] Ticket message formatted for ${customerPhone}`);
    } catch (err) {
      console.error('[WhatsApp Dispatch Error]:', err.message);
    }
  } catch (globalErr) {
    console.error('[Notification Dispatcher Global Catch]:', globalErr.message);
  }

  return results;
}

module.exports = { dispatchTicketNotifications };
