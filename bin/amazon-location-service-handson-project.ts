#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AmazonLocationServiceHandsonProjectStack } from '../lib/amazon-location-service-handson-project-stack';

const app = new cdk.App();
new AmazonLocationServiceHandsonProjectStack(app, 'AmazonLocationServiceHandsonProjectStack', {

});