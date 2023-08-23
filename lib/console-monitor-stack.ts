import { Duration, RemovalPolicy, Stack, StackProps, Tags } from "aws-cdk-lib";
import { PolicyDocument, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");
import { NamedEnvironment } from "./deployment";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { ReadWriteType, Trail } from "aws-cdk-lib/aws-cloudtrail";
import { ITopicSubscription, Topic } from "aws-cdk-lib/aws-sns";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export interface ConsoleMonitorStackProps extends StackProps {
  env: NamedEnvironment;

  /**
   * Subscriptions to be notified when changes
   * are made manually in the AWS console.
   */
  subscriptions: ITopicSubscription[];
}

export class ConsoleMonitorStack extends Stack {
  constructor(scope: Construct, id: string, props: ConsoleMonitorStackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "cloudTrailBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      lifecycleRules: [
        {
          expiration: Duration.days(14),
        },
      ],
    });

    const topic = new Topic(this, "consoleNotificationTopic", {
      displayName: `AWS Console Notifications`,
      topicName: `${props.env.name}-console-notifications`,
    });

    for (const sub of props.subscriptions) {
      topic.addSubscription(sub);
    }

    const policy = PolicyDocument.fromJson({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Resource: "*",
          Action: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ],
        },
      ],
    });

    const role = new Role(this, "role", {
      description: `Permissions for Console Monitor Lambda`,
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        permissions: policy,
      },
    });
    bucket.grantRead(role);
    topic.grantPublish(role);

    const trail = new Trail(this, "console-monitoring-trail", {
      bucket: bucket,
      managementEvents: ReadWriteType.WRITE_ONLY,
      isMultiRegionTrail: true,
      sendToCloudWatchLogs: false,
      trailName: `${props.env.name}-console-monitoring-trail`,
    });

    Tags.of(trail).add("one:info", "monitor changes via aws console");

    new Function(this, "console-monitor", {
      runtime: Runtime.PYTHON_3_8,
      handler: "index.lambda_handler",
      code: Code.fromAsset(path.join(__dirname, "/console-monitor-lambda")),
      environment: {
        SNS_ARN: topic.topicArn,
      },
      role: role,
      description: `Send notification when changes are made via the AWS console`,
      timeout: Duration.seconds(120),
      events: [
        new S3EventSource(bucket, {
          events: [EventType.OBJECT_CREATED],
        }),
      ],
      logRetention: RetentionDays.ONE_WEEK,
    });
  }
}
