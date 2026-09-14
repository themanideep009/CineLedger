const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Ticket = require('../models/Ticket');
const Theatre = require('../models/Theatre');

/**
 * Intelligent AI Chat Processor for CineLedger Box-Office & Ticketing
 */
async function processAiChatMessage({ message, userId = null }) {
  const query = (message || '').trim().toLowerCase();

  // Load real context from MongoDB
  let movies = [];
  let shows = [];
  let userTickets = [];
  let theatres = [];

  try {
    movies = await Movie.find({});
    shows = await Show.find({}).populate('movieId theatreId');
    theatres = await Theatre.find({});

    if (userId) {
      userTickets = await Ticket.find({ userId }).populate({
        path: 'showId',
        populate: [{ path: 'movieId' }, { path: 'theatreId' }],
      });
    }
  } catch (err) {
    console.error('Error fetching database context for AI chat:', err);
  }

  // Quick chips default
  const defaultChips = ['🎬 Now Showing', '🎟️ My Bookings', '🏷️ Promo Codes', '❓ Refund Policy'];

  // 1. Casual Greetings & Courtesy Queries
  if (/^(hi|hello|hey|hola|namaste|greetings|good morning|good afternoon|good evening|ssup|yo)\b/i.test(query)) {
    return {
      reply: `Hello! 👋 I'm **CineBot 🤖**, your real AI movie & ticketing assistant for CineLedger.\n\nI can help you discover active movies, find showtimes, check your booked QR tickets, apply discount vouchers, and answer queries about refunds or theatres!\n\nHow can I assist you today?`,
      intent: 'GREETING',
      quickChips: ['🎬 Show Movies', '🎟️ My Bookings', '🍿 Active Offers', '❓ Help & Refunds'],
    };
  }

  if (/^(how are you|how r u|how do you do|how is it going|r u ok|are you fine|whats up|what's up)\b/i.test(query)) {
    return {
      reply: `I'm doing fantastic, thank you for asking! 🍿✨\n\nI'm fully synced with the live CineLedger box-office database and ready to help you discover blockbusters, book seats, or retrieve your ticket QR passes.\n\nWhat movie are you planning to watch today?`,
      intent: 'COURTESY',
      quickChips: ['🎬 Show Blockbusters', '🎟️ View My Tickets', '🏷️ Discount Codes'],
    };
  }

  if (/^(who are you|what can you do|what is cineledger|help me|bot info)\b/i.test(query)) {
    return {
      reply: `I am **CineBot 🤖**, CineLedger's dedicated AI Concierge!\n\nHere is what I can do for you in real-time:\n• 🎬 **Movie Recommendations**: Find now-showing movies by genre (Action, Sci-Fi, Thriller).\n• 🎟️ **Instant Ticket Lookup**: Retrieve your confirmed booking QR codes & seat numbers.\n• 🏷️ **Promo Codes & Rewards**: Get instant 50% F&B discounts & ticket vouchers.\n• ⚡ **Box-Office Assistance**: Instant answers on cancellation, refunds, and cinema locations.`,
      intent: 'BOT_INFO',
      quickChips: defaultChips,
    };
  }

  // 2. Refund & Cancellation Queries (Check before generic ticket lookup)
  if (/cancel|refund|money back|cancellation policy|reschedule/i.test(query)) {
    return {
      reply: `💸 **CineLedger Cancellation & Refund Policy:**\n\n• **Instant 90% Refund**: Cancellations initiated at least **2 hours** before showtime qualify for a 90% instant credit refund.\n• **Automated QR Invalidation**: Once cancelled, the entry QR pass is automatically revoked.\n• **Refund Processing**: Money is credited back to your UPI/Card or CineLedger wallet within 5–10 minutes.\n\nTo initiate a cancellation, go to **Your Orders** from your profile drawer and select your active booking.`,
      intent: 'REFUND_POLICY',
      quickChips: ['🎟️ Go to Your Orders', '📞 Help Support', '🎬 Browse Movies'],
    };
  }

  // 3. Promo Codes & Offers
  if (/offer|discount|promo|coupon|code|deal|cashback|cheap/i.test(query)) {
    return {
      reply: `🏷️ **Active CineLedger Promo Codes for You:**\n\n1. **\`CINEGREEN50\`** — Flat **50% OFF** up to ₹150 on Food & Beverage combos!\n2. **\`WEEKEND20\`** — Flat **₹100 OFF** on 2 or more movie ticket bookings.\n3. **\`FIRSTCINE\`** — **100 Bonus CineCoins** on your first app booking.\n\nYou can copy and paste these codes at payment checkout!`,
      intent: 'PROMO_CODES',
      quickChips: ['🎬 Book Movie Now', '🍿 F&B Menu', '🎟️ My Bookings'],
    };
  }

  // 4. Movie Catalog / Recommendations Query
  if (
    /movie|showing|playing|cinema|blockbuster|watch|film|action|sci-fi|comedy|horror|thriller|pushpa|kalki|stree|recommend/i.test(
      query
    )
  ) {
    let matchedMovies = movies;
    if (/action/i.test(query)) matchedMovies = movies.filter((m) => /action/i.test(m.genre));
    else if (/sci-fi|scifi|science/i.test(query)) matchedMovies = movies.filter((m) => /sci-fi/i.test(m.genre));
    else if (/comedy/i.test(query)) matchedMovies = movies.filter((m) => /comedy/i.test(m.genre));

    if (matchedMovies.length > 0) {
      let movieList = matchedMovies
        .map(
          (m, idx) =>
            `${idx + 1}. **${m.title}** (${m.language}) — *${m.genre}* • ⏱️ ${m.durationMin} mins\n   _${m.description}_`
        )
        .join('\n\n');

      return {
        reply: `🎬 **Here are top movies currently showing in cinemas:**\n\n${movieList}\n\nSelect a movie or ask for specific showtimes in your city!`,
        intent: 'MOVIE_CATALOG',
        actionData: matchedMovies,
        quickChips: ['🎟️ Book Pushpa 2', '🎟️ Book Kalki', '📍 Filter by City'],
      };
    } else {
      return {
        reply: `🎬 We have multiple exciting titles in theaters right now! You can explore options on our home page or search by genre.`,
        intent: 'MOVIE_CATALOG',
        quickChips: defaultChips,
      };
    }
  }

  // 5. User Bookings / Ticket QR Code Lookup
  if (/ticket|booking|order|my pass|qr|qr code|booked|purchased/i.test(query)) {
    if (!userId) {
      return {
        reply: `🎟️ To check your booked tickets and view your digital QR entry pass, please **Log In** to your CineLedger account! You can also click **"Your Orders"** from your profile menu.`,
        intent: 'BOOKING_LOOKUP_UNAUTH',
        quickChips: ['🔐 Login Now', '🎬 Explore Movies', '❓ Refund Policy'],
      };
    }

    if (userTickets.length > 0) {
      let ticketList = userTickets
        .map((t, idx) => {
          const mTitle = t.showId?.movieId?.title || 'Movie Show';
          const tName = t.showId?.theatreId?.name || 'PVR Cinema';
          const seatsStr = t.seats ? t.seats.join(', ') : 'Seats';
          return `${idx + 1}. 🎟️ **${mTitle}**\n   • Ticket ID: \`${t.ticketCode}\` \n   • Venue: ${tName}\n   • Seats: **${seatsStr}** | Total: ₹${t.totalPrice}`;
        })
        .join('\n\n');

      return {
        reply: `🎟️ **Found ${userTickets.length} confirmed ticket(s) in your account:**\n\n${ticketList}\n\n👉 You can open **"Your Orders"** from the profile menu anytime to display the scannable QR Code pass for gate entry!`,
        intent: 'BOOKING_LOOKUP_SUCCESS',
        actionData: userTickets,
        quickChips: ['📱 Open Your Orders', '🍿 Get Popcorn Offer', '❓ Cancel Ticket'],
      };
    } else {
      return {
        reply: `🎟️ You haven't booked any movie tickets yet. Explore our **Now Showing** movies to book your seats with instant double-booking protection!`,
        intent: 'BOOKING_LOOKUP_EMPTY',
        quickChips: ['🎬 Browse Movies', '🍿 Active Promo Codes'],
      };
    }
  }

  // 6. Theatre / Venue / Location Queries
  if (/theatre|theater|pvr|inox|cinema|location|mumbai|delhi|bengaluru|hyderabad|city|cities/i.test(query)) {
    const tNames = theatres.map((t) => `• **${t.name}** (${t.city}) — _${t.totalScreens} Screens_`).join('\n');
    return {
      reply: `📍 **CineLedger Partner Theatres & Cities:**\n\n${tNames || '• PVR Grand Phoenix Mall (Mumbai)\n• INOX Leisure Forum (Bengaluru)\n• PVR Director Cut (Delhi)'}\n\nAll our partner venues feature 4K Laser Projection, Dolby Atmos sound, and real-time seat reservation sync!`,
      intent: 'THEATRE_INFO',
      quickChips: ['🎬 Show Movies', '📍 Change Preferred City', '🏷️ View Offers'],
    };
  }

  // 7. General Intelligent Fallback
  return {
    reply: `🤖 I'm **CineBot**, your CineLedger AI Assistant! I analyzed your query: _"${message}"_.\n\nHere are some popular topics I can assist you with right away:\n• 🎬 Finding now-showing movies & showtimes\n• 🎟️ Retrieving your ticket QR passes & seats\n• 💸 Instant 90% refund policy & cancellation\n• 🏷️ Applying F&B & ticket discount promo codes\n\nWhat would you like to explore?`,
    intent: 'GENERAL_ASSISTANT',
    quickChips: defaultChips,
  };
}

module.exports = { processAiChatMessage };
