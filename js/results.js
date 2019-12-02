$(document).ready(function () {
  localStorage.setItem('amadeus_limit', 10);
  populateFields();
  renderFlightData();
  $('.load-more').click(loadMore);
});

function updateSearchTitleHeader(key, total = 0) {
  const from = localStorage.getItem('departure_city').split(', ')[0];
  const to = localStorage.getItem('destination_city').split(', ')[0];
  const titles = {
    searching: `Searching for flights from ${from} to ${to}.`,
    searched: `${total} flights from ${from} to ${to}.`,
    failed: `No flights found. Try to search for other location`
  };
  $('.theme-search-area-title').html(titles[key]);
}

function populateFields(status = 200) {
  let data = localStorage.getItem('amadeus_inputs');
  if (!data) return;
  else if (status !== 200) {
    updateSearchTitleHeader('failed');
    return;
  }

  data = JSON.parse(data);
  for (const key in data) {
    let value = populateParams(key, data[key]);
    value = getLocation(key, value);
    const element = $(`[name="${key}"]`).val(value);
  }
}

function renderFlightData(status = 200, start = 0) {
  let body = localStorage.getItem('amadeus_flight');
  if (!body) return;
  else if (status !== 200) {
    updateSearchTitleHeader('failed');
    return;
  }

  body = JSON.parse(body);
  body = parseData(body);
  const limit = JSON.parse(localStorage.getItem('amadeus_limit'));

  body.flights.forEach((flight, i) => {
    if (i < start || i >= limit) return;
    let markup = html;
    markup = renderStopsDetails(markup, flight.trip.stops);
    markup = renderCabinDetails(markup, flight.cabin);
    markup = renderPriceDetails(markup, flight.price);
    $('.theme-search-results').append(markup);
    updateSearchTitleHeader('searched', limit);
  });
}

function renderStopsDetails(html, stops) {
  const stopsHTML = stops.map(flight => {
    let markup = stopsMarkup;
    const departure = renderDepartureDetails(flight.departure);
    const arrival = renderDepartureDetails(flight.arrival);
    const airport = renderAirportDetails(flight);
    markup = markup.replace('{{departure_details}}', departure);
    markup = markup.replace('{{arrival_details}}', arrival);
    markup = markup.replace('{{airport_details}}', airport);
    markup = markup.replace('{{airline_name}}', flight.airline);
    return markup;
  }).join('');

  html = html.replace('{{stops_details}}', stopsHTML);
  return html;
}

function renderDepartureDetails(departure) {
  let markup = departureMarkup;
  markup = markup.replace('{{city}}', departure.city);
  markup = markup.replace('{{time}}', departure.time);
  markup = markup.replace('{{date}}', departure.date);
  const daytime = parseInt(departure.time.slice(0, 2)) > 11 ? 'PM' : 'AM';
  markup = markup.replace('{{daytime}}', daytime);
  return markup;
}

function renderAirportDetails({ departure, arrival }) {
  let markup = airportMarkup;
  markup = markup.replace('{{departure_code}}', departure.code);
  markup = markup.replace('{{arrival_code}}', arrival.code);
  const duration = getFlightDuration(departure, arrival);
  markup = markup.replace('{{duration}}', `${duration}`);
  return markup;
}

function getFlightDuration(D, A) {
  const departure = moment(`${D.date} ${D.time}`);
  const arrival = moment(`${A.date} ${A.time}`);
  const hours = arrival.diff(departure, 'hours', true);
  const H = Math.floor(hours);
  const minutes = Math.ceil((hours % H) * 60);
  return `${H}h ${minutes}min`;
}

function renderAirlineDetails() {
  return `
    <h5 class="theme-search-results-item-flight-section-airline-title">
      Operated by Virgin Atlantic Airways
    </h5>
  `
}

function renderCabinDetails(html, cabin) {
  return html.replace('{{cabin_details}}', cabin);
}

function parseMoney(number) {
  number = number.toString().split('').reverse();
  for (let i = 0; i < number.length; i++)
    if (i % 3 === 0 && i !== 0) number[i] += ', ';
  number = number.reverse().join('');
  return number;
}

function renderPriceDetails(html, price) {
  return html.replace('{{price_details}}', parseMoney(price));
}

const html = `
  <div class="theme-search-results-item _mb-10 theme-search-results-item-rounded theme-search-results-item-">
    <div class="theme-search-results-item-preview">
      <a class="theme-search-results-item-mask-link" href="#searchResultsItem-1" role="button" data-toggle="collapse" aria-expanded="false" aria-controls="searchResultsItem-1"></a>
      <div class="row" data-gutter="20">
        <div class="col-md-10 ">
          <div class="theme-search-results-item-flight-sections">

            <!-- stops_details -->
            {{stops_details}}
          </div>
        </div>
        <div class="col-md-2 ">
          <div class="theme-search-results-item-book">
            <div class="theme-search-results-item-price">
              <p class="theme-search-results-item-price-tag">₦{{price_details}}</p>

              <!-- cabin_details -->
              <p class="theme-search-results-item-price-sign">{{cabin_details}}</p>
            </div>
            <a class="btn btn-primary-inverse btn-block theme-search-results-item-price-btn" href="#">Book Now</a>
          </div>
        </div>
      </div>
    </div>
  </div>
`

const stopsMarkup = `
  <div class="theme-search-results-item-flight-section">
    <div class="row row-no-gutter row-eq-height">
      <div class="col-md-2 ">
        <div class="theme-search-results-item-flight-section-airline-logo-wrap">
          <img class="theme-search-results-item-flight-section-airline-logo" src="./img/351x253.png" alt="Image Alternative text" title="Image Title" />
        </div>
      </div>
      <div class="col-md-10 ">
        <div class="theme-search-results-item-flight-section-item">
          <div class="row">
            <!-- departure_details -->
            {{departure_details}}

            <!-- airport_details -->
            {{airport_details}}

            <!-- arrival_details -->
            {{arrival_details}}
          </div>
        </div>
      </div>
    </div>

    <!-- airline_details -->
    <h5 class="theme-search-results-item-flight-section-airline-title">Operated by {{airline_name}}</h5>
  </div>
`;

const departureMarkup = `
  <div class="col-md-3 ">
    <div class="theme-search-results-item-flight-section-meta">
      <p class="theme-search-results-item-flight-section-meta-time">{{time}}
        <span>{{daytime}}</span>
      </p>
      <p class="theme-search-results-item-flight-section-meta-city">{{city}}</p>
      <p class="theme-search-results-item-flight-section-meta-date">{{date}}</p>
    </div>
  </div>
`;

const airportMarkup = `
  <div class="col-md-6 ">
    <div class="theme-search-results-item-flight-section-path">
      <div class="theme-search-results-item-flight-section-path-fly-time">
        <p>{{duration}}</p>
      </div>
      <div class="theme-search-results-item-flight-section-path-line"></div>
      <div class="theme-search-results-item-flight-section-path-line-start">
        <i class="fa fa-plane theme-search-results-item-flight-section-path-icon"></i>
        <div class="theme-search-results-item-flight-section-path-line-dot"></div>
        <div class="theme-search-results-item-flight-section-path-line-title">{{departure_code}}</div>
      </div>
      <div class="theme-search-results-item-flight-section-path-line-end">
        <i class="fa fa-plane theme-search-results-item-flight-section-path-icon"></i>
        <div class="theme-search-results-item-flight-section-path-line-dot"></div>
        <div class="theme-search-results-item-flight-section-path-line-title">{{arrival_code}}</div>
      </div>
    </div>
  </div>
`