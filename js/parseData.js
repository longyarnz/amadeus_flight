function parseData(body) {
  let { itineraries } = body.data;
  itineraries = Array.isArray(itineraries[0]) ? itineraries[0] : itineraries;
  const flights = itineraries.map(flight => {
    const price = flight.pricing.provider.total_fare;
    const cabin = flight.cabin.name;
    const trips = flight.origin_destinations.map(origin => {
      const stops = origin.segments.map(obj => {
        return {
          airline: obj.operating_airline.name,
          departure: {
            city: obj.departure.airport.name,
            code: obj.departure.airport.code,
            time: obj.departure.time,
            date: obj.departure.date
          },
          arrival: {
            city: obj.arrival.airport.name,
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
    });

    return {
      price,
      cabin,
      trip: mergeTrips(trips)
    }
  });

  return {
    flights,
    total: body.data.itineraries.length
  }
}

function mergeTrips(trips) {
  if (trips.length === 2) {
    trips = {
      stops: trips[0].stops.concat(trips[1].stops),
      total: trips[0].total + trips[1].total
    }
  }
  else trips = trips[0];
  return trips;
}

function loadMore() {
  const limit = JSON.parse(localStorage.getItem('amadeus_limit'));
  const newLimit = limit + 10;
  localStorage.setItem('amadeus_limit', newLimit);
  renderFlightData(200, limit);
}


function updateSearchTitleHeader(key, total = 0) {
  const from = localStorage.getItem('departure_city').split(', ')[0];
  const to = localStorage.getItem('destination_city').split(', ')[0];
  const titles = {
    searching: `Searching for flights from ${from} to ${to}.`,
    searched: `${total} flights from ${from} to ${to}.`,
    failed: `No flights found. Try to search for other location at another time.`
  };
  $('.theme-search-area-title').html(titles[key]);
  key === 'failed' && $('.thumbs-up').show();
}


function toggleLoadMoreButton(total, limit = 10) {
  total > limit && $('.load-more').show();
  total <= limit && $('.load-more').hide();
}