import { App } from "aws-cdk-lib";
import { Deployment, NamedEnvironment } from "../lib/deployment";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

/**
 * Build the CloudFormation templates
 * for the DEV environment.
 */
export class Dev {
  constructor(app: App) {
    const env: NamedEnvironment = {
      name: "dev",
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };

    new Deployment(app, env.name, {
      env: env,

      consoleMonitor: {
        subscriptions: [
          /**
           * These subscribers will be notified when changes are
           * made in the AWS console.
           */
          new EmailSubscription("REPLACE WITH YOUR EMAIL ADDRESS"),
        ],
      },
    });
  }
}
