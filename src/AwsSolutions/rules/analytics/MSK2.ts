/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster, ClientBrokerEncryption } from '@aws-cdk/aws-msk';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * MSK clusters only uses TLS communication between clients and brokers
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnCluster) {
    const encryptionInfo = Stack.of(node).resolve(node.encryptionInfo);
    if (encryptionInfo != undefined) {
      const encryptionInTransit = Stack.of(node).resolve(
        encryptionInfo.encryptionInTransit
      );
      if (encryptionInTransit != undefined) {
        const clientBroker = Stack.of(node).resolve(
          encryptionInTransit.clientBroker
        );
        if (
          clientBroker != undefined &&
          clientBroker != ClientBrokerEncryption.TLS
        ) {
          return false;
        }
      }
    }
  }
  return true;
}
