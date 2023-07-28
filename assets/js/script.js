async function getCurrencyValues(currency) {
    try {
        // the API URL
        const url = `https://mindicador.cl/api/${currency}`;

        // get data from API
        return await fetch(url)
            .then(res => res.json())
            .then(data => data.serie);

    } catch(error) {
        // in case of not getting value, returning false. This be handled otherwhere
        return false;
    }
}

async function howMany(inputMoney, currencyTarget) {
    const factor = await getCurrencyValues(currencyTarget);

    if (!factor) {
        return 'There is no data. Sorry';
    }

    return inputMoney / factor[0].valor;
}

async function createGraph(currency) {
    const currencyData = await getCurrencyValues(currency)
        .then(data => data.slice(0, 10));

    const dates = currencyData.map(entry => entry.fecha.split('T')[0]);
    const currencyValue = currencyData.map(entry => entry.valor);

    const chartContainer = document.getElementById('graph-section');
    const canvas = document.createElement('canvas');

    const width = document.getElementById('converter').clientWidth;
    canvas.width = width;
    canvas.height = Math.round(width * 0.5);

    !chartContainer.firstElementChild 
        ? chartContainer.appendChild(canvas)
        : chartContainer.replaceChild(canvas, chartContainer.firstElementChild);

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates.reverse(),
            datasets: [{
                label: `Last Ten Days ${currency} appreciation`,
                data: currencyValue.reverse(),
            }],
        },
    });
}

document.getElementById('convert-btn').addEventListener('click', async () => {
    const currencyInput = parseInt(document.getElementById('user-cash').value);
    const targetCurrency = document.getElementById('currency-selector').value;
    const showDiv = document.getElementById('show-converted');
    let symbol;
    switch (targetCurrency) {
        case 'euro':
            symbol = '€';
            break;
        case 'uf':
            symbol = 'UF';
            break;
        default:
            symbol = '$';
    }
    showDiv.innerHTML = '';

    await howMany(currencyInput, targetCurrency).then((output) => {
        typeof output === 'number'
            ? showDiv.appendChild(
                  document.createTextNode(
                      `You have ${symbol}${output.toFixed(2)}`,
                  ),
              )
            : showDiv.appendChild(document.createTextNode(output));
    });

    await createGraph(targetCurrency);
});
