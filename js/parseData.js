function parseData(body) {
  const flights = body.data.itineraries.map(flight => {
    const price = flight.pricing.provider.total_fare;
    const cabin = flight.cabin.name;
    const trip = flight.origin_destinations.map(origin => {
      const stops = origin.segments.map(obj => {
        return {
          airline: obj.operating_airline.name,
          departure: {
            city: obj.departure.airport.city_name,
            code: obj.departure.airport.code,
            time: obj.departure.time,
            date: obj.departure.date
          },
          arrival: {
            city: obj.arrival.airport.city_name,
            code: obj.arrival.airport.code,
            time: obj.arrival.time,
            date: obj.arrival.date
          }
        }
      });
      
      return { 
        stops,
        total: origin.segments.length
      }
    })[0];

    return {
      price,
      cabin,
      trip
    }
  });

  return {
    flights,
    total: body.data.itineraries.length
  }
}