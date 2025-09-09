// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
/** @import {EMC, EventListenerOrFn} from './ts-refs/trans-render/be/types' */
/** @import {Actions, PAP,  AP} from './ts-refs/be-invoking/types' */;

const targetsPart = String.raw `^(?<targetPart>.*)`;
const targetsPartOnEventType = String.raw `${targetsPart} on (?<localEventType>.*)`;

/**
 * @type {Array<[string, string]>}
 */
const dssKeys = [['targetPart', 'remoteSpecifier']];

/**
 * @type {Partial<EMC<any, AP>>}
 */
export const emc = {
    base: 'do-invoke',
    map: {
        '0.0': {
            instanceOf: 'Object$entences',
            objValMapsTo: '.',
            regExpExts: {
                parsedStatements: [
                    {
                        regExp: targetsPartOnEventType,
                        defaultVals: {},
                        dssKeys,
                    },
                    {
                        regExp: targetsPart,
                        defaultVals: {},
                        dssKeys,
                    }
                ]
            }
        }
    },
    enhPropKey: 'beInvoking',
    importEnh: async () => {
        const { DoInvoke} = await import('./do-invoke.js');
        return DoInvoke;
    }
};
const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);
