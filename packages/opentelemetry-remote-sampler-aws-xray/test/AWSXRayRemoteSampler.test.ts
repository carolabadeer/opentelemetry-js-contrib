/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as sinon from 'sinon';
import axios from 'axios';
import * as nock from 'nock';
import * as assert from 'assert';

import { AWSXRayRemoteSampler } from "../src";

describe('GetSamplingRules', () => {
    const getSamplingRulesResponseStub: any = {
        "NextToken": null,
        "SamplingRuleRecords": [
            {
                "CreatedAt": 1.67799933E9,
                "ModifiedAt": 1.67799933E9,
                "SamplingRule": {
                    "Attributes": {
                        "foo": "bar",
                        "doo": "baz"
                    },
                    "FixedRate": 0.05,
                    "HTTPMethod": "*",
                    "Host": "*",
                    "Priority": 1000,
                    "ReservoirSize": 10,
                    "ResourceARN": "*",
                    "RuleARN": "arn:aws:xray:us-west-2:123456789000:sampling-rule/Rule1",
                    "RuleName": "Rule1",
                    "ServiceName": "*",
                    "ServiceType": "AWS::Foo::Bar",
                    "URLPath": "*",
                    "Version": 1
                }
            },
            {
                "CreatedAt": 0.0,
                "ModifiedAt": 1.611564245E9,
                "SamplingRule": {
                    "Attributes": {},
                    "FixedRate": 0.05,
                    "HTTPMethod": "*",
                    "Host": "*",
                    "Priority": 10000,
                    "ReservoirSize": 1,
                    "ResourceARN": "*",
                    "RuleARN": "arn:aws:xray:us-west-2:123456789000:sampling-rule/Default",
                    "RuleName": "Default",
                    "ServiceName": "*",
                    "ServiceType": "*",
                    "URLPath": "*",
                    "Version": 1
                }
            },
            {
                "CreatedAt": 1.676038494E9,
                "ModifiedAt": 1.676038494E9,
                "SamplingRule": {
                    "Attributes": {},
                    "FixedRate": 0.2,
                    "HTTPMethod": "GET",
                    "Host": "*",
                    "Priority": 1,
                    "ReservoirSize": 10,
                    "ResourceARN": "*",
                    "RuleARN": "arn:aws:xray:us-west-2:123456789000:sampling-rule/Rule2",
                    "RuleName": "Rule2",
                    "ServiceName": "FooBar",
                    "ServiceType": "*",
                    "URLPath": "/foo/bar",
                    "Version": 1
                }
            }
        ]
    };

    let clock: sinon.SinonFakeTimers;
    let sampler: AWSXRayRemoteSampler;

    before(() => {
        nock('http://127.0.0.1:2000')
            .persist()
            .post('/GetSamplingRules')
            .reply(200, getSamplingRulesResponseStub);

   
    });

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });


    it('should make a POST request to the /GetSamplingRules endpoint', async () => {
        const axiosPostSpy = sinon.spy(axios, 'post');
        sampler = new AWSXRayRemoteSampler('http://127.0.0.1:2000', 60 * 1000);  
   
        clock.tick(60 * 1000);
        sinon.assert.calledOnce(axiosPostSpy);

    });

    it('should initialize endpoint and polling interval correctly', async () => {
        sampler = new AWSXRayRemoteSampler('http://127.0.0.1:2000', 60 * 1000);  
   
        assert.equal(sampler.getEndpoint(), "http://127.0.0.1:2000");
        assert.equal(sampler.getPollingInterval(), 60 * 1000);

    });

    it('should fall back to default polling interval if not specified', async () => {
        sampler = new AWSXRayRemoteSampler('http://127.0.0.1:2000');  

        assert.equal(sampler.getPollingInterval(), 5* 60 * 1000);

    });

});