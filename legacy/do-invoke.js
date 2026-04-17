// @ts-check
import { BE } from 'be-enhanced/BE.js';
import { propInfo, resolved, rejected } from 'be-enhanced/cc.js';
import { dispatchEvent as de } from 'trans-render/positractions/dispatchEvent.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP, AP, BAP, InvokingParameters} from './ts-refs/do-invoke/types' */
/** @import {Specifier} from './ts-refs/trans-render/dss/types' */

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 */
class DoInvoke extends BE {
    de = de;
    /**
     * @type {BEConfig<BAP, Actions & IEnhancement, any>}
     */
    static config = {
        propInfo: {
            ...propInfo,
            invokeParamSets: {def: [{remoteSpecifier: {}}]},
            rawStatements: {},
        },
        compacts:{
            when_invokeParamSets_changes_call_hydrate: 0,
        },
        positractions: [
            resolved, rejected
        ]
    };
    //#abortControllers = [];
    /** @type {Map<Specifier, WeakRef<EventTarget>>} */
    #cache = new Map();
    /**
     * 
     * @param {BAP} self 
     * @returns 
     */
    async hydrate(self) {
        const { invokeParamSets, enhancedElement } = self;
        const { nudge } = await import('mount-observer/refid/nudge.js');
        /** @type Set<string> */
        const alreadyAdded = new Set();
        for (const parsedStatement of invokeParamSets) {
            let { localEventType } = parsedStatement;
            if (localEventType === undefined) {
                const { stdEvt } = await import('trans-render/asmr/stdEvt.js');
                localEventType = stdEvt(enhancedElement);
            }
            if(alreadyAdded.has(localEventType)) continue;
            enhancedElement.addEventListener(localEventType, this);
            alreadyAdded.add(localEventType);
        }
        nudge(enhancedElement);
        return /** @type {PAP} */ ({
            resolved: true
        });
    }

    /**
     * 
     * @param {Event} e 
     */
    async handleEvent(e){
        const {target} = e;
        const self = /** @type {BAP & BEAllProps} */ (/** @type {any} */ (this));
        const { invokeParamSets, enhancedElement } = self;
        const { find } = await import('trans-render/dss/find.js');
        for (const parsedStatement of invokeParamSets) {
            const {remoteSpecifier} = parsedStatement;
            let remoteTarget = this.#cache.get(remoteSpecifier)?.deref();
            if (remoteTarget === undefined) {
                const remoteTargetTest = await find(enhancedElement, remoteSpecifier);
                if (!remoteTargetTest)
                    throw 404;
                remoteTarget = remoteTargetTest;
                this.#cache.set(remoteSpecifier, new WeakRef(remoteTarget));
            }
            let {prop} = remoteSpecifier;
            const methodName = prop || enhancedElement.getAttribute('name');
            if(!methodName) throw 404;
            /** @type {any} */
            const clone = {};
            for(const key in e){
                clone[key] = e[key];
            }
            clone.target = target
            remoteTarget[methodName](remoteTarget, clone);
            //TODO support path, chained optional accessor
        }
    }


}
await DoInvoke.bootUp();
export { DoInvoke };
