/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { XRPL } from '../nodes/XRPL/XRPL.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('XRPL Node', () => {
  let node: XRPL;

  beforeAll(() => {
    node = new XRPL();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('XRPL');
      expect(node.description.name).toBe('xrpl');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 8 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(8);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(8);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Account Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        baseUrl: 'https://s.altnet.rippletest.net:51234'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn()
      },
    };
  });

  it('should get account info successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('accountInfo')
      .mockReturnValueOnce('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH')
      .mockReturnValueOnce('validated');

    const mockResponse = JSON.stringify({
      result: {
        account_data: {
          Account: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
          Balance: '1000000',
          Sequence: 1
        }
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.result.account_data.Account).toBe('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH');
  });

  it('should get account lines successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('accountLines')
      .mockReturnValueOnce('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH')
      .mockReturnValueOnce('validated')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(200);

    const mockResponse = JSON.stringify({
      result: {
        account: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        lines: []
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.result.account).toBe('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH');
  });

  it('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('accountInfo')
      .mockReturnValueOnce('invalid-account')
      .mockReturnValueOnce('validated');

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid account'));

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Invalid account');
  });

  it('should get account objects successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('accountObjects')
      .mockReturnValueOnce('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH')
      .mockReturnValueOnce('validated')
      .mockReturnValueOnce('offer')
      .mockReturnValueOnce(200);

    const mockResponse = JSON.stringify({
      result: {
        account: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        account_objects: []
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.result.account).toBe('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH');
  });

  it('should get account transactions successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('accountTx')
      .mockReturnValueOnce('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH')
      .mockReturnValueOnce(1000000)
      .mockReturnValueOnce(2000000)
      .mockReturnValueOnce(100);

    const mockResponse = JSON.stringify({
      result: {
        account: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        transactions: []
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.result.account).toBe('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH');
  });
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({ 
				apiKey: 'test-key', 
				baseUrl: 'https://s1.ripple.com:51234' 
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: { 
				httpRequest: jest.fn(), 
				requestWithAuthentication: jest.fn() 
			},
		};
	});

	describe('submit operation', () => {
		it('should submit a transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('submit')
				.mockReturnValueOnce('1200002280000000240000001E614000000000989680684000000000000064732103AB40A0490F9B7ED8DF29D246BF2D6269820A0EE7742ACDD457BEA7C7D0931EDB74473045022100D184EB4AE5956FF600E7536EE459345C7BBCF097A84CC61A93B9AF7197EDB98702201CEA8009B7BEEBAA2AACC0359B41C427C1C5B550A4CA4B80CF2174AF2D6D5DCE81143E9D4A2B8AA0780F682D136F7A56D6724EF53754');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				result: {
					engine_result: 'tesSUCCESS',
					engine_result_code: 0,
					engine_result_message: 'The transaction was applied.',
					tx_blob: '1200002280000000240000001E614000000000989680684000000000000064732103AB40A0490F9B7ED8DF29D246BF2D6269820A0EE7742ACDD457BEA7C7D0931EDB74473045022100D184EB4AE5956FF600E7536EE459345C7BBCF097A84CC61A93B9AF7197EDB98702201CEA8009B7BEEBAA2AACC0359B41C427C1C5B550A4CA4B80CF2174AF2D6D5DCE81143E9D4A2B8AA0780F682D136F7A56D6724EF53754',
					tx_json: {
						TransactionType: 'Payment',
						Flags: 2147483648,
						Sequence: 30,
						Amount: '10000000',
						Fee: '100',
						Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
						Destination: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
					}
				}
			});

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://s1.ripple.com:51234',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					method: 'submit',
					params: [{ tx_blob: '1200002280000000240000001E614000000000989680684000000000000064732103AB40A0490F9B7ED8DF29D246BF2D6269820A0EE7742ACDD457BEA7C7D0931EDB74473045022100D184EB4AE5956FF600E7536EE459345C7BBCF097A84CC61A93B9AF7197EDB98702201CEA8009B7BEEBAA2AACC0359B41C427C1C5B550A4CA4B80CF2174AF2D6D5DCE81143E9D4A2B8AA0780F682D136F7A56D6724EF53754' }],
					jsonrpc: '2.0',
					id: 1
				}),
				json: true
			});
			expect(result).toHaveLength(1);
			expect(result[0].json.result.engine_result).toBe('tesSUCCESS');
		});

		it('should handle submit transaction error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('submit')
				.mockReturnValueOnce('invalid_blob');
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid transaction blob'));

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toHaveLength(1);
			expect(result[0].json.error).toBe('Invalid transaction blob');
		});
	});

	describe('getTransaction operation', () => {
		it('should get transaction details successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransaction')
				.mockReturnValueOnce('E3FE6EA3D48F0C2B639448020EA4F03D4F4F8FFDB243A852A0F59177921B4879')
				.mockReturnValueOnce(false);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				result: {
					Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
					Amount: '10000000',
					Destination: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
					TransactionType: 'Payment',
					hash: 'E3FE6EA3D48F0C2B639448020EA4F03D4F4F8FFDB243A852A0F59177921B4879'
				}
			});

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toHaveLength(1);
			expect(result[0].json.result.hash).toBe('E3FE6EA3D48F0C2B639448020EA4F03D4F4F8FFDB243A852A0F59177921B4879');
		});
	});

	describe('sign operation', () => {
		it('should sign transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sign')
				.mockReturnValueOnce({
					TransactionType: 'Payment',
					Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
					Destination: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
					Amount: '10000000'
				})
				.mockReturnValueOnce('s████████████████████████████');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				result: {
					tx_blob: '1200002280000000240000001E614000000000989680684000000000000064732103AB40A0490F9B7ED8DF29D246BF2D6269820A0EE7742ACDD457BEA7C7D0931EDB',
					tx_json: {
						TransactionType: 'Payment',
						Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
						Destination: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
						Amount: '10000000',
						TxnSignature: '3045022100D184EB4AE5956FF600E7536EE459345C7BBCF097A84CC61A93B9AF7197EDB98702201CEA8009B7BEEBAA2AACC0359B41C427C1C5B550A4CA4B80CF2174AF2D6D5DCE'
					}
				}
			});

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toHaveLength(1);
			expect(result[0].json.result.tx_json.TxnSignature).toBeDefined();
		});
	});
});

describe('Payment Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				baseUrl: 'https://s1.ripple.com:51234',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('findPath operation', () => {
		it('should find payment paths successfully', async () => {
			const mockResponse = JSON.stringify({
				result: {
					alternatives: [
						{
							paths_canonical: [],
							source_amount: '1000000',
						},
					],
				},
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('findPath')
				.mockReturnValueOnce('rSourceAccount')
				.mockReturnValueOnce('rDestAccount')
				.mockReturnValueOnce({ currency: 'XRP', value: '1000000' });

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executePaymentOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toHaveLength(1);
			expect(result[0].json.result).toBeDefined();
		});

		it('should handle findPath errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('findPath')
				.mockReturnValueOnce('rSourceAccount')
				.mockReturnValueOnce('rDestAccount')
				.mockReturnValueOnce({ currency: 'XRP', value: '1000000' });

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValueOnce(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValueOnce(true);

			const result = await executePaymentOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.error).toBe('API Error');
		});
	});

	describe('findPathWithSource operation', () => {
		it('should find payment paths with source currencies successfully', async () => {
			const mockResponse = JSON.stringify({
				result: {
					alternatives: [
						{
							source_amount: { currency: 'USD', value: '100' },
						},
					],
				},
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('findPathWithSource')
				.mockReturnValueOnce('rSourceAccount')
				.mockReturnValueOnce('rDestAccount')
				.mockReturnValueOnce({ currency: 'XRP', value: '1000000' })
				.mockReturnValueOnce([{ currency: 'USD' }]);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executePaymentOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toHaveLength(1);
			expect(result[0].json.result).toBeDefined();
		});

		it('should handle findPathWithSource errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('findPathWithSource')
				.mockReturnValueOnce('rSourceAccount')
				.mockReturnValueOnce('rDestAccount')
				.mockReturnValueOnce({ currency: 'XRP', value: '1000000' })
				.mockReturnValueOnce([{ currency: 'USD' }]);

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValueOnce(new Error('Path not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValueOnce(true);

			const result = await executePaymentOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.error).toBe('Path not found');
		});
	});

	describe('verifyChannel operation', () => {
		it('should verify payment channel successfully', async () => {
			const mockResponse = JSON.stringify({
				result: {
					signature_verified: true,
				},
			});

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('verifyChannel')
				.mockReturnValueOnce('channel123')
				.mockReturnValueOnce('signature456')
				.mockReturnValueOnce('publickey789')
				.mockReturnValueOnce('1000000');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executePaymentOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toHaveLength(1);
			expect(result[0].json.result.signature_verified).toBe(true);
		});

		it('should handle verifyChannel errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('verifyChannel')
				.mockReturnValueOnce('channel123')
				.mockReturnValueOnce('signature456')
				.mockReturnValueOnce('publickey789')
				.mockReturnValueOnce('1000000');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValueOnce(new Error('Invalid signature'));
			mockExecuteFunctions.continueOnFail.mockReturnValueOnce(true);

			const result = await executePaymentOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.error).toBe('Invalid signature');
		});
	});
});

describe('Ledger Resource', () => {
  let mockExecuteFunctions: any;
  
  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://s1.ripple.com:51234' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get ledger information successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getLedger')
      .mockReturnValueOnce('validated')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    
    const mockResponse = JSON.stringify({
      result: {
        ledger_index: 123456,
        ledger_hash: 'test-hash',
        transactions: []
      }
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    
    const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('ledger_index', 123456);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://s1.ripple.com:51234',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('should get closed ledger successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getClosedLedger');
    
    const mockResponse = JSON.stringify({
      result: {
        ledger_index: 123455,
        ledger_hash: 'closed-hash'
      }
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    
    const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('ledger_index', 123455);
  });

  it('should get current ledger successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getCurrentLedger');
    
    const mockResponse = JSON.stringify({
      result: {
        ledger_current_index: 123457
      }
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    
    const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('ledger_current_index', 123457);
  });

  it('should get ledger data successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getLedgerData')
      .mockReturnValueOnce('validated')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(200);
    
    const mockResponse = JSON.stringify({
      result: {
        state: [],
        ledger_index: 123456
      }
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    
    const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('state');
  });

  it('should get ledger entry successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getLedgerEntry')
      .mockReturnValueOnce('validated')
      .mockReturnValueOnce('test-index-hash');
    
    const mockResponse = JSON.stringify({
      result: {
        index: 'test-index-hash',
        node: { test: 'data' }
      }
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    
    const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('index', 'test-index-hash');
  });

  it('should handle errors gracefully when continue on fail is enabled', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getLedger');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    
    const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('error', 'API Error');
  });

  it('should throw error when operation is unknown', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');
    
    await expect(
      executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('OrderBook Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://s1.ripple.com:51234',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  describe('getOffers operation', () => {
    it('should get order book offers successfully', async () => {
      const mockResponse = JSON.stringify({
        result: {
          offers: [
            {
              Account: 'rAccount1',
              BookDirectory: 'directory1',
              BookNode: '0',
              TakerGets: '1000000',
              TakerPays: { currency: 'USD', value: '1', issuer: 'rIssuer' },
            },
          ],
          ledger_hash: 'hash123',
          ledger_index: 123456,
        },
      });

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getOffers')
        .mockReturnValueOnce('XRP')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('USD')
        .mockReturnValueOnce('rIssuer')
        .mockReturnValueOnce('current')
        .mockReturnValueOnce(20);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrderBookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.offers).toBeDefined();
    });

    it('should handle getOffers error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getOffers');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeOrderBookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('checkDepositAuth operation', () => {
    it('should check deposit authorization successfully', async () => {
      const mockResponse = JSON.stringify({
        result: {
          deposit_authorized: true,
          destination_account: 'rDestination',
          ledger_hash: 'hash123',
          ledger_index: 123456,
          source_account: 'rSource',
        },
      });

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('checkDepositAuth')
        .mockReturnValueOnce('rSource')
        .mockReturnValueOnce('rDestination')
        .mockReturnValueOnce('current');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrderBookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.deposit_authorized).toBe(true);
    });

    it('should handle checkDepositAuth error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('checkDepositAuth');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid account'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(false);

      await expect(
        executeOrderBookOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('Invalid account');
    });
  });
});

describe('Nft Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				serverUrl: 'https://s1.ripple.com:51234',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getAccountNfts operation', () => {
		it('should get account NFTs successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccountNfts')
				.mockReturnValueOnce('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH')
				.mockReturnValueOnce('validated')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('');

			const mockResponse = {
				result: {
					account: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
					account_nfts: [],
					ledger_index: 123456,
				},
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNftOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});

		it('should handle errors in getAccountNfts', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccountNfts')
				.mockReturnValueOnce('invalid-account');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid account'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeNftOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toHaveLength(1);
			expect(result[0].json.error).toBe('Invalid account');
		});
	});

	describe('getNftInfo operation', () => {
		it('should get NFT info successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getNftInfo')
				.mockReturnValueOnce('000B013A95F14B0044F78A264E41713C64B5F89242540EE2BC8B858E00000D65');

			const mockResponse = {
				result: {
					nft_id: '000B013A95F14B0044F78A264E41713C64B5F89242540EE2BC8B858E00000D65',
					ledger_index: 123456,
					owner: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
				},
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNftOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getNftSellOffers operation', () => {
		it('should get NFT sell offers successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getNftSellOffers')
				.mockReturnValueOnce('000B013A95F14B0044F78A264E41713C64B5F89242540EE2BC8B858E00000D65')
				.mockReturnValueOnce('validated');

			const mockResponse = {
				result: {
					nft_id: '000B013A95F14B0044F78A264E41713C64B5F89242540EE2BC8B858E00000D65',
					offers: [],
				},
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNftOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getNftBuyOffers operation', () => {
		it('should get NFT buy offers successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getNftBuyOffers')
				.mockReturnValueOnce('000B013A95F14B0044F78A264E41713C64B5F89242540EE2BC8B858E00000D65')
				.mockReturnValueOnce('validated');

			const mockResponse = {
				result: {
					nft_id: '000B013A95F14B0044F78A264E41713C64B5F89242540EE2BC8B858E00000D65',
					offers: [],
				},
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNftOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});
});

describe('Server Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				baseUrl: 'https://s1.ripple.com:51234',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('serverInfo operation', () => {
		it('should get server information successfully', async () => {
			const mockResponse = {
				result: {
					info: {
						build_version: '1.8.2',
						complete_ledgers: '32570-73737839',
						hostid: 'ARTS',
						server_state: 'full',
					},
				},
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('serverInfo')
				.mockReturnValueOnce({});
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeServerOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse.result);
		});

		it('should handle server info API errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('serverInfo')
				.mockReturnValueOnce({});
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

			const items = [{ json: {} }];

			await expect(executeServerOperations.call(mockExecuteFunctions, items))
				.rejects.toThrow('Network error');
		});
	});

	describe('serverState operation', () => {
		it('should get server state successfully', async () => {
			const mockResponse = {
				result: {
					state: {
						build_version: '1.8.2',
						complete_ledgers: '32570-73737839',
						server_state: 'full',
					},
				},
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('serverState')
				.mockReturnValueOnce({});
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeServerOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse.result);
		});
	});

	describe('ping operation', () => {
		it('should ping server successfully', async () => {
			const mockResponse = {
				result: {},
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('ping')
				.mockReturnValueOnce({});
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeServerOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse.result);
		});
	});

	describe('random operation', () => {
		it('should get random number successfully', async () => {
			const mockResponse = {
				result: {
					random: '8ED765AEBBD6767603C2C9375B2679AEC76E6A8133EF59F04F9FC1AAA70E41AF',
				},
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('random')
				.mockReturnValueOnce({});
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeServerOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse.result);
		});
	});

	describe('fee operation', () => {
		it('should get fee information successfully', async () => {
			const mockResponse = {
				result: {
					current_ledger_size: '14',
					current_queue_size: '0',
					drops: {
						base_fee: '10',
						median_fee: '11000',
						minimum_fee: '10',
						open_ledger_fee: '10',
						reserve_base: '20000000',
						reserve_inc: '5000000',
					},
				},
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('fee')
				.mockReturnValueOnce({});
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeServerOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse.result);
		});
	});

	it('should handle JSON-RPC errors', async () => {
		const mockErrorResponse = {
			error: {
				code: -1,
				message: 'Internal error',
			},
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('serverInfo')
			.mockReturnValueOnce({});
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

		const items = [{ json: {} }];

		await expect(executeServerOperations.call(mockExecuteFunctions, items))
			.rejects.toThrow('XRPL API Error: Internal error');
	});

	it('should continue on fail when enabled', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('serverInfo')
			.mockReturnValueOnce({});
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const items = [{ json: {} }];
		const result = await executeServerOperations.call(mockExecuteFunctions, items);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('API Error');
	});
});

describe('Amm Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://s1.ripple.com:51234',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  it('should get AMM info successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAmmInfo')
      .mockReturnValueOnce('XRP')
      .mockReturnValueOnce('USD')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('');

    const mockResponse = {
      result: {
        amm: {
          account: 'rAMMACCOUNT123',
          amount: '1000000',
          amount2: { currency: 'USD', issuer: 'rISSUER123', value: '1000' },
          trading_fee: 600,
        },
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeAmmOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://s1.ripple.com:51234',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        method: 'amm_info',
        params: [{ asset: 'XRP', asset2: 'USD' }],
        jsonrpc: '2.0',
        id: 1,
      },
      json: true,
    });
  });

  it('should get aggregate price successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAggregatePrice')
      .mockReturnValueOnce('validated')
      .mockReturnValueOnce('XRP')
      .mockReturnValueOnce('USD');

    const mockResponse = {
      result: {
        base_asset: 'XRP',
        quote_asset: 'USD',
        price: '0.5',
        entire_set: {
          mean: '0.5',
          size: 10,
          standard_deviation: '0.01',
        },
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeAmmOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAmmInfo')
      .mockReturnValueOnce('INVALID')
      .mockReturnValueOnce('INVALID');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
      new Error('Invalid asset'),
    );
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeAmmOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Invalid asset');
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

    const items = [{ json: {} }];
    await expect(
      executeAmmOperations.call(mockExecuteFunctions, items),
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});
});
