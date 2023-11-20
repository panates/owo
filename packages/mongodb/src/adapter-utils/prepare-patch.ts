export default function preparePatch(
    doc: any,
    options?: {
      fieldPrefix?: string;
    }
): any {
  const trg = {};
  _preparePatch(doc, trg, '', options);
  return trg;
}

function _preparePatch(
    src: any,
    trg: any = {},
    path: string,
    options?: {
      fieldPrefix?: string;
    }
) {
  let f: string;
  let key: string;
  let field: string;
  const fieldPrefix = options?.fieldPrefix;
  for (const [k, v] of Object.entries(src)) {
    f = k.startsWith('*') ? k.substring(1) : k;
    key = path ? path + '.' + f : f;
    field = (fieldPrefix ? fieldPrefix : '') + key;

    if (v == null) {
      trg.$unset = trg.$unset || {};
      trg.$unset[field] = '';
      continue;
    }
    if (v && typeof v === 'object') {
      // If field name starts with "*", do "replace" operation except "merge"
      if (!k.startsWith('*')) {
        _preparePatch(v, trg, key);
        continue;
      }
    }
    trg.$set = trg.$set || {};
    trg.$set[field] = v;
  }
  return trg;
}
