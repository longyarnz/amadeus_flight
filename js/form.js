$(document).ready(function () {
  $('form').submit(function (e) {
    e.preventDefault();
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
      if (noFlyZone(key, value, element)) return;

      inputs[key] = value;
    }

    sendRequest(inputs);
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
    const [, code] = value.split(', ');
    return code;
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

function noFlyZone(key, value, element) {
  if (/(destination_city|departure_city)/.test(key) && value === '') {
    $(element).parent().one('click', () => resetCustomValidity(element));
    element.setCustomValidity(`This is a NO-FLY-ZONE`);
    element.focus();
    return true;
  }
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
  const URL = 'http://www.ije-api.tcore.xyz/v1/auth/login';
  const body = JSON.stringify({
    body: {
      email: 'customer@travelportal.com',
      password: 'customer'
    }
  });

  try {
    let login = await fetch(URL, {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    login = await login.json();
    console.log(login);
  }
  catch (err) {
    console.log(err);
  }
}

async function sendRequest(inputs) {
  const URL = 'http://www.ije-api.tcore.xyz/v1/flight/search-flight';
  const { departure_city, destination_city, departure_date, return_date, ...search_param } = inputs;
  const body = JSON.stringify({
    header: {
      cookie: ''
    },
    body: {
      origin_destinations: [{
        departure_city, destination_city, departure_date, return_date,
      }],
      search_param: {
        preferred_airline_code: 'EK', calendar: true, ...search_param
      }
    }
  });
  
  try {
    let flights = await fetch(URL, { 
      method: 'POST',
      body,
      headers: { 
        'Content-Type': 'application/json'
      }, 
    });
    flights = await flights.json();
    console.log(flights);
  }
  catch (err) {
    console.log(err)
  }
}