import { App, Environment, Stage, StageProps } from "aws-cdk-lib";
import { ConsoleMonitorStack } from "./console-monitor-stack";
import { ITopicSubscription } from "aws-cdk-lib/aws-sns";
import { constants, getGlobalTags } from "../bin/constants";

export interface DeploymentProps extends StageProps {
  env: NamedEnvironment;

  consoleMonitor: {
    /**
     * Subscriptions to be notified when changes
     * are made manually in the AWS console.
     */
    subscriptions: ITopicSubscription[];
  };
}

export class Deployment extends Stage {
  public constructor(scope: App, id: string, props: DeploymentProps) {
    super(scope, id);

    const descriptionPrefix = `/${props.env.name}/${constants.product}/${constants.component}`;

    new ConsoleMonitorStack(this, "console-monitor", {
      env: props.env,
      stackName: `${props.env.name}-console-monitor`,
      description: `${descriptionPrefix}/Monitor changes made via the AWS console`,
      subscriptions: props.consoleMonitor.subscriptions,
      tags: getGlobalTags(props.env),
    });
  }
}

export interface NamedEnvironment extends Environment {
  /**
   * A short name for the deployment environment
   * e.g. "dev", "qa", "prod"
   */
  name: string;
}
