/**
 * Abstract interface for external box-office platforms (e.g. BookMyShow, Paytm Movies, PVR Inox direct API)
 * Design-for-integration pattern to allow future real API adapters to drop in seamlessly.
 */
class ExternalSourceAdapter {
  constructor(sourceName) {
    this.sourceName = sourceName;
  }

  /**
   * Fetch sales and collection data from external provider
   * @param {string} movieId 
   * @param {Object} dateRange 
   * @returns {Promise<Array<{movieId, theatreName, city, district, state, ticketsSold, revenue, occupancyRate, date, source}>>}
   */
  async fetchShowData(movieId, dateRange = {}) {
    throw new Error('fetchShowData() method must be implemented by subclass');
  }
}

module.exports = ExternalSourceAdapter;
