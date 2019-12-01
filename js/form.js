$(document).ready(function () {
  $('form').submit(async function (e) {
    e.preventDefault();
    const _this = $(this)[0];
    const form = new FormData(_this);
    const inputs = {};

    for (let [key, value] of form.entries()) {
      const check = validateInput(key, value);
      const datePicker = ['depart', 'return'].includes(key);
      const selector = datePicker ? `${key}_date` : key;
      const element = $(`[name="${selector}"]`)[0];
      if(checksFail(check, element, key)) return;

      value = await executeIATA(key, value);
      if(noFlyZone(key, value, element)) return;

      inputs[key] = value;
    }
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

async function executeIATA(key, value) {
  if (['destination_city', 'departure_city'].includes(key)) {
    const [city, , country] = value.split(', ');
    return await getIATA(city, country);
  }
  return value;
}

function resetCustomValidity(element) {
  element.setCustomValidity('');
};

function noFlyZone(key, value, element) {
  if (['destination_city', 'departure_city'].includes(key) && value === '') {
    $(element).parent().one('click', () => resetCustomValidity(element));
    element.setCustomValidity(`This is a NO-FLY-ZONE`);
    element.focus();
    return true;
  }
}

function getIATA(city, country) {
  return new Promise((resolve, reject) => {
    $.getJSON('IATA.json', function(data) {
      const code = data.find(obj => obj.city === city && obj.country === country) || {};
      resolve(code.iata || '');
      reject(city);
    });
  });
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
      return typeof input === 'string' && ['economy', 'business'].includes(input);
    case 'no_of_adult':
      return (/[1-9][\d]* Adult[s]?/).test(input);
    case 'no_of_child':
      return (/[0-9][\d]* Child[dren]?/).test(input);
    case 'no_of_infant':
      return (/[0-9][\d]* Infant[s]?/).test(input);
    default: return false;
  }
}