$(document).ready(function () {
  populateFields();
})

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