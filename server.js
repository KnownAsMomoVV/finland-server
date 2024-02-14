const { OPCUAServer, Variant, DataType, StatusCodes } = require("node-opcua");
const fs = require("fs");
const os = require("os");

// Improved function to read device data from JSON file
// Moved inside the getter to ensure it reads the latest data
function readDeviceData() {
    const rawData = fs.readFileSync('deviceData.json');
    return JSON.parse(rawData);
}

(async () => {
    const server = new OPCUAServer({
        port: 4334,
        resourcePath: "/UA/MyLittleServer",
        buildInfo: {
            productName: "MySampleServer1",
            buildNumber: "7658",
            buildDate: new Date(2014, 5, 2)
        }
    });

    await server.initialize();
    console.log("initialized");

    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();

    const device = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "MyDevice"
    });

    // Temperature variable with dynamic reading from JSON
    namespace.addVariable({
        componentOf: device,
        browseName: "Temperature",
        nodeId: "ns=1;s=Temperature",
        dataType: "Double",
        value: {
            get: () => {
                const data = readDeviceData(); // Read the latest data from JSON
                return new Variant({ dataType: DataType.Double, value: data.temperature });
            }
        }
    });

    // Running Time variable with dynamic reading from JSON
    namespace.addVariable({
        componentOf: device,
        browseName: "RunningTime",
        nodeId: "ns=1;s=RunningTime",
        dataType: "Double",
        value: {
            get: () => {
                const data = readDeviceData(); // Read the latest data from JSON
                return new Variant({ dataType: DataType.Double, value: data.runningTime });
            }
        }
    });

    // Job List variable with dynamic reading from JSON
    namespace.addVariable({
        componentOf: device,
        browseName: "JobList",
        nodeId: "ns=1;s=JobList",
        dataType: "String",
        value: {
            get: () => {
                const data = readDeviceData(); // Read the latest data from JSON
                return new Variant({ dataType: DataType.String, value: JSON.stringify(data.jobList) });
            }
        }
    });

    server.start(function () {
        console.log("Server is now listening ... (press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log("the primary server endpoint url is ", endpointUrl);
    });
})();
