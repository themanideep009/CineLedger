const { dispatchTicketNotifications } = require('../../backend/services/notificationService');

async function testNotifications() {
  const result = await dispatchTicketNotifications({
    user: { name: 'Aarav Patel', email: 'aarav.patel@example.com', phone: '+919876543210' },
    booking: { _id: 'b123', seatIds: ['C1', 'C2'], totalAmount: 760, customerName: 'Aarav Patel' },
    ticket: { ticketId: 'CL-MUM-4A12' },
    show: {
      movieId: { title: 'Pushpa 2: The Rule' },
      theatreId: { name: 'PVR Grand Phoenix Mall' },
      showTime: new Date().toISOString(),
    },
  });

  console.log('--- NOTIFICATION TEST RESULT ---');
  console.log(result);
}

testNotifications().catch(console.error);
