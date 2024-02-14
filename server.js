const express = require('express');
const cors = require('cors');
const { OPCUAClient, AttributeIds } = require("node-opcua-client");
const app = express();
const port = 3001; // Use a different port than your React app

app.use(cors()); // Enable CORS

async function readTemperature() {
    const client = OPCUAClient.create({ endpoint_must_exist: false });
    await client.connect("opc.tcp://localhost:4334/UA/MyLittleServer");
    const session = await client.createSession();
    const nodeId = "ns=1;s=Temperature";
    const dataValue = await session.read({ nodeId, attributeId: AttributeIds.Value });
    await session.close();
    await client.disconnect();
    return dataValue.value.value;
}

app.get('/temperature', async (req, res) => {
    try {
        const temperature = await readTemperature();
        res.json({ temperature });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading temperature');
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
