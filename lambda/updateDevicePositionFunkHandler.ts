import {
  LocationClient,
  BatchUpdateDevicePositionCommand,
} from "@aws-sdk/client-location";

async function putDevicePostion(lon: string, lat: string, deviceId: string) {
  const trackerName: string = String(
    process.env.AMAZON_LOCATION_SERVICE_TRACKER_NAME
  );
  const config: any = { region: "ap-northeast-1" };
  const location = new LocationClient([config]);
  const input = {
    TrackerName: trackerName,
    Updates: [
      {
        // DevicePositionUpdate
        DeviceId: deviceId,
        SampleTime: new Date(),
        Position: [Number(lon), Number(lat)],
      },
    ],
  };
  console.log(
    "batchUpdateDevicePosition param:",
    JSON.stringify(input, null, 2)
  );
  try {
    const command = new BatchUpdateDevicePositionCommand(input);
    const response = await location.send(command);
    console.log(
      "batchUpdateDevicePosition result:",
      JSON.stringify(response, null, 2)
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

exports.handler = async function (event: any, context: any) {
  console.log("event:", JSON.stringify(event, null, 2));
  console.log("context:", JSON.stringify(context, null, 2));
  /**
   * eventから緯度・経度を取得
   */
  const lat: string = event.lat;
  const lon: string = event.lon;
  if (lat && lon) {
    // DeviceIdとしてカスタムヘッダーのx-soracom-device-nameにセットされてきた値を利用
    const deviceName = String(process.env.SORACOM_GPS_MULTI_UNIT_NAME);
    const result = await putDevicePostion(lon, lat, deviceName);
    if (result) {
      return {
        statusCode: 200,
        body: JSON.stringify(
          {
            message: "Device Position Update Successful!",
          },
          null,
          2
        ),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify(
          {
            message: "Device Position Update Failed!",
          },
          null,
          2
        ),
      };
    }
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Device Position Not Update Reason: latitude && longitude None",
        },
        null,
        2
      ),
    };
  }
};
