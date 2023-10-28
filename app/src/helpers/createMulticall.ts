type Params = {
  functionName: string;
  args?: any[];
};

export function createMulticall(contractParams: any, params: Params[]) {
  const multicall = [];
  for (const param of params) {
    multicall.push({
      ...contractParams,
      functionName: param.functionName,
      args: param.args,
    });
  }
  return multicall;
}
