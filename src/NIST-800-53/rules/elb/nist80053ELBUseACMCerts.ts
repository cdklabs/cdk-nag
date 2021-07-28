/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { LoadBalancer } from '@aws-cdk/aws-elasticloadbalancing';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Elasticsearch service domains have encryption at rest enabled - (Control IDs: SC-13, SC-28)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  
  if (node instanceof LoadBalancer) {
    //For each listener, ensure that it's utilizing an ACM SSL/HTTPS cert
    const listeners = Stack.of(node).resolve(node.Listeners);
    if (listeners != undefined) {
      //Iterate through listeners, checking if secured ACM certs are used
      for (const listener of listeners) {
        const listenerARN = listener.SSLCertificateId;
        const listenerProtocol = listener.procol;
        //Use the ARN to check if this is an ACM managed cert
        if(listenerARN.substr(0,11) != "arn:aws:acm"){
          return false;
        }
        if(listenerProtocol != "HTTPS" && listenerProtocol != "SSL"){
          return false;
        }
      }
    }
  }
  return true;
}
