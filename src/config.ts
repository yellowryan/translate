type CommonOptions = {
  defaultTargetLang: 'string'
}

export async function resolveConfig<T extends CommonOptions>(
  options: T & { _?: (string | number)[] }
): Promise<T> {
  let defaultLanuage = options.defaultTargetLang;

  return options
}
