import { describe, it, expect, beforeEach } from 'vitest';
import {
    acquireInputLock,
    releaseInputLock,
    resetInputLock,
    isInputLocked,
    pauseGameLogic,
    resumeGameLogic,
    isGameLogicPaused,
} from '../../scripts/game-events.js';

beforeEach(() => {
    resetInputLock();
    if (isGameLogicPaused()) resumeGameLogic();
});

describe('input lock', () => {
    it('isInputLocked is false by default', () => {
        expect(isInputLocked()).toBe(false);
    });

    it('acquireInputLock + releaseInputLock toggles state', () => {
        acquireInputLock();
        expect(isInputLocked()).toBe(true);
        releaseInputLock();
        expect(isInputLocked()).toBe(false);
    });

    it('nested acquireInputLock requires equal releases', () => {
        acquireInputLock();
        acquireInputLock();
        expect(isInputLocked()).toBe(true);
        releaseInputLock();
        expect(isInputLocked()).toBe(true);
        releaseInputLock();
        expect(isInputLocked()).toBe(false);
    });

    it('releaseInputLock from unlocked state is a no-op (depth never goes negative)', () => {
        releaseInputLock();
        releaseInputLock();
        expect(isInputLocked()).toBe(false);
        acquireInputLock();
        expect(isInputLocked()).toBe(true);
        releaseInputLock();
        expect(isInputLocked()).toBe(false);
    });

    it('resetInputLock zeros depth regardless of how many acquires were pending', () => {
        acquireInputLock();
        acquireInputLock();
        acquireInputLock();
        resetInputLock();
        expect(isInputLocked()).toBe(false);
    });
});

describe('pause / resume flag', () => {
    it('isGameLogicPaused is false by default', () => {
        expect(isGameLogicPaused()).toBe(false);
    });

    it('pauseGameLogic sets the flag, resumeGameLogic clears it', () => {
        pauseGameLogic();
        expect(isGameLogicPaused()).toBe(true);
        resumeGameLogic();
        expect(isGameLogicPaused()).toBe(false);
    });

    it('resumeGameLogic without a pending callback is a no-op', () => {
        pauseGameLogic();
        expect(() => resumeGameLogic()).not.toThrow();
        expect(isGameLogicPaused()).toBe(false);
    });
});
