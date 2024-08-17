import * as cdk from "aws-cdk-lib";
import * as geo from "aws-cdk-lib/aws-location";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class AmazonLocationServiceHandsonProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Constant
    const envSoracomGpsMultiNnitName = '[SET_YOUR_DEVICE_NAME]'; // 英数字、ハイフン(-)、アンダースコア(_)、ドット(.)のみ利用可能
    const envLineNotifyToken = '[SET_LINE_NOTIFY_TOKEN]'
    /**
     * Amazon Location Service
     */
    new geo.CfnMap(this, "AmazonLocationServiceHandsonMap", {
      mapName: "amazon-location-servicehandson-map",
      pricingPlan: "RequestBasedUsage",
      description: "Map For Amazon Location Service Handson",
      configuration: {
        style: "VectorEsriStreets",
      },
    });
    const amazonLocationServiceHandsonTracker = new geo.CfnTracker(
      this,
      "AmazonLocationServiceHandsonTracker",
      {
        trackerName: "AmazonLocationServiceHandsonTracker",
        pricingPlan: "RequestBasedUsage",
        description: "Tracker For Amazon Location Service Handson",
      }
    );
    const amazonLocationServiceHandsonPlace = new geo.CfnPlaceIndex(
      this,
      "AmazonLocationServiceHandsonPlace",
      {
        indexName: "AmazonLocationServiceHandsonPlace",
        dataSource: "Esri",
        pricingPlan: "RequestBasedUsage",
        description: "Place Index For Amazon Location Service Handson",
      }
    );
    const amazonLocationServiceHandsonRoute = new geo.CfnRouteCalculator(
      this,
      "AmazonLocationServiceHandsonRoute",
      {
        calculatorName: "AmazonLocationServiceHandsonRoute",
        dataSource: "Esri",
        pricingPlan: "RequestBasedUsage",
        description: "Route Index For Amazon Location Service Handson",
      }
    );

    const amazonLocationServiceHandsonGeoFence = new geo.CfnGeofenceCollection(
      this,
      "AmazonLocationServiceHandsonGeoFence",
      {
        collectionName: "AmazonLocationServiceHandsonGeoFence",
        pricingPlan: "RequestBasedUsage",
        description: "GeoFence For Amazon Location Service Handson",
      }
    );

    /**
     * AWS IAM
     */
    const batchUpdateDevicePositionPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ["*"],
      actions: ["geo:BatchUpdateDevicePosition"],
    });
    /**
     * AWS Lambda
     */
    // Put Device Postion From SORACOM IoT Button For SORACOM Beam
    const batchUpdateDevicePositionFromIotButton = new NodejsFunction(
      this,
      "BatchUpdateDevicePositionFromIotButton",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: "lambda/updateDevicePositionBeamHandler.ts",
        handler: "buttonHandler",
        timeout: cdk.Duration.seconds(30),
        tracing: lambda.Tracing.ACTIVE,
        description:
          "Amazon Location Service Update Device Position. From SORACOM IoT Button For Enterprise Use SORACOM Beam",
        environment: {
          AMAZON_LOCATION_SERVICE_TRACKER_NAME:
            amazonLocationServiceHandsonTracker.trackerName,
        },
      }
    );

    batchUpdateDevicePositionFromIotButton.addToRolePolicy(
      batchUpdateDevicePositionPolicyStatement
    );
    const batchUpdateDevicePositionFromIotButtonUrl = new lambda.FunctionUrl(
      this,
      "BatchUpdateDevicePositionFromIotButtonUrl",
      {
        function: batchUpdateDevicePositionFromIotButton,
        authType: lambda.FunctionUrlAuthType.NONE,
      }
    );
    new cdk.CfnOutput(this, "TheBatchUpdateDevicePositionFromIotButtonUrl", {
      value: batchUpdateDevicePositionFromIotButtonUrl.url,
    });
    // Put Device Postion From SORACOM GPS Multi Unit For SORACOM Beam
    const batchUpdateDevicePositionFromGpsMultiUnitBeam = new NodejsFunction(
      this,
      "BatchUpdateDevicePositionFromGpsMultiUnitBeam",
      {
        runtime: lambda.Runtime.NODEJS_LATEST,
        entry: "lambda/updateDevicePositionBeamHandler.ts",
        handler: "gpsMultiUnitHandler",
        timeout: cdk.Duration.seconds(30),
        tracing: lambda.Tracing.ACTIVE,
        description:
          "Amazon Location Service Update Device Position. From SORACOM GPS Mutil Unit Use SORACOM Beam",
        environment: {
          AMAZON_LOCATION_SERVICE_TRACKER_NAME:
            amazonLocationServiceHandsonTracker.trackerName,
        },
      }
    );

    batchUpdateDevicePositionFromGpsMultiUnitBeam.addToRolePolicy(
      batchUpdateDevicePositionPolicyStatement
    );
    const batchUpdateDevicePositionFromGpsMultiUnitBeamUrl =
      new lambda.FunctionUrl(
        this,
        "BatchUpdateDevicePositionFromGpsMultiUnitBeamUrl",
        {
          function: batchUpdateDevicePositionFromGpsMultiUnitBeam,
          authType: lambda.FunctionUrlAuthType.NONE,
        }
      );
    new cdk.CfnOutput(
      this,
      "TheBatchUpdateDevicePositionFromGpsMultiUnitBeamUrl",
      {
        value: batchUpdateDevicePositionFromGpsMultiUnitBeamUrl.url,
      }
    );
    // Put Device Postion From SORACOM GPS Multi Unit For SORACOM Funk
    const batchUpdateDevicePositionFromGpsMultiUnitFunk = new NodejsFunction(
      this,
      "BatchUpdateDevicePositionFromGpsMultiUnitFunk",
      {
        runtime: lambda.Runtime.NODEJS_LATEST,
        entry: "lambda/updateDevicePositionFunkHandler.ts",
        handler: "handler",
        timeout: cdk.Duration.seconds(30),
        tracing: lambda.Tracing.ACTIVE,
        description:
          "Amazon Location Service Update Device Position. From SORACOM GPS Mutil Unit Use SORACOM Funk",
        environment: {
          AMAZON_LOCATION_SERVICE_TRACKER_NAME:
            amazonLocationServiceHandsonTracker.trackerName,
          SORACOM_GPS_MULTI_UNIT_NAME: envSoracomGpsMultiNnitName
        },
      }
    );
    batchUpdateDevicePositionFromGpsMultiUnitFunk.addToRolePolicy(
      batchUpdateDevicePositionPolicyStatement
    );
    // Notify Lambda
    const geoFenceNotify = new NodejsFunction(this, 'geoFenceNotify', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      entry: "lambda/geoFenceNotifyHandler.ts",
      handler: "sendNotificationHandler",
      timeout: cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      description: 'Geo Fence Notify',
      environment: {
        LINE_NOTIFY_TOKEN: envLineNotifyToken,
      },
    });
    /**
     * SQS DLQ
     */
    const geoFenceEventsDlq = new sqs.Queue(
      this,
      'amazonLocationServiceGeoFenceEventDlq'
    );
    /**
     * EventBridge Events
     */
    const geoFenceEventsRule = new events.Rule(
      this,
      'amazonLocationServiceGeoFenceEventRule',
      {
        description: 'SORACOM x Amazon Location Service Handson Geofence EventRule',
        eventPattern: {
          source: ['aws.geo'],
          resources: [amazonLocationServiceHandsonGeoFence.attrCollectionArn],
          detailType: ['Location Geofence Event'],
        },
      }
    );
    geoFenceEventsRule.addTarget(
      new targets.LambdaFunction(geoFenceNotify, {
        deadLetterQueue: geoFenceEventsDlq,
        maxEventAge: cdk.Duration.hours(2),
        retryAttempts: 2,
      })
    );
  }
}
