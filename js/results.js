$(document).ready(function () {
  populateFields();
  renderFlightData();
});

function populateFields() {
  let data = localStorage.getItem('amadeus_inputs');
  if (!data) return;

  data = JSON.parse(data);
  for (const key in data) {
    let value = populateParams(key, data[key]);
    value = getLocation(key, value);
    const element = $(`[name="${key}"]`).val(value);
  }
}

function renderFlightData() {
  let data = localStorage.getItem('amadeus_flight');
  if (!data) return;
  data = JSON.parse(data);
  data = parseData(data);
  console.log(data);

  data.flights.forEach(flight => {
    let markup = html;
    markup = renderStopsDetails(markup, flight.trips.stops);
    markup = renderCabinDetails(markup, flight.cabin);
    markup = renderPriceDetails(markup, flight.price);
    $('.theme-search-results').append(markup);
  });
}

function renderStopsDetails(html, stops) {
  const stopsHTML = stops.map(flight => {
    let markup = stopsMarkup;
    return markup;
  }).join('');

  return stopsHTML;
}

function renderDepartureDetails(departure) {
  let markup = departureMarkup;
  markup.replace()
  return departureMarkup.replace('{{cabin_details}}', cabin);
}

function renderAirportDetails() {
  return `
    <div class="col-md-6 ">
      <div class="theme-search-results-item-flight-section-path">
        <div class="theme-search-results-item-flight-section-path-fly-time">
          <p>17h 50m</p>
        </div>
        <div class="theme-search-results-item-flight-section-path-line"></div>
        <div class="theme-search-results-item-flight-section-path-line-start">
          <i class="fa fa-plane theme-search-results-item-flight-section-path-icon"></i>
          <div class="theme-search-results-item-flight-section-path-line-dot"></div>
          <div class="theme-search-results-item-flight-section-path-line-title">CLY</div>
        </div>
        <div class="theme-search-results-item-flight-section-path-line-end">
          <i class="fa fa-plane theme-search-results-item-flight-section-path-icon"></i>
          <div class="theme-search-results-item-flight-section-path-line-dot"></div>
          <div class="theme-search-results-item-flight-section-path-line-title">EWR</div>
        </div>
      </div>
    </div>
  `
}

function renderArrivalDetails() {
  return `
    <div class="col-md-3 ">
      <div class="theme-search-results-item-flight-section-meta">
        <p class="theme-search-results-item-flight-section-meta-time">01:20
          <span>pm</span>
        </p>
        <p class="theme-search-results-item-flight-section-meta-city">New York</p>
        <p class="theme-search-results-item-flight-section-meta-date">May 18, 2018</p>
      </div>
    </div>
  `
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
            <a class="btn btn-primary-inverse btn-block theme-search-results-item-price-btn" href="#">Book
              Now</a>
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
              <div class="col-md-3 ">
                <div class="theme-search-results-item-flight-section-meta">
                  <p class="theme-search-results-item-flight-section-meta-time">07:30
                    <span>pm</span>
                  </p>
                  <p class="theme-search-results-item-flight-section-meta-city">London</p>
                  <p class="theme-search-results-item-flight-section-meta-date">May 17, 2018</p>
                </div>
              </div>

              <!-- airport_details -->
              <div class="col-md-6 ">
                <div class="theme-search-results-item-flight-section-path">
                  <div class="theme-search-results-item-flight-section-path-fly-time">
                    <p>17h 50m</p>
                  </div>
                  <div class="theme-search-results-item-flight-section-path-line"></div>
                  <div class="theme-search-results-item-flight-section-path-line-start">
                    <i class="fa fa-plane theme-search-results-item-flight-section-path-icon"></i>
                    <div class="theme-search-results-item-flight-section-path-line-dot"></div>
                    <div class="theme-search-results-item-flight-section-path-line-title">CLY</div>
                  </div>
                  <div class="theme-search-results-item-flight-section-path-line-end">
                    <i class="fa fa-plane theme-search-results-item-flight-section-path-icon"></i>
                    <div class="theme-search-results-item-flight-section-path-line-dot"></div>
                    <div class="theme-search-results-item-flight-section-path-line-title">EWR</div>
                  </div>
                </div>
              </div>

              <!-- arrival_details -->
              <div class="col-md-3 ">
                <div class="theme-search-results-item-flight-section-meta">
                  <p class="theme-search-results-item-flight-section-meta-time">01:20
                    <span>pm</span>
                  </p>
                  <p class="theme-search-results-item-flight-section-meta-city">New York</p>
                  <p class="theme-search-results-item-flight-section-meta-date">May 18, 2018</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- airline_details -->
      <h5 class="theme-search-results-item-flight-section-airline-title">Operated by Virgin Atlantic Airways</h5>
    </div>
  `;

const departureMarkup = `
  <div class="col-md-3 ">
    <div class="theme-search-results-item-flight-section-meta">
      <p class="theme-search-results-item-flight-section-meta-time">{{departure_time}}
        <span>pm</span>
      </p>
      <p class="theme-search-results-item-flight-section-meta-city">London</p>
      <p class="theme-search-results-item-flight-section-meta-date">May 17, 2018</p>
    </div>
  </div>
`;