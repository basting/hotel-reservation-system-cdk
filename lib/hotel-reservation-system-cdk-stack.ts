import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib/core';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class HotelReservationSystemCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'HRSVPC', {
      maxAzs: 2,
    });

    // Create an ECS Cluster with EC2 instances
    const cluster = new ecs.Cluster(this, 'HRSCluster', {
      vpc,
    });

    // Add EC2 capacity to the cluster
    cluster.addCapacity('HRSEcsCapacity', {
      instanceType: new ec2.InstanceType('t2.micro'),
      minCapacity: 1,
      maxCapacity: 2,
    });

    // Create an ECS task definition
    const taskDefinition = new ecs.TaskDefinition(this, 'HRSTaskDefinition', {
      compatibility: ecs.Compatibility.EC2,
    });

    // Define a container
    taskDefinition.addContainer('HRSAppContainer', {
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/d8v8d4j4/hotel-reservation-system:latest'),
      memoryLimitMiB: 512,
      portMappings: [{ containerPort: 80 }],
    });

    // Create an ECS service with EC2 launch type
    new ecs.Ec2Service(this, 'HRSEcsService', {
      cluster,
      taskDefinition,
      serviceName: 'HRS-ECS-Service'
    });
  }
}
