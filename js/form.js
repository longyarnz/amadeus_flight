const isNotResultPage = location.pathname !== '/results.html';

$(document).ready(function () {
  $('form').submit(async function (e) {
    e.preventDefault();
    const isSubmitting = localStorage.getItem('amadeus_isSubmitting') === 'true';
    if (isSubmitting) return;
    else {
      localStorage.setItem('amadeus_isSubmitting', 'true');
      $('form button').text('Searching...');
      !isNotResultPage && $('.theme-loading').css('display', 'block');
      !isNotResultPage && $('.theme-page-section').css('display', 'none');
    }

    const _this = $(this)[0];
    const form = new FormData(_this);
    const inputs = {};

    for (let [key, value] of form.entries()) {
      const check = validateInput(key, value);
      const datePicker = /(depart|return)/.test(key);
      const selector = datePicker ? `${key}_date` : key;
      const element = $(`[name="${selector}"]`)[0];
      if (checksFail(check, element, key)) return;
      value = extractSearchParams(key, value);
      value = getIATA(key, value);
      inputs[key] = value;
    }

    const cookie = await checkAuthorization();
    sendRequest(inputs, cookie);
  });
})

function checksFail(check, element, key) {
  if (!check) {
    $(element).parent().one('click', () => resetCustomValidity(element));
    element.setCustomValidity(`Error: check your ${key} info.`);
    element.focus();
    return true;
  }
}

function getIATA(key, value) {
  if (/(destination_city|departure_city)/.test(key)) {
    localStorage.setItem(key, value);
    const [, code] = value.split(', ');
    return code;
  }
  return value;
}

function getLocation(key, value) {
  if (/(destination_city|departure_city)/.test(key)) {
    value = localStorage.getItem(key);
  }
  return value;
}

function resetCustomValidity(element) {
  element.setCustomValidity('');
};

function extractSearchParams(key, value) {
  const check = /^[no_of_]/.test(key);
  if (check) {
    const number = parseInt(value.split(' ')[0]);
    return number;
  }
  return value;
}

function populateParams(key, value) {
  const check = /^[no_of_]/.test(key);
  if (check) {
    let text = key.slice(6);
    text = text.startsWith('a') && value > 1 ? 'Adults' : text.startsWith('a') ? 'Adult' : text;
    text = text.startsWith('c') && value > 1 ? 'Children' : text.startsWith('c') ? 'Child' : text;
    text = text.startsWith('i') && value > 1 ? 'Infants' : text.startsWith('i') ? 'Infant' : text;
    value = `${value} ${text}`;
  }
  return value;
}

function validateInput(key, input) {
  switch (key) {
    case 'departure_city':
    case 'destination_city':
    case 'departure_date':
    case 'return_date':
      return typeof input === 'string';
    case 'departure':
    case 'return':
      return typeof input === 'object';
    case 'cabin':
      return typeof input === 'string' && /(All|Economy|Business|First|Premium)/.test(input);
    case 'no_of_adult':
      return (/[0-9][\d]* Adult[s]?/).test(input);
    case 'no_of_child':
      return (/[0-9][\d]* Child[dren]?/).test(input);
    case 'no_of_infant':
      return (/[0-9][\d]* Infant[s]?/).test(input);
    default: return false;
  }
}

async function checkAuthorization() {
  let login;
  const amadeus_cookie = localStorage.getItem('amadeus_cookie');
  if (amadeus_cookie) return amadeus_cookie;

  const URL = 'http://www.ije-api.tcore.xyz/v1/auth/login';
  const body = JSON.stringify({
    body: {
      email: 'customer@travelportal.com',
      password: 'customer'
    }
  });

  try {
    login = await fetch(URL, {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    login = await login.json();
    login = login.body.data.api_token;
    localStorage.setItem('amadeus_cookie', login);
  }
  catch (err) {
    console.log(err);
  }
  finally {
    return login;
  }
}

async function sendRequest(inputs, cookie) {
  const URL = 'http://www.ije-api.tcore.xyz/v1/flight/search-flight';
  const { departure_city, destination_city, departure_date, return_date, ...search_param } = inputs;
  const body = JSON.stringify({
    header: { cookie },
    body: {
      origin_destinations: [{
        departure_city, destination_city, departure_date, return_date,
      }],
      search_param: {
        preferred_airline_code: '', calendar: false, ...search_param
      }
    }
  });

  let flights;
  localStorage.removeItem('amadeus_flight');
  $('.theme-search-results').html('');
  updateSearchTitleHeader('searching');
  
  try {
    flights = await fetch(URL, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    const { status } = flights;
    flights = await flights.json();
    localStorage.setItem('amadeus_flight', JSON.stringify(flights.body));
    localStorage.setItem('amadeus_inputs', JSON.stringify(inputs));
    populateFields(status);
    renderFlightData(status);
  }
  catch (err) {
    console.log(err);
    updateSearchTitleHeader('failed');
  }
  finally {
    $('form button').text(isNotResultPage ? 'Search' : 'Edit');
    !isNotResultPage && $('.theme-loading').css('display', 'none');
    !isNotResultPage && $('.theme-page-section').css('display', 'block');
    localStorage.removeItem('amadeus_isSubmitting');
    isNotResultPage && location.assign('results.html');
  }
}