import { OPCUAClient, AttributeIds } from "node-opcua";
import pg from 'pg';
const { Client } = pg;

// Setup the PostgreSQL client
const db = new Client({
    user: 'dollar',
    host: 'localhost',
    database: 'postgres',
    password: 'euro',
    port: 5432,
});

// Connect to the PostgreSQL database
db.connect();

async function readVariable(session, nodeId) {
    const maxAge = 0;
    const nodeToRead = {
        nodeId: nodeId,
        attributeId: AttributeIds.Value
    };
    console.log(`Attempting to read variable with Node ID: ${nodeId}`); // Debug log
    try {
        const dataValue = await session.read(nodeToRead, maxAge);
        if (dataValue.statusCode.name === "Good") {
            return dataValue.value.value;
        } else {
            console.error(`Failed to read ${nodeId}, Status Code: ${dataValue.statusCode.toString()}`);
            return null; // or handle differently based on your application's needs
        }
    } catch (error) {
        console.error(`Error reading ${nodeId}:`, error.message);
        return null; // Adjust based on how you want to handle read errors
    }
}

async function main() {
    const client = OPCUAClient.create({
        endpoint_must_exist: false,
    });
    const endpointUrl = "opc.tcp://localhost:4334/UA/MyLittleServer";

    await client.connect(endpointUrl);
    console.log("Connected to", endpointUrl);

    const session = await client.createSession();
    console.log("Session created");

    const readAndLogVariablesForAllMachines = async () => {
        for (let i = 0; i < 10; i++) {
            const machineId = String.fromCharCode('A'.charCodeAt(0) + i); // Adjusted to match server-side machine ID generation
            try {
                const consumptionNodeId = `ns=1;s=Machine${machineId}_Consumption`;
                const timestampNodeId = `ns=1;s=Machine${machineId}_Timestamp`;

                console.log(`Reading node ID: ${consumptionNodeId}`); // Debug log
                console.log(`Reading node ID: ${timestampNodeId}`); // Debug log

                const consumption = await readVariable(session, consumptionNodeId);
                const timestamp = await readVariable(session, timestampNodeId);
                console.log(`Machine${machineId} - Consumption: ${consumption}, Timestamp: ${timestamp}`);

                // Debug log before insertion
                console.log(`Inserting into database: Machine${machineId} - Consumption: ${consumption}, Timestamp: ${timestamp}`);

                // Write to PostgreSQL
                const insertQuery = 'INSERT INTO roboteconsumption(machineid, consumption, timestamp) VALUES($1, $2, $3)';
                await db.query(insertQuery, [machineId, consumption, timestamp]);
            } catch (err) {
                console.error(`Read failed for Machine${machineId}:`, err);
            }
        }
    };

    // Set an interval to read the variables every 10 seconds
    const intervalHandle = setInterval(readAndLogVariablesForAllMachines, 10000);

    process.on('SIGINT', async () => {
        clearInterval(intervalHandle);
        await session.close();
        await client.disconnect();
        console.log("Interrupted by user, disconnected from server");
        await db.end(); // Close the PostgreSQL connection
        process.exit(0);
    });
}

main().then(() => {
    console.log("Client started");
}).catch((err) => {
    console.error("An error has occurred", err);
});
