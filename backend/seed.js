const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Theatre = require('./models/Theatre');
const Screen = require('./models/Screen');
const Movie = require('./models/Movie');
const Show = require('./models/Show');
const Booking = require('./models/Booking');
const Ticket = require('./models/Ticket');
const Collection = require('./models/Collection');
const AuditLog = require('./models/AuditLog');
const { runAggregation } = require('./jobs/aggregationJob');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cineledger';

const seedDatabase = async () => {
  try {
    console.log('[Seed Engine] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed Engine] Wiping existing data...');

    await Promise.all([
      User.deleteMany({}),
      Theatre.deleteMany({}),
      Screen.deleteMany({}),
      Movie.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
      Ticket.deleteMany({}),
      Collection.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed Engine] Generating hashed passwords...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const producerPassword = await bcrypt.hash('producer123', 10);
    const theatrePassword = await bcrypt.hash('theatre123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // 1. Create System Users
    console.log('[Seed Engine] Creating Users across all security roles...');
    const superAdmin = await User.create({
      name: 'Victoria SuperAdmin',
      email: 'admin@cineledger.com',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
    });

    const producer1 = await User.create({
      name: 'Karan Johar (Dharma)',
      email: 'producer.karan@cineledger.com',
      passwordHash: producerPassword,
      role: 'PRODUCER',
      producerCompany: 'Dharma Productions',
    });

    const producer2 = await User.create({
      name: 'Aditya Chopra (YRF)',
      email: 'producer.aditya@cineledger.com',
      passwordHash: producerPassword,
      role: 'PRODUCER',
      producerCompany: 'Yash Raj Films',
    });

    const theatreAdmin1 = await User.create({
      name: 'Rajesh Sharma (PVR Mumbai)',
      email: 'admin.pvr@cineledger.com',
      passwordHash: theatrePassword,
      role: 'THEATRE_ADMIN',
    });

    const theatreAdmin2 = await User.create({
      name: 'Anil Gupta (INOX Delhi)',
      email: 'admin.inox@cineledger.com',
      passwordHash: theatrePassword,
      role: 'THEATRE_ADMIN',
    });

    const theatreAdmin3 = await User.create({
      name: 'Suresh Kumar (Cinepolis Blr)',
      email: 'admin.cinepolis@cineledger.com',
      passwordHash: theatrePassword,
      role: 'THEATRE_ADMIN',
    });

    const customer = await User.create({
      name: 'Aarav Patel',
      email: 'customer@gmail.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
    });

    // 2. Create Theatres in Multiple Indian Metropolitan Hubs
    console.log('[Seed Engine] Creating Multi-Location Theatres & Screens...');
    const theatre1 = await Theatre.create({
      name: 'PVR Grand Phoenix Mall',
      village: 'Lower Parel',
      city: 'Mumbai',
      district: 'Mumbai City',
      state: 'Maharashtra',
      adminId: theatreAdmin1._id,
      verifiedStatus: true,
    });
    theatreAdmin1.theatreId = theatre1._id;
    await theatreAdmin1.save();

    const theatre2 = await Theatre.create({
      name: 'INOX Select CP',
      village: 'Connaught Place',
      city: 'Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      adminId: theatreAdmin2._id,
      verifiedStatus: true,
    });
    theatreAdmin2.theatreId = theatre2._id;
    await theatreAdmin2.save();

    const theatre3 = await Theatre.create({
      name: 'Cinepolis Forum Shantiniketan',
      village: 'Whitefield',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      adminId: theatreAdmin3._id,
      verifiedStatus: true,
    });
    theatreAdmin3.theatreId = theatre3._id;
    await theatreAdmin3.save();

    const theatre4 = await Theatre.create({
      name: 'Prasads Multiplex',
      village: 'Banjara Hills',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      adminId: superAdmin._id,
      verifiedStatus: true,
    });

    const theatre5 = await Theatre.create({
      name: 'PVR Palazzo Express',
      village: 'Royapettah',
      city: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
      adminId: superAdmin._id,
      verifiedStatus: true,
    });

    const theatre6 = await Theatre.create({
      name: 'INOX Seasons Mall',
      village: 'Hadapsar',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      adminId: superAdmin._id,
      verifiedStatus: true,
    });

    const theatre7 = await Theatre.create({
      name: 'PVR Elante Mall',
      village: 'Industrial Area',
      city: 'Chandigarh',
      district: 'Chandigarh',
      state: 'Chandigarh',
      adminId: superAdmin._id,
      verifiedStatus: true,
    });

    const theatre8 = await Theatre.create({
      name: 'INOX Himalaya Mall',
      village: 'Drive In Road',
      city: 'Ahmedabad',
      district: 'Ahmedabad',
      state: 'Gujarat',
      adminId: superAdmin._id,
      verifiedStatus: true,
    });

    const theatre9 = await Theatre.create({
      name: 'Cinepolis Acropolis Mall',
      village: 'Kasba',
      city: 'Kolkata',
      district: 'Kolkata',
      state: 'West Bengal',
      adminId: superAdmin._id,
      verifiedStatus: true,
    });

    const theatre10 = await Theatre.create({
      name: 'PVR Lulu Mall',
      village: 'Edappally',
      city: 'Kochi',
      district: 'Ernakulam',
      state: 'Kerala',
      adminId: superAdmin._id,
      verifiedStatus: true,
    });

    const theatre11 = await Theatre.create({
      name: 'INOX GT Central Mall',
      village: 'Malviya Nagar',
      city: 'Jaipur',
      district: 'Jaipur',
      state: 'Rajasthan',
      adminId: superAdmin._id,
      verifiedStatus: true,
    });

    // 3. Create Multiple Screens per Theatre
    console.log('[Seed Engine] Registering Multiple Screens per Theatre Location...');
    // Mumbai Screens
    const screen1_1 = await Screen.create({
      theatreId: theatre1._id,
      name: 'Audi 1 (IMAX 4K Laser)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A', 'B'],
    });
    const screen1_2 = await Screen.create({
      theatreId: theatre1._id,
      name: 'Audi 2 (Dolby Atmos ScreenX)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A'],
    });
    const screen1_3 = await Screen.create({
      theatreId: theatre1._id,
      name: 'Audi 3 (VIP Luxe Lounge)',
      capacity: 60,
      rows: 6,
      cols: 10,
      vipRows: ['A', 'B', 'C'],
    });

    // Delhi Screens
    const screen2_1 = await Screen.create({
      theatreId: theatre2._id,
      name: 'Audi 1 (Dolby Cinema)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A', 'B'],
    });
    const screen2_2 = await Screen.create({
      theatreId: theatre2._id,
      name: 'Audi 2 (INSIGNIA Luxe)',
      capacity: 60,
      rows: 6,
      cols: 10,
      vipRows: ['A', 'B'],
    });

    // Bengaluru Screens
    const screen3_1 = await Screen.create({
      theatreId: theatre3._id,
      name: 'Audi 1 (IMAX with Laser)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A', 'B'],
    });
    const screen3_2 = await Screen.create({
      theatreId: theatre3._id,
      name: 'Audi 2 (4DX Motion Lounge)',
      capacity: 60,
      rows: 6,
      cols: 10,
      vipRows: ['A'],
    });

    // Hyderabad Screens
    const screen4_1 = await Screen.create({
      theatreId: theatre4._id,
      name: 'Screen 1 (PCX Large Format)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A', 'B'],
    });

    // Chennai Screens
    const screen5_1 = await Screen.create({
      theatreId: theatre5._id,
      name: 'Audi 1 (IMAX GT Screen)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A'],
    });

    // Pune Screens
    const screen6_1 = await Screen.create({
      theatreId: theatre6._id,
      name: 'Audi 1 (Kiddles & Luxe)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A', 'B'],
    });

    // Chandigarh Screens
    const screen7_1 = await Screen.create({
      theatreId: theatre7._id,
      name: 'Audi 1 (PVR P[XL])',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A', 'B'],
    });

    // Ahmedabad Screens
    const screen8_1 = await Screen.create({
      theatreId: theatre8._id,
      name: 'Audi 1 (Laser 4K ScreenX)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A'],
    });

    // Kolkata Screens
    const screen9_1 = await Screen.create({
      theatreId: theatre9._id,
      name: 'Audi 1 (Macro XE)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A', 'B'],
    });

    // Kochi Screens
    const screen10_1 = await Screen.create({
      theatreId: theatre10._id,
      name: 'Audi 1 (IMAX 3D Laser)',
      capacity: 80,
      rows: 8,
      cols: 10,
      vipRows: ['A'],
    });

    // 4. Create Movies
    console.log('[Seed Engine] Registering Blockbuster Movies...');
    const movie1 = await Movie.create({
      title: 'Kalki 2898 AD',
      description: 'A futuristic epic blending ancient mythology with high-octane sci-fi action in dystopian Kashi.',
      language: 'Telugu / Hindi',
      durationMin: 180,
      genre: 'Sci-Fi / Action',
      posterUrl: '/posters/kalki.jpg',
      bannerUrl: '/banners/kalki.jpg',
      releaseDate: new Date('2026-06-27'),
      producerId: producer1._id,
    });

    const movie2 = await Movie.create({
      title: 'Jawan: Director Cut',
      description: 'A high-octane vigilante action thriller highlighting a soldier on a mission to bring accountability to society.',
      language: 'Hindi',
      durationMin: 165,
      genre: 'Action / Thriller',
      posterUrl: '/posters/jawan.jpg',
      bannerUrl: '/banners/jawan.jpg',
      releaseDate: new Date('2026-05-15'),
      producerId: producer2._id,
    });

    const movie3 = await Movie.create({
      title: 'Stree 2: Ultimate Blockbuster',
      description: 'The town of Chanderi faces a new terrifying entity, requiring the eccentric gang to unite once more.',
      language: 'Hindi',
      durationMin: 148,
      genre: 'Comedy / Horror',
      posterUrl: '/posters/stree2.jpg',
      bannerUrl: '/banners/stree2.jpg',
      releaseDate: new Date('2026-08-15'),
      producerId: producer1._id,
    });

    const movie4 = await Movie.create({
      title: 'Pushpa 2: The Rule',
      description: 'The conflict between Pushpa Raj and Bhanwar Singh Shekhawat escalates into an all-out battle for supremacy.',
      language: 'Telugu / Hindi',
      durationMin: 175,
      genre: 'Action / Crime',
      posterUrl: '/posters/pushpa2.jpg',
      bannerUrl: '/banners/pushpa2.jpg',
      releaseDate: new Date('2026-12-05'),
      producerId: producer2._id,
    });

    const movie5 = await Movie.create({
      title: 'IPL 2026: SRH vs CSK T20 Clash',
      description: 'Live IPL T20 Cricket Blockbuster match at Rajiv Gandhi International Stadium / Wankhede Stadium.',
      language: 'Hindi / English',
      durationMin: 210,
      genre: 'Sports / Cricket',
      posterUrl: '/posters/ipl_cricket.jpg',
      bannerUrl: '/banners/kalki.jpg',
      releaseDate: new Date('2026-04-18'),
      producerId: producer1._id,
    });

    const movie6 = await Movie.create({
      title: 'Zakir Khan Live: Tathastu 2.0 Comedy',
      description: 'India’s favorite standup comedian Zakir Khan performing live on stage.',
      language: 'Hindi',
      durationMin: 120,
      genre: 'Standup Comedy',
      posterUrl: '/posters/zakir_khan.jpg',
      bannerUrl: '/banners/jawan.jpg',
      releaseDate: new Date('2026-05-10'),
      producerId: producer2._id,
    });

    // 5. Create Shows across today & upcoming dates in all cities & screens
    console.log('[Seed Engine] Creating Shows & Seat Map Allocations across multi-location screens...');
    const now = new Date();
    
    // Show 1: Mumbai PVR Audi 1 (Kalki)
    const show1Date = new Date(now);
    show1Date.setHours(18, 30, 0, 0);

    const show1 = await Show.create({
      movieId: movie1._id,
      screenId: screen1_1._id,
      theatreId: theatre1._id,
      showTime: show1Date,
      price: 350,
      bookedSeats: ['A1', 'A2', 'B5', 'B6', 'C3', 'D1', 'D2', 'D3', 'E4', 'E5', 'F1', 'F2', 'F3', 'F4', 'F5', 'G1', 'G2'],
    });

    // Show 2: Delhi INOX Audi 1 (Jawan)
    const show2Date = new Date(now);
    show2Date.setHours(21, 15, 0, 0);

    const show2 = await Show.create({
      movieId: movie2._id,
      screenId: screen2_1._id,
      theatreId: theatre2._id,
      showTime: show2Date,
      price: 400,
      bookedSeats: ['D1', 'D2', 'D3', 'E1', 'E2', 'E3', 'E4', 'F5', 'F6', 'G7', 'H1', 'H2'],
    });

    // Show 3: Bengaluru Cinepolis Audi 1 (Stree 2)
    const show3Date = new Date(now);
    show3Date.setDate(show3Date.getDate() + 1);
    show3Date.setHours(16, 0, 0, 0);

    const show3 = await Show.create({
      movieId: movie3._id,
      screenId: screen3_1._id,
      theatreId: theatre3._id,
      showTime: show3Date,
      price: 450,
      bookedSeats: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D4', 'D5', 'E1', 'E2'],
    });

    // Show 4: Mumbai PVR Audi 2 (Pushpa 2)
    const show4Date = new Date(now);
    show4Date.setHours(14, 0, 0, 0);

    const show4 = await Show.create({
      movieId: movie4._id,
      screenId: screen1_2._id,
      theatreId: theatre1._id,
      showTime: show4Date,
      price: 380,
      bookedSeats: ['C1', 'C2', 'D5', 'D6', 'E3', 'E4', 'F1', 'F2', 'F3'],
    });

    // Show 5: Hyderabad Prasads Screen 1 (Kalki)
    const show5Date = new Date(now);
    show5Date.setHours(19, 0, 0, 0);

    const show5 = await Show.create({
      movieId: movie1._id,
      screenId: screen4_1._id,
      theatreId: theatre4._id,
      showTime: show5Date,
      price: 350,
      bookedSeats: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'F1', 'F2', 'G1', 'G2', 'H1', 'H2'],
    });

    // Show 6: Chennai PVR Palazzo Audi 1 (Jawan)
    const show6Date = new Date(now);
    show6Date.setHours(20, 0, 0, 0);

    const show6 = await Show.create({
      movieId: movie2._id,
      screenId: screen5_1._id,
      theatreId: theatre5._id,
      showTime: show6Date,
      price: 360,
      bookedSeats: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E5', 'E6'],
    });

    // Show 7: Pune INOX Seasons Audi 1 (Stree 2)
    const show7Date = new Date(now);
    show7Date.setHours(17, 30, 0, 0);

    const show7 = await Show.create({
      movieId: movie3._id,
      screenId: screen6_1._id,
      theatreId: theatre6._id,
      showTime: show7Date,
      price: 320,
      bookedSeats: ['A1', 'A2', 'B3', 'B4', 'C5', 'C6', 'D1', 'D2'],
    });

    // Show 8: Chandigarh PVR Elante (Pushpa 2)
    const show8Date = new Date(now);
    show8Date.setHours(20, 15, 0, 0);

    await Show.create({
      movieId: movie4._id,
      screenId: screen7_1._id,
      theatreId: theatre7._id,
      showTime: show8Date,
      price: 390,
      bookedSeats: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    });

    // Show 9: Ahmedabad INOX Himalaya (Kalki 2898 AD)
    const show9Date = new Date(now);
    show9Date.setHours(18, 45, 0, 0);

    await Show.create({
      movieId: movie1._id,
      screenId: screen8_1._id,
      theatreId: theatre8._id,
      showTime: show9Date,
      price: 340,
      bookedSeats: ['A1', 'A2', 'D1', 'D2', 'D3'],
    });

    // Show 10: Kolkata Cinepolis Acropolis (Jawan)
    const show10Date = new Date(now);
    show10Date.setHours(21, 0, 0, 0);

    await Show.create({
      movieId: movie2._id,
      screenId: screen9_1._id,
      theatreId: theatre9._id,
      showTime: show10Date,
      price: 370,
      bookedSeats: ['B1', 'B2', 'B3', 'C4', 'C5'],
    });

    // Show 11: Kochi PVR Lulu Mall (Stree 2)
    const show11Date = new Date(now);
    show11Date.setHours(16, 30, 0, 0);

    await Show.create({
      movieId: movie3._id,
      screenId: screen10_1._id,
      theatreId: theatre10._id,
      showTime: show11Date,
      price: 310,
      bookedSeats: ['A1', 'A2', 'A3', 'B1'],
    });


    // 6. Create Seed Bookings & Verified Tickets
    console.log('[Seed Engine] Creating Seed Bookings & QR Verification Tickets...');
    const booking1 = await Booking.create({
      showId: show1._id,
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: '+91 9876543210',
      seatIds: ['A1', 'A2'],
      totalAmount: 700,
      paymentMethod: 'MOCK_ONLINE',
      paymentStatus: 'COMPLETED',
      source: 'online',
      status: 'CONFIRMED',
    });

    const ticket1Id = 'CL-MUM-8X91';
    const qrPayload1 = JSON.stringify({
      ticketId: ticket1Id,
      bookingId: booking1._id,
      showId: show1._id,
      movieTitle: movie1.title,
      seatIds: ['A1', 'A2'],
    });

    await Ticket.create({
      bookingId: booking1._id,
      ticketId: ticket1Id,
      qrPayload: qrPayload1,
      status: 'ISSUED',
    });

    // Counter Booking Example (Walk-in guest)
    const booking2 = await Booking.create({
      showId: show1._id,
      customerName: 'Walk-in Counter Guest',
      seatIds: ['B5', 'B6'],
      totalAmount: 700,
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      source: 'counter',
      status: 'CONFIRMED',
    });

    const ticket2Id = 'CL-CNT-9922';
    const qrPayload2 = JSON.stringify({
      ticketId: ticket2Id,
      bookingId: booking2._id,
      showId: show1._id,
      movieTitle: movie1.title,
      seatIds: ['B5', 'B6'],
    });

    await Ticket.create({
      bookingId: booking2._id,
      ticketId: ticket2Id,
      qrPayload: qrPayload2,
      status: 'USED',
      scannedAt: new Date(),
      scannedBy: theatreAdmin1._id,
    });

    // Booking 3 for Pushpa 2
    const booking3 = await Booking.create({
      showId: show4._id,
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: '+91 9876543210',
      seatIds: ['C1', 'C2'],
      totalAmount: 760,
      paymentMethod: 'MOCK_ONLINE',
      paymentStatus: 'COMPLETED',
      source: 'online',
      status: 'CONFIRMED',
    });

    const ticket3Id = 'CL-MUM-4A12';
    await Ticket.create({
      bookingId: booking3._id,
      ticketId: ticket3Id,
      qrPayload: JSON.stringify({
        ticketId: ticket3Id,
        bookingId: booking3._id,
        showId: show4._id,
        movieTitle: movie4.title,
        seatIds: ['C1', 'C2'],
      }),
      status: 'ISSUED',
    });

    // 7. Run Aggregation Engine to synthesize box office collections
    console.log('[Seed Engine] Executing Automated Box-Office Aggregation Job...');
    await runAggregation({ name: 'System Seeder', role: 'SUPER_ADMIN' });

    // 8. Create Audit Logs
    console.log('[Seed Engine] Writing System Verification Audit Trail...');
    await AuditLog.create([
      {
        actorId: superAdmin._id,
        actorName: superAdmin.name,
        actorRole: superAdmin.role,
        action: 'SYSTEM_INITIALIZED',
        entityType: 'System',
        details: { message: 'CineLedger multi-region ticketing & box-office verification engine initialized.' },
        timestamp: new Date(Date.now() - 3600000 * 4),
      },
      {
        actorId: customer._id,
        actorName: customer.name,
        actorRole: customer.role,
        action: 'BOOKING_CREATED',
        entityType: 'Booking',
        entityId: booking1._id,
        details: { ticketId: ticket1Id, seats: ['A1', 'A2'], totalAmount: 700, source: 'online' },
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
      {
        actorId: theatreAdmin1._id,
        actorName: theatreAdmin1.name,
        actorRole: theatreAdmin1.role,
        action: 'TICKET_SCANNED_SUCCESS',
        entityType: 'Ticket',
        entityId: ticket2Id,
        details: { ticketId: ticket2Id, seats: ['B5', 'B6'], status: 'USED' },
        timestamp: new Date(Date.now() - 1800000),
      },
    ]);

    console.log('\n======================================================');
    console.log('  CineLedger Seed Completed Successfully!');
    console.log('======================================================');
    console.log('Demo Credentials for role testing:');
    console.log('------------------------------------------------------');
    console.log('1. SUPER_ADMIN:     admin@cineledger.com / admin123');
    console.log('2. PRODUCER (Dharma): producer.karan@cineledger.com / producer123');
    console.log('3. PRODUCER (YRF):   producer.aditya@cineledger.com / producer123');
    console.log('4. THEATRE_ADMIN:   admin.pvr@cineledger.com / theatre123');
    console.log('5. CUSTOMER:        customer@gmail.com / customer123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Engine Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
