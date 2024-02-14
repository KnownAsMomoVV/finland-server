const express = require('express');
const cors = require('cors');
const { OPCUAClient, AttributeIds } = require("node-opcua-client");
const app = express();
const port = 3001; // Ensure this port is free or use a different one

app.use(cors()); // Enable CORS to allow your React app to make requests

async function readTemperatureFromOPCUA() {
    const client = OPCUAClient.create({ endpoint_must_exist: false });
    await client.connect("opc.tcp://Momos-MacBook-Air.local:4334/UA/MyLittleServer");
    const session = await client.createSession();
    const nodeId = "ns=1;s=Temperature"; // Adjust the nodeId if necessary
    const dataValue = await session.read({ nodeId, attributeId: AttributeIds.Value });
    await session.close();
    await client.disconnect();
    return dataValue.value.value;
}

app.get('/temperature', async (req, res) => {
    try {   
        const temperature = await readTemperatureFromOPCUA();
        res.json({ temperature });
    } catch (error) {
        console.error("Failed to fetch temperature from OPC UA server:", error);
        res.status(500).send('Error fetching temperature');
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
