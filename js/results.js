$(document).ready(function () {
  populateFields();
})

function populateFields() {
  let data = localStorage.getItem('amadeus_data');
  if (!data) return;

 data = JSON.parse(data);
 console.info(data);
}