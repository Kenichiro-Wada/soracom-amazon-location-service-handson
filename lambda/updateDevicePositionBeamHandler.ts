import {
  LocationClient,
  BatchUpdateDevicePositionCommand,
} from "@aws-sdk/client-location";

import { Buffer } from "buffer";
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
exports.gpsMultiUnitHandler = async function (event: any, context: any) {
  console.log("event:", JSON.stringify(event, null, 2));
  console.log("context:", JSON.stringify(context, null, 2));
  /**
   * bodyから緯度・経度を取得
   */
  const bodyJson: any = JSON.parse(event.body);
  const lat: string = bodyJson.lat;
  const lon: string = bodyJson.lon;
  // DeviceIdとしてカスタムヘッダーのx-soracom-device-nameにセットされてきた値を利用
  const deviceName = event["headers"]["x-soracom-device-name"];
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
};

exports.buttonHandler = async function (event: any, context: any) {
  console.log("event:", JSON.stringify(event, null, 2));
  console.log("context:", JSON.stringify(context, null, 2));
  /**
   * headerに付与されている簡易位置情報の緯度経度「x-soracom-geo-position」を取得
   * 緯度;経度で格納されている
   */
  const position: string = event["headers"]["x-soracom-geo-position"];
  const postionArray = position.split(";"); //
  const lat: string = postionArray[0];
  const lon: string = postionArray[1];
  // DeviceIdとしてカスタムヘッダーのx-soracom-device-nameにセットされてきた値を利用
  const deviceName = event["headers"]["x-soracom-device-name"];
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
};
