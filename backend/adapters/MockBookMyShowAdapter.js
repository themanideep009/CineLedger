const ExternalSourceAdapter = require('./ExternalSourceAdapter');
const Movie = require('../models/Movie');

class MockBookMyShowAdapter extends ExternalSourceAdapter {
  constructor() {
    super('BookMyShow (Simulated)');
  }

  /**
   * Generates realistic simulated collection figures from BookMyShow API feeds
   */
  async fetchShowData(movieId, dateRange = {}) {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return [];
    }

    const cities = [
      { city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', baseSales: 450, avgPrice: 320 },
      { city: 'Delhi', district: 'New Delhi', state: 'Delhi', baseSales: 410, avgPrice: 300 },
      { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', baseSales: 380, avgPrice: 280 },
      { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', baseSales: 350, avgPrice: 250 },
      { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', baseSales: 290, avgPrice: 220 },
      { city: 'Pune', district: 'Pune', state: 'Maharashtra', baseSales: 240, avgPrice: 240 },
      { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', baseSales: 210, avgPrice: 200 },
      { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', baseSales: 260, avgPrice: 210 },
      { city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', baseSales: 180, avgPrice: 190 },
      { city: 'Kochi', district: 'Ernakulam', state: 'Kerala', baseSales: 170, avgPrice: 210 },
    ];

    const today = new Date();
    const records = [];

    // Generate external collection entries for the past 5 days
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() - dayOffset);
      entryDate.setHours(0, 0, 0, 0);

      cities.forEach((loc, idx) => {
        // Add random variance based on day offset and location index
        const multiplier = 1 - dayOffset * 0.12 + ((idx % 3) * 0.05);
        const ticketsSold = Math.max(20, Math.floor(loc.baseSales * multiplier));
        const revenue = ticketsSold * loc.avgPrice;
        const occupancyRate = Math.min(98, Math.max(35, Math.floor(ticketsSold / 5)));

        records.push({
          movieId: movie._id,
          theatreName: `Cinepolis & PVR ${loc.city} (BookMyShow Partner)`,
          city: loc.city,
          district: loc.district,
          state: loc.state,
          date: entryDate,
          source: 'external_simulated',
          ticketsSold,
          revenue,
          occupancyRate,
        });
      });
    }

    return records;
  }
}

module.exports = MockBookMyShowAdapter;
