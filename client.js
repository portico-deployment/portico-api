import fetch from 'node-fetch';

const jsonData = {
    "para_id": 2100,
    "template": "parity-extended-template",
    "collators_count": 3,
    "properties": {
        "symbol": "PORT",
        "ss58": 0,
        "decimals": 12
    }
};

// URLs
const apiUrl = 'http://localhost:4000/network';

// Function to send the POST request
function sendPostRequest() {
    console.log(jsonData);
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
        .then(response => response.json())
        .then(data => {
            console.log('POST request success:', JSON.stringify(data, null, 4));

        })
        .catch(error => console.error('Error in POST request:', error));
}


// Make the POST request
sendPostRequest();
