$(document).ready(function () {
  $('form').submit(function (e) {
    e.preventDefault();
    const _this = $(this)[0];
    const form = new FormData(_this);
    const inputs = {};
    for (const [key, value] of form.entries()) {
      const check = validateInput(key, value);
      const datePicker = ['depart', 'return'].includes(key);
      const selector = datePicker ? `pseudo_${key}` : key;
      const element = $(`[name="${selector}"]`)[0];
      if (!check) {
        console.log(check, [element]);
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
  console.log(element);
  element.setCustomValidity('');
};

function validateInput(key, input) {
  console.log(key, input);
  switch (key) {
    case 'departure':
    case 'destination':
    case 'pseudo_depart':
    case 'pseudo_return':
      return typeof input === 'string';
    case 'depart':
    case 'return':
      return typeof input === 'object';
    case 'cabin':
      return typeof input === 'string' && ['economy', 'business'].includes(input);
    case 'adults':
      return (/[1-9][\d]* Adult[s]?/).test(input);
    case 'children':
      return (/[0-9][\d]* Child[dren]?/).test(input);
    case 'infants':
      return (/[0-9][\d]* Infant[s]?/).test(input);
    default: return false;
  }
}