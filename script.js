let clickCount = 0;
let allCountries = [];

const countryInput = document.getElementById('country');
const suggestionsBox = document.getElementById('country-suggestions');
const countryCodeInput = document.getElementById('countryCode');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');
const zipCodeInput = document.getElementById('zipCode');
const phoneNumberInput = document.getElementById('phoneNumber');
const vatNumberInput = document.getElementById('vatNumber');
const vatUECheckbox = document.getElementById('vatUE');

function handleClick() {
  clickCount++;
  clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    if (!response.ok) {
      throw new Error('Błąd pobierania danych');
    }
    const data = await response.json();
    allCountries = data.map((c) => c.name.common).sort();
  } catch (error) {
    console.error('Wystąpił błąd:', error);
  }
}

function getCountryByIP() {
  fetch('https://get.geojs.io/v1/ip/geo.json')
    .then((response) => response.json())
    .then((data) => {
      const country = data.country;
      // TODO inject country to form and call getCountryCode(country) function
      if (country) {
        countryInput.value = country;
        getCountryCode(country);
      }
    })
    .catch((error) => {
      console.error('Błąd pobierania danych z serwera GeoJS:', error);
    });
}

function getCountryCode(countryName) {
  const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Błąd pobierania danych');
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !data[0]?.idd?.root) return;

      const countryCode = data[0].idd.root + data[0].idd.suffixes.join('');

      const option = [...countryCodeInput.options].find(
        (opt) => opt.value === countryCode
      );
      if (option) {
        option.selected = true;
      }
    })
    .catch((error) => {
      console.error('Wystąpił błąd:', error);
    });
}

countryInput.addEventListener('input', () => {
  const input = countryInput.value.toLowerCase();
  suggestionsBox.innerHTML = '';

  if (!input) return;

  const filtered = allCountries
    .filter((country) => country.toLowerCase().startsWith(input))
    .slice(0, 5);

  filtered.forEach((country) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'list-group-item-action');
    li.textContent = country;
    li.addEventListener('click', () => {
      countryInput.value = country;
      suggestionsBox.innerHTML = '';
      getCountryCode(country);
    });
    suggestionsBox.appendChild(li);
  });
});

(() => {
  document.addEventListener('click', handleClick);

  fetchAndFillCountries().then(() => {
    getCountryByIP();
  });
})();

document.addEventListener('click', (e) => {
  if (!suggestionsBox.contains(e.target) && e.target !== countryInput) {
    suggestionsBox.innerHTML = '';
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (myForm.checkValidity()) {
      myForm.submit();
    } else {
      alert('Proszę wypełnić wszystkie wymagane pola!');
    }
  }

  if (event.ctrlKey && event.key === 'r') {
    event.preventDefault();
    myForm.reset();
    alert('Formularz został zresetowany.');
  }
});

function validateZipCode(input) {
  const zipCodePattern = /^\d{2}-\d{3}$/;

  input.value = input.value.replace(/[^\d-]/g, '');

  if (input.value.length === 2 && !input.value.includes('-')) {
    input.value += '-';
  }

  if (input.value.length > 6) {
    input.value = input.value.slice(0, 6);
  }

  if (zipCodePattern.test(input.value)) {
    input.setCustomValidity('');
  } else {
    input.setCustomValidity('Kod pocztowy musi być w formacie: 00-000');
  }
}

function validatePhoneNumber(input) {
  const phonePattern = /^\d+$/;

  input.value = input.value.replace(/\D/g, '');

  if (input.value.length > 9) {
    input.value = input.value.slice(0, 9);
  }

  if (input.value.length > 0 && !phonePattern.test(input.value)) {
    input.setCustomValidity('Numer telefonu może zawierać tylko cyfry');
  } else {
    input.setCustomValidity('');
  }
}

function validateVATNumber(input) {
  if (vatUECheckbox.checked) {
    const vatPattern = /^[A-Z]{2}\d+$/i;

    input.value = input.value.toUpperCase();

    if (input.value && !vatPattern.test(input.value)) {
      input.setCustomValidity(
        'Numer VAT UE musi zaczynać się od 2 liter kodu kraju, a następnie cyfr'
      );
    } else {
      input.setCustomValidity('');
    }

    input.required = true;
  } else {
    input.required = false;
    input.setCustomValidity('');
  }
}

zipCodeInput.addEventListener('input', () => validateZipCode(zipCodeInput));
phoneNumberInput.addEventListener('input', () =>
  validatePhoneNumber(phoneNumberInput)
);
vatNumberInput.addEventListener('input', () =>
  validateVATNumber(vatNumberInput)
);
vatUECheckbox.addEventListener('change', () =>
  validateVATNumber(vatNumberInput)
);
