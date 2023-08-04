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
    try {
        let factor = 0;

        if (currencyTarget === 'bitcoin') {
            const dollars = await getCurrencyValues('dolar');
            const bitcoins = await getCurrencyValues(currencyTarget);

            const indices = getCommonDate(bitcoins, dollars);

            factor = bitcoins[indices[0]].valor * dollars[indices[1]].valor
        } else {
            factor = await getCurrencyValues(currencyTarget).then(data => data[0].valor);
        }

        return !factor ? 'Sorry, there is no data' : inputMoney / factor;
    } catch(error) {
        return `Sorry, something went wrong.`;
    }
}

async function createGraph(currency, targetDays = 10) {
    const currencyData = await getCurrencyValues(currency)
        .then(data => data.slice(0, targetDays));

    const dates = currencyData.map(entry => entry.fecha.split('T')[0]);
    const currencyValue = currencyData.map(entry => entry.valor);

    const chartContainer = document.getElementById('graph-section');
    const canvas = document.createElement('canvas');

    const width = document.getElementById('converter').clientWidth;
    canvas.width = Math.round(width * 0.9);
    canvas.height = Math.round(width * 0.5);

    !chartContainer.firstElementChild 
        ? chartContainer.appendChild(canvas)
        : chartContainer.replaceChild(canvas, chartContainer.firstElementChild);

    let yAxisLabel = '';

    currency === 'bitcoin' ?  yAxisLabel = 'USD' :  yAxisLabel = 'CLP';

    new Chart(canvas, {
        type: 'line',
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Fluctuation over the last 10 recorded days',
                        color: 'white',
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: yAxisLabel,
                        color: 'white',
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                },
            },
        },
        data: {
            labels: dates.reverse(),
            datasets: [{
                label: `Last Ten Days ${currency} appreciation`,
                data: currencyValue.reverse(),
                color: 'white',
            }],
        },
    });
}

function getCommonDate(arr1, arr2) {
    let [i, j] = [-1, -1]

    outer:
    for (let el1 of arr1) {
        for (let el2 of arr2) {
            if (el1.fecha === el2.fecha) {
                i = arr1.indexOf(el1);
                j = arr2.indexOf(el2);
                break outer;
            }
        }
    }

    return [i, j];
}

document.getElementById('convert-btn').addEventListener('click', async () => {
    const currencyInput = parseInt(document.getElementById('user-cash').value);
    const targetCurrency = document.getElementById('currency-selector').value;
    const showDiv = document.getElementById('show-converted');

    if (!currencyInput) {
        showDiv.appendChild(document.createTextNode('Hey, are you forgetting something?'));
        return;
    }

    document.getElementById('user-cash').value = '';

    let symbol;
    switch (targetCurrency) {
        case 'euro':
            symbol = '€';
            break;
        case 'uf':
            symbol = 'UF';
            break;
        case 'bitcoin':
            symbol = '\u20bf'
            break;
        default:
            symbol = '$';
    }
    showDiv.innerHTML = '';

    await howMany(currencyInput, targetCurrency).then((output) => {
        typeof output === 'number'
            ? targetCurrency === 'bitcoin'
                ? showDiv.appendChild(
                    document.createTextNode(
                        `The $${currencyInput.toLocaleString('es-CL')} are equivalent to ${symbol}${output.toLocaleString('es-CL')}`,
                    ),
                )
                : showDiv.appendChild(
                    document.createTextNode(
                        `The $${currencyInput.toLocaleString('es-CL')} are equivalent to ${symbol}${output.toLocaleString('es-CL')}`
                    )
                )
            : showDiv.appendChild(document.createTextNode(output));
    });

    await createGraph(targetCurrency);
});
