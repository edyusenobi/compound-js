import { request } from './util';
import { version } from '../package.json';

let userPlatform;

try {
  if (typeof document !== 'undefined') {
    userPlatform = 'web';
  } else if (
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative'
  ) {
    userPlatform = 'react-native';
  } else if (
    typeof navigator !== 'undefined' && 
    navigator.userAgent.toLowerCase().indexOf('electron') > -1
  ) {
    userPlatform = 'electron-js';
  } else {
    userPlatform = 'node-js';
  }
} catch (e) {
  userPlatform = 'unknown';
}

/**
 * Makes a request to the AccountService API. The Account API retrieves
 *     information for various accounts which have interacted with the protocol.
 *     For more details, see the API documentation.
 *     https://compound.finance/docs/api#AccountService
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 */
export function account(options: object) {
  return queryApi(options, 'account', '/api/v2/account');
}

/**
 * Makes a request to the CTokenService API. The cToken API retrieves
 *     information about cToken contract interaction. Formore details, see the 
 *     API documentation. https://compound.finance/docs/api#CTokenService
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 */
export function cToken(options: object) {
  return queryApi(options, 'cToken', '/api/v2/ctoken');
}

/**
 * Makes a request to the MarketHistoryService API. The market history service 
 *     retrieves information about a market. For more details, see the API
 *     documentation. https://compound.finance/docs/api#MarketHistoryService
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 */
export function marketHistory(options: object) {
  return queryApi(options, 'Market History', '/api/v2/market_history/graph');
}

/**
 * Makes a request to the GovernanceService API. The Governance Service includes
 *     three endpoints to retrieve information about COMP accounts.
 *     https://compound.finance/docs/api#GovernanceService
 *
 * @param {object} options A JavaScript object of API request parameters.
 * @param {string} endpoint A string of the name of the corresponding governance
 *     service endpoint. Valid values are `proposals`, `voteReceipts`, or
 *     `accounts`.
 *
 * @returns {object} Returns the HTTP response body or error.
 */
export function governance(options: object, endpoint: string) {
  if (endpoint === 'proposals') {
    endpoint = '/api/v2/governance/proposals';
  } else if (endpoint === 'voteReceipts') {
    endpoint = '/api/v2/governance/proposal_vote_receipts';
  } else {
    endpoint = '/api/v2/governance/accounts';
  }

  return queryApi(options, 'GovernanceService', endpoint);
}

function queryApi(options: object, name: string, path: string) {
  return new Promise(async (resolve, reject) => {
    const errorPrefix = `Compound [api] [${name}] | `;
    let responseCode, responseMessage;

    try {
      const response = await request({
        hostname: 'https://api.compound.finance',
        path,
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          // 'compound-js': `[${version}]_[${userPlatform}]`,
        },
        body: options
      });

      responseCode = response.status;
      responseMessage = response.statusText;

      const responseBody = JSON.parse(response.body);

      if (responseCode >= 200 && responseCode <= 299) {
        resolve(responseBody);
      } else {
        throw 'Invalid request made to the Compound API.';
      }
    } catch(error) {
      let errorMessage = '';

      if (error.name === 'SyntaxError') {
        errorMessage = errorPrefix + `Unable to parse response body.`;
      } else {
        errorMessage = errorPrefix + error.toString();
      }

      reject({ error: errorMessage, responseCode, responseMessage });
    }
  });
}
