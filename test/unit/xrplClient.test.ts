/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { toDrops, toXrp, isValidAddress, isXAddress, formatCurrencyCode } from '../../nodes/Xrpl/transport/xrplClient';

describe('XRPL Client Utilities', () => {
  describe('toDrops', () => {
    it('should convert XRP to drops', () => {
      expect(toDrops('1')).toBe('1000000');
      expect(toDrops('0.000001')).toBe('1');
      expect(toDrops('100')).toBe('100000000');
    });
  });

  describe('toXrp', () => {
    it('should convert drops to XRP', () => {
      expect(toXrp('1000000')).toBe('1');
      expect(toXrp('1')).toBe('0.000001');
      expect(toXrp('100000000')).toBe('100');
    });
  });

  describe('isValidAddress', () => {
    it('should validate classic addresses', () => {
      expect(isValidAddress('rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9')).toBe(true);
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('')).toBe(false);
    });
  });

  describe('isXAddress', () => {
    it('should validate X-addresses', () => {
      expect(isXAddress('X7gJ5YK8abHf2eTPWPFHAAot8Knck11QGqmQ7a6a3Z8PJvk')).toBe(true);
      expect(isXAddress('rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9')).toBe(false);
    });
  });

  describe('formatCurrencyCode', () => {
    it('should format 3-letter currency codes', () => {
      expect(formatCurrencyCode('USD')).toBe('USD');
      expect(formatCurrencyCode('EUR')).toBe('EUR');
    });

    it('should decode hex currency codes', () => {
      const hexCode = '5553440000000000000000000000000000000000';
      const result = formatCurrencyCode(hexCode);
      expect(result).toBe('USD');
    });
  });
});
