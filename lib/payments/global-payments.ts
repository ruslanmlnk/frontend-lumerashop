import 'server-only';
import { createHash } from 'node:crypto';

type GlobalPaymentsSessionInput = {
    amount: number;
    currency: string;
    orderId: string;
    description?: string;
    responseUrl: string;
};

export type GlobalPaymentsHppSession = {
    actionUrl: string;
    orderId: string;
    fields: Record<string, string>;
};

export type ParsedGlobalPaymentsResponse = {
    responseCode: string;
    responseMessage: string;
    authorizedAmount: string;
    cvnResponseCode: string;
    avsResponseCode: string;
    transactionReference: {
        orderId: string;
        transactionId: string;
        authCode: string;
    };
};

const sha1 = (value: string) => createHash('sha1').update(value, 'utf8').digest('hex');

const generateHash = (toHash: string, secret: string) => {
    const firstPass = sha1(toHash);
    return sha1(`${firstPass}.${secret}`);
};

const utcTimestamp = () => {
    const date = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');

    return (
        String(date.getUTCFullYear()) +
        pad(date.getUTCMonth() + 1) +
        pad(date.getUTCDate()) +
        pad(date.getUTCHours()) +
        pad(date.getUTCMinutes()) +
        pad(date.getUTCSeconds())
    );
};

const toMinorUnits = (amount: number) => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    return String(Math.max(0, Math.round(safeAmount * 100)));
};

const getCredentials = () => {
    const merchantId = process.env.GP_MERCHANT_ID?.trim();
    const sharedSecret = process.env.GP_SHARED_SECRET?.trim();
    const accountId = process.env.GP_ACCOUNT_ID?.trim() || 'internet';
    const channel = process.env.GP_CHANNEL?.trim() || '';

    if (!merchantId || !sharedSecret) {
        throw new Error('Missing Global Payments credentials (GP_MERCHANT_ID, GP_SHARED_SECRET).');
    }

    return { merchantId, sharedSecret, accountId, channel };
};

const getHppActionUrl = () => {
    const configured = process.env.GP_HPP_URL?.trim();
    if (configured) {
        return configured;
    }

    const environment = process.env.GP_ENVIRONMENT?.trim().toUpperCase();
    return environment === 'PRODUCTION'
        ? 'https://pay.realexpayments.com/pay'
        : 'https://pay.sandbox.realexpayments.com/pay';
};

export const createGlobalPaymentsHppSession = ({
    amount,
    currency,
    orderId,
    description,
    responseUrl,
}: GlobalPaymentsSessionInput): GlobalPaymentsHppSession => {
    const { merchantId, sharedSecret, accountId, channel } = getCredentials();
    const timestamp = utcTimestamp();
    const amountMinor = toMinorUnits(amount);
    const normalizedCurrency = currency.trim().toUpperCase();
    const hashSource = [timestamp, merchantId, orderId, amountMinor, normalizedCurrency].join('.');
    const hash = generateHash(hashSource, sharedSecret);

    const fields: Record<string, string> = {
        MERCHANT_ID: merchantId,
        ACCOUNT: accountId,
        CHANNEL: channel,
        ORDER_ID: orderId,
        AMOUNT: amountMinor,
        CURRENCY: normalizedCurrency,
        TIMESTAMP: timestamp,
        AUTO_SETTLE_FLAG: '1',
        COMMENT1: description || `Order ${orderId}`,
        CUST_NUM: '',
        VAR_REF: orderId,
        HPP_LANG: process.env.GP_HPP_LANGUAGE?.trim() || 'EN',
        MERCHANT_RESPONSE_URL: responseUrl,
        CARD_PAYMENT_BUTTON: process.env.GP_HPP_BUTTON_TEXT?.trim() || 'Pay now',
        HPP_VERSION: '2',
        SHA1HASH: hash,
    };

    return {
        actionUrl: getHppActionUrl(),
        orderId,
        fields,
    };
};

const normalizeResponseFields = (input: Record<string, unknown>) => {
    const normalized: Record<string, string> = {};

    for (const [rawKey, rawValue] of Object.entries(input)) {
        normalized[rawKey.toUpperCase()] = rawValue == null ? '' : String(rawValue);
    }

    return normalized;
};

export const parseGlobalPaymentsResponse = (input: Record<string, unknown>): ParsedGlobalPaymentsResponse => {
    const { sharedSecret } = getCredentials();
    const response = normalizeResponseFields(input);

    const timestamp = response.TIMESTAMP || '';
    const merchantId = response.MERCHANT_ID || '';
    const orderId = response.ORDER_ID || '';
    const result = response.RESULT || '';
    const message = response.MESSAGE || '';
    const transactionId = response.PASREF || '';
    const authCode = response.AUTHCODE || '';
    const receivedHash = (response.SHA1HASH || '').toLowerCase();
    const expectedHash = generateHash(
        [timestamp, merchantId, orderId, result, message, transactionId, authCode].join('.'),
        sharedSecret,
    );

    if (!receivedHash || expectedHash !== receivedHash) {
        throw new Error('Invalid Global Payments response hash.');
    }

    return {
        responseCode: result,
        responseMessage: message,
        authorizedAmount: response.AMOUNT || '',
        cvnResponseCode: response.CVNRESULT || '',
        avsResponseCode: response.AVSPOSTCODERESULT || '',
        transactionReference: {
            orderId,
            transactionId,
            authCode,
        },
    };
};
