export type PayloadSelect = {
  [key: string]: PayloadSelect | boolean;
};

export const appendPayloadSelectParams = (
  params: URLSearchParams,
  prefix: string,
  select: PayloadSelect | boolean | undefined,
): void => {
  if (typeof select === 'boolean') {
    params.set(prefix, String(select));
    return;
  }

  if (!select || typeof select !== 'object') {
    return;
  }

  for (const [key, value] of Object.entries(select)) {
    appendPayloadSelectParams(params, `${prefix}[${key}]`, value);
  }
};
