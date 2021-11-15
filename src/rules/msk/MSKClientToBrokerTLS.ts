/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster, ClientBrokerEncryption } from '@aws-cdk/aws-msk';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * MSK clusters only uses TLS communication between clients and brokers
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnCluster) {
      const encryptionInfo = Stack.of(node).resolve(node.encryptionInfo);
      if (encryptionInfo != undefined) {
        const encryptionInTransit = Stack.of(node).resolve(
          encryptionInfo.encryptionInTransit
        );
        if (encryptionInTransit != undefined) {
          const clientBroker = resolveIfPrimitive(
            node,
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
  },
  'name',
  { value: parse(__filename).name }
);
