const lineNotifyToken: string = String(process.env.LINE_NOTIFY_TOKEN);
import axios from 'axios';
import * as qs from 'querystring';

exports.sendNotificationHandler = async function (event: any, context: any) {
    console.log('event:', JSON.stringify(event, null, 2));
    console.log('context:', JSON.stringify(context, null, 2));
  
    console.log(event.detail);
    const message: string = await createMessage(event.detail);
    const result: boolean = await sendNotifyMessage(lineNotifyToken, message);
    if (result) {
      return {
        statusCode: 200,
        body: JSON.stringify(
          {
            message: 'Line Notify Send Successful.',
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
            message: 'Line Notify Send Error.',
          },
          null,
          2
        ),
      };
    }
  };

  async function createMessage(eventDetail: any): Promise<string> {
    // GeoHenceID
    const geoFenceId = eventDetail.GeofenceId;
    let geoFenceName = '';
    if (geoFenceId == 'sampleGeoFence001') {
        geoFenceName == '東京駅';
    } else if (geoFenceId == 'sampleGeoFence002') {
        geoFenceName == '銀座駅';
    } else {
        geoFenceName == geoFenceName;
    }
    
    const eventType = eventDetail.EventType;
    let eventName = '';
    if (eventType == 'ENTER') {
      eventName = 'に到着します。';
    } else {
      eventName = 'を出発しました。';
    }
    return `${eventDetail.DeviceId} が ${geoFenceName}${eventName} 現在位置: https://www.google.com/maps?q=${eventDetail.Position[1]},${eventDetail.Position[0]}`;
  }
  async function sendNotifyMessage(
    lineNotifyToken: String,
    message: string
  ): Promise<boolean> {
    const lineNotifyUrl = 'https://notify-api.line.me/api/notify';
    // リクエスト設定
    const payload: { [key: string]: string } = {
      message: message,
    };
  
    console.log('payload:', JSON.stringify(payload, null, 2));
    const config = {
      url: lineNotifyUrl,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${lineNotifyToken}`,
      },
      data: qs.stringify({
        message: message,
      }),
    };
    // メッセージ送信
    try {
      const result = await axios.request(config);
      console.log(result);
      if (result.data.message === 'ok') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  