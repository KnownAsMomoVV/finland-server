import { OPCUAServer, Variant, DataType } from "node-opcua";

(async () => {
    const server = new OPCUAServer({
        port: 4334, // Your server's port
        resourcePath: "/UA/MyLittleServer",
        buildInfo: {
            productName: "MySampleServer1",
            buildNumber: "7658",
            buildDate: new Date()
        }
    });

    await server.initialize();
    console.log("Server initialized");

    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();

    // Function to add a machine with consumption and timestamp variables
    function addMachine(machineId) {
        const machine = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: `Machine${machineId}`
        });

        namespace.addVariable({
            componentOf: machine,
            browseName: "Consumption",
            nodeId: `ns=1;s=Machine${machineId}_Consumption`,
            dataType: "Double",
            value: {
                get: () => new Variant({
                    dataType: DataType.Double,
                    value: Math.random() * 100 // Random value for demonstration
                })
            }
        });

        namespace.addVariable({
            componentOf: machine,
            browseName: "Timestamp",
            nodeId: `ns=1;s=Machine${machineId}_Timestamp`,
            dataType: "String",
            value: {
                get: () => new Variant({
                    dataType: DataType.String,
                    value: new Date().toISOString() // Current timestamp
                })
            }
        });
    }

    // Create 10 machines (A to J)
    for (let i = 0; i < 10; i++) {
        addMachine(String.fromCharCode('A'.charCodeAt(0) + i));
    }

    // Function to update all machines' consumption and timestamp
    setInterval(() => {
        for (let i = 0; i < 10; i++) {
            const machineId = String.fromCharCode('A'.charCodeAt(0) + i);
            const consumptionNode = `ns=1;s=Machine${machineId}_Consumption`;
            const timestampNode = `ns=1;s=Machine${machineId}_Timestamp`;

            // Update consumption
            const consumptionVar = addressSpace.findNode(consumptionNode);
            consumptionVar.setValueFromSource(new Variant({
                dataType: DataType.Double,
                value: Math.random() * 100
            }));

            // Update timestamp
            const timestampVar = addressSpace.findNode(timestampNode);
            timestampVar.setValueFromSource(new Variant({
                dataType: DataType.String,
                value: new Date().toISOString()
            }));
        }
    }, 10000);

    server.start(function () {
        console.log("Server is now listening ... (press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log("the primary server endpoint url is ", endpointUrl);
    });
})();
