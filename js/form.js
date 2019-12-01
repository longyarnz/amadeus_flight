$(document).ready(function () {
  $('form').submit(function (e) {
    e.preventDefault();
    const _this = $(this)[0];
    const form = new FormData(_this);
    const inputs = {};
    for (const [key, value] of form.entries()) {
      const check = validateInput(key, value);
      const datePicker = ['depart', 'return'].includes(key);
      const selector = datePicker ? `${key}_date` : key;
      const element = $(`[name="${selector}"]`)[0];
      if (!check) {
        $(element).parent().one('click', () => resetCustomValidity(element));
        element.setCustomValidity(`Error: check your ${key} info.`);
        element.focus();
        return;
      }
      inputs[key] = value;
    }
    console.info(inputs);
  });
})

function resetCustomValidity(element) {
  element.setCustomValidity('');
};

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