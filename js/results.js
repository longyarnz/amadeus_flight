$(document).ready(function () {
  populateFields();
})

function populateFields() {
  let data = localStorage.getItem('amadeus_inputs');
  if (!data) return;

 data = JSON.parse(data);
 console.info(data);
}