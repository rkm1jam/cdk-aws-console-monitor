# Monitor Changes in the AWS Console

This just deploys Matthew Harper's Python Lambda using CDK.
Details:
https://towardsdatascience.com/protect-your-infrastructure-with-real-time-notifications-of-aws-console-user-changes-3144fd18c680

# Usage

Add subscribers in `deployments/dev.ts`. These will be notified whenever
a change is made in the AWS console. This helps detect if infrastructure
is being changed without using IaC such as Terraform, CDK or CloudFormation.

Deploy with `npx cdk deploy dev/console-monitor`.
