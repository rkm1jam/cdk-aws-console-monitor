#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Dev } from "../deployments/dev";

const app = new cdk.App();

new Dev(app);
