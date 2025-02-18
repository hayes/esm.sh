import { compare } from "compare-versions";
import uaParser from "ua-parser-js";

export const targets = new Set([
  "es2015",
  "es2016",
  "es2017",
  "es2018",
  "es2019",
  "es2020",
  "es2021",
  "es2022",
  "esnext",
  "deno",
  "denonext",
  "node",
]);

/** the js table transpiled from https://github.com/evanw/esbuild/blob/main/internal/compat/js_table.go */
const jsTable: Record<string, Record<string, [number, number, number]>> = {
  ArbitraryModuleNamespaceNames: {
    Chrome: [90, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [87, 0, 0],
    Node: [16, 0, 0],
  },
  ArraySpread: {
    Chrome: [46, 0, 0],
    Deno: [1, 0, 0],
    Edge: [13, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [36, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [10, 0, 0],
    Node: [5, 0, 0],
    Opera: [33, 0, 0],
    Safari: [10, 0, 0],
  },
  Arrow: {
    Chrome: [49, 0, 0],
    Deno: [1, 0, 0],
    Edge: [13, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [45, 0, 0],
    IOS: [10, 0, 0],
    Node: [6, 0, 0],
    Opera: [36, 0, 0],
    Safari: [10, 0, 0],
  },
  AsyncAwait: {
    Chrome: [55, 0, 0],
    Deno: [1, 0, 0],
    Edge: [15, 0, 0],
    ES: [2017, 0, 0],
    Firefox: [52, 0, 0],
    IOS: [11, 0, 0],
    Node: [7, 6, 0],
    Opera: [42, 0, 0],
    Safari: [11, 0, 0],
  },
  AsyncGenerator: {
    Chrome: [63, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2018, 0, 0],
    Firefox: [57, 0, 0],
    IOS: [12, 0, 0],
    Node: [10, 0, 0],
    Opera: [50, 0, 0],
    Safari: [12, 0, 0],
  },
  Bigint: {
    Chrome: [67, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2020, 0, 0],
    Firefox: [68, 0, 0],
    Hermes: [0, 12, 0],
    IOS: [14, 0, 0],
    Node: [10, 4, 0],
    Opera: [54, 0, 0],
    Rhino: [1, 7, 14],
    Safari: [14, 0, 0],
  },
  Class: {
    Chrome: [49, 0, 0],
    Deno: [1, 0, 0],
    Edge: [13, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [45, 0, 0],
    IOS: [10, 0, 0],
    Node: [6, 0, 0],
    Opera: [36, 0, 0],
    Safari: [10, 0, 0],
  },
  ClassField: {
    Chrome: [73, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [69, 0, 0],
    IOS: [14, 0, 0],
    Node: [12, 0, 0],
    Opera: [60, 0, 0],
    Safari: [14, 0, 0],
  },
  ClassPrivateAccessor: {
    Chrome: [84, 0, 0],
    Deno: [1, 0, 0],
    Edge: [84, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [90, 0, 0],
    IOS: [15, 0, 0],
    Node: [14, 6, 0],
    Opera: [70, 0, 0],
    Safari: [15, 0, 0],
  },
  ClassPrivateBrandCheck: {
    Chrome: [91, 0, 0],
    Deno: [1, 9, 0],
    Edge: [91, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [90, 0, 0],
    IOS: [15, 0, 0],
    Node: [16, 4, 0],
    Opera: [77, 0, 0],
    Safari: [15, 0, 0],
  },
  ClassPrivateField: {
    Chrome: [84, 0, 0],
    Deno: [1, 0, 0],
    Edge: [84, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [90, 0, 0],
    IOS: [15, 0, 0],
    Node: [14, 6, 0],
    Opera: [70, 0, 0],
    Safari: [14, 1, 0],
  },
  ClassPrivateMethod: {
    Chrome: [84, 0, 0],
    Deno: [1, 0, 0],
    Edge: [84, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [90, 0, 0],
    IOS: [15, 0, 0],
    Node: [14, 6, 0],
    Opera: [70, 0, 0],
    Safari: [15, 0, 0],
  },
  ClassPrivateStaticAccessor: {
    Chrome: [84, 0, 0],
    Deno: [1, 0, 0],
    Edge: [84, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [90, 0, 0],
    IOS: [15, 0, 0],
    Node: [14, 6, 0],
    Opera: [70, 0, 0],
    Safari: [15, 0, 0],
  },
  ClassPrivateStaticField: {
    Chrome: [74, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [90, 0, 0],
    IOS: [15, 0, 0],
    Node: [12, 0, 0],
    Opera: [62, 0, 0],
    Safari: [14, 1, 0],
  },
  ClassPrivateStaticMethod: {
    Chrome: [84, 0, 0],
    Deno: [1, 0, 0],
    Edge: [84, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [90, 0, 0],
    IOS: [15, 0, 0],
    Node: [14, 6, 0],
    Opera: [70, 0, 0],
    Safari: [15, 0, 0],
  },
  ClassStaticBlocks: {
    Chrome: [91, 0, 0],
    Edge: [94, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [93, 0, 0],
    Node: [16, 11, 0],
    Opera: [80, 0, 0],
  },
  ClassStaticField: {
    Chrome: [73, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [75, 0, 0],
    IOS: [15, 0, 0],
    Node: [12, 0, 0],
    Opera: [60, 0, 0],
    Safari: [14, 1, 0],
  },
  ConstAndLet: {
    Chrome: [49, 0, 0],
    Deno: [1, 0, 0],
    Edge: [14, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [51, 0, 0],
    IOS: [11, 0, 0],
    Node: [6, 0, 0],
    Opera: [36, 0, 0],
    Safari: [11, 0, 0],
  },
  Decorators: {},
  DefaultArgument: {
    Chrome: [49, 0, 0],
    Deno: [1, 0, 0],
    Edge: [14, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [53, 0, 0],
    IOS: [10, 0, 0],
    Node: [6, 0, 0],
    Opera: [36, 0, 0],
    Safari: [10, 0, 0],
  },
  Destructuring: {
    Chrome: [51, 0, 0],
    Deno: [1, 0, 0],
    Edge: [18, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [53, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [10, 0, 0],
    Node: [6, 5, 0],
    Opera: [38, 0, 0],
    Safari: [10, 0, 0],
  },
  DynamicImport: {
    Chrome: [63, 0, 0],
    Edge: [79, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [67, 0, 0],
    IOS: [11, 0, 0],
    Node: [13, 2, 0],
    Opera: [50, 0, 0],
    Safari: [11, 1, 0],
  },
  ExponentOperator: {
    Chrome: [52, 0, 0],
    Deno: [1, 0, 0],
    Edge: [14, 0, 0],
    ES: [2016, 0, 0],
    Firefox: [52, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [10, 3, 0],
    Node: [7, 0, 0],
    Opera: [39, 0, 0],
    Rhino: [1, 7, 14],
    Safari: [10, 1, 0],
  },
  ExportStarAs: {
    Chrome: [72, 0, 0],
    Edge: [79, 0, 0],
    ES: [2020, 0, 0],
    Firefox: [80, 0, 0],
    Node: [12, 0, 0],
    Opera: [60, 0, 0],
  },
  ForAwait: {
    Chrome: [63, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2018, 0, 0],
    Firefox: [57, 0, 0],
    IOS: [12, 0, 0],
    Node: [10, 0, 0],
    Opera: [50, 0, 0],
    Safari: [12, 0, 0],
  },
  ForOf: {
    Chrome: [51, 0, 0],
    Deno: [1, 0, 0],
    Edge: [15, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [53, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [10, 0, 0],
    Node: [6, 5, 0],
    Opera: [38, 0, 0],
    Safari: [10, 0, 0],
  },
  Generator: {
    Chrome: [50, 0, 0],
    Deno: [1, 0, 0],
    Edge: [13, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [53, 0, 0],
    IOS: [10, 0, 0],
    Node: [6, 0, 0],
    Opera: [37, 0, 0],
    Safari: [10, 0, 0],
  },
  Hashbang: {
    Chrome: [74, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    Firefox: [67, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [13, 4, 0],
    Node: [12, 5, 0],
    Opera: [62, 0, 0],
    Safari: [13, 1, 0],
  },
  ImportAssertions: {
    Chrome: [91, 0, 0],
    Node: [16, 14, 0],
  },
  ImportMeta: {
    Chrome: [64, 0, 0],
    Edge: [79, 0, 0],
    ES: [2020, 0, 0],
    Firefox: [62, 0, 0],
    IOS: [12, 0, 0],
    Node: [10, 4, 0],
    Opera: [51, 0, 0],
    Safari: [11, 1, 0],
  },
  InlineScript: {},
  LogicalAssignment: {
    Chrome: [85, 0, 0],
    Deno: [1, 2, 0],
    Edge: [85, 0, 0],
    ES: [2021, 0, 0],
    Firefox: [79, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [14, 0, 0],
    Node: [15, 0, 0],
    Opera: [71, 0, 0],
    Safari: [14, 0, 0],
  },
  NestedRestBinding: {
    Chrome: [49, 0, 0],
    Deno: [1, 0, 0],
    Edge: [14, 0, 0],
    ES: [2016, 0, 0],
    Firefox: [47, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [10, 3, 0],
    Node: [6, 0, 0],
    Opera: [36, 0, 0],
    Safari: [10, 1, 0],
  },
  NewTarget: {
    Chrome: [46, 0, 0],
    Deno: [1, 0, 0],
    Edge: [14, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [41, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [10, 0, 0],
    Node: [5, 0, 0],
    Opera: [33, 0, 0],
    Safari: [10, 0, 0],
  },
  NodeColonPrefixImport: {
    Node: [14, 13, 1],
  },
  NodeColonPrefixRequire: {
    Node: [16, 0, 0],
  },
  NullishCoalescing: {
    Chrome: [80, 0, 0],
    Deno: [1, 0, 0],
    Edge: [80, 0, 0],
    ES: [2020, 0, 0],
    Firefox: [72, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [13, 4, 0],
    Node: [14, 0, 0],
    Opera: [67, 0, 0],
    Safari: [13, 1, 0],
  },
  ObjectAccessors: {
    Chrome: [5, 0, 0],
    Deno: [1, 0, 0],
    Edge: [12, 0, 0],
    ES: [5, 0, 0],
    Firefox: [2, 0, 0],
    Hermes: [0, 7, 0],
    IE: [9, 0, 0],
    IOS: [6, 0, 0],
    Node: [0, 4, 0],
    Opera: [10, 10, 0],
    Rhino: [1, 7, 13],
    Safari: [3, 1, 0],
  },
  ObjectExtensions: {
    Chrome: [44, 0, 0],
    Deno: [1, 0, 0],
    Edge: [12, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [34, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [10, 0, 0],
    Node: [4, 0, 0],
    Opera: [31, 0, 0],
    Safari: [10, 0, 0],
  },
  ObjectRestSpread: {
    Chrome: [60, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2018, 0, 0],
    Firefox: [55, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [11, 3, 0],
    Node: [8, 3, 0],
    Opera: [47, 0, 0],
    Safari: [11, 1, 0],
  },
  OptionalCatchBinding: {
    Chrome: [66, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2019, 0, 0],
    Firefox: [58, 0, 0],
    Hermes: [0, 12, 0],
    IOS: [11, 3, 0],
    Node: [10, 0, 0],
    Opera: [53, 0, 0],
    Safari: [11, 1, 0],
  },
  OptionalChain: {
    Chrome: [91, 0, 0],
    Deno: [1, 9, 0],
    Edge: [91, 0, 0],
    ES: [2020, 0, 0],
    Firefox: [74, 0, 0],
    Hermes: [0, 12, 0],
    IOS: [13, 4, 0],
    Node: [16, 1, 0],
    Opera: [77, 0, 0],
    Safari: [13, 1, 0],
  },
  RegexpDotAllFlag: {
    Chrome: [62, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2018, 0, 0],
    Firefox: [78, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [11, 3, 0],
    Node: [8, 10, 0],
    Opera: [49, 0, 0],
    Safari: [11, 1, 0],
  },
  RegexpLookbehindAssertions: {
    Chrome: [62, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2018, 0, 0],
    Firefox: [78, 0, 0],
    Hermes: [0, 7, 0],
    Node: [8, 10, 0],
    Opera: [49, 0, 0],
  },
  RegexpMatchIndices: {
    Chrome: [90, 0, 0],
    Edge: [90, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [88, 0, 0],
    IOS: [15, 0, 0],
    Opera: [76, 0, 0],
    Safari: [15, 0, 0],
  },
  RegexpNamedCaptureGroups: {
    Chrome: [64, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2018, 0, 0],
    Firefox: [78, 0, 0],
    IOS: [11, 3, 0],
    Node: [10, 0, 0],
    Opera: [51, 0, 0],
    Safari: [11, 1, 0],
  },
  RegexpSetNotation: {},
  RegexpStickyAndUnicodeFlags: {
    Chrome: [50, 0, 0],
    Deno: [1, 0, 0],
    Edge: [13, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [46, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [12, 0, 0],
    Node: [6, 0, 0],
    Opera: [37, 0, 0],
    Safari: [12, 0, 0],
  },
  RegexpUnicodePropertyEscapes: {
    Chrome: [64, 0, 0],
    Deno: [1, 0, 0],
    Edge: [79, 0, 0],
    ES: [2018, 0, 0],
    Firefox: [78, 0, 0],
    IOS: [11, 3, 0],
    Node: [10, 0, 0],
    Opera: [51, 0, 0],
    Safari: [11, 1, 0],
  },
  RestArgument: {
    Chrome: [47, 0, 0],
    Deno: [1, 0, 0],
    Edge: [12, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [43, 0, 0],
    IOS: [10, 0, 0],
    Node: [6, 0, 0],
    Opera: [34, 0, 0],
    Safari: [10, 0, 0],
  },
  TemplateLiteral: {
    Chrome: [41, 0, 0],
    Deno: [1, 0, 0],
    Edge: [13, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [34, 0, 0],
    IOS: [9, 0, 0],
    Node: [10, 0, 0],
    Opera: [28, 0, 0],
    Safari: [9, 0, 0],
  },
  TopLevelAwait: {
    Chrome: [89, 0, 0],
    Edge: [89, 0, 0],
    ES: [2022, 0, 0],
    Firefox: [89, 0, 0],
    IOS: [15, 0, 0],
    Node: [14, 8, 0],
    Opera: [75, 0, 0],
    Safari: [15, 0, 0],
  },
  TypeofExoticObjectIsObject: {
    Chrome: [0, 0, 0],
    Edge: [0, 0, 0],
    ES: [2020, 0, 0],
    Firefox: [0, 0, 0],
    IOS: [0, 0, 0],
    Node: [0, 0, 0],
    Opera: [0, 0, 0],
    Safari: [0, 0, 0],
  },
  UnicodeEscapes: {
    Chrome: [44, 0, 0],
    Deno: [1, 0, 0],
    Edge: [12, 0, 0],
    ES: [2015, 0, 0],
    Firefox: [53, 0, 0],
    Hermes: [0, 7, 0],
    IOS: [9, 0, 0],
    Node: [4, 0, 0],
    Opera: [31, 0, 0],
    Safari: [9, 0, 0],
  },
};

const getUnsupportedFeatures = (name: string, version: string) => {
  const features = Object.keys(jsTable);
  const vs = version.split(".").slice(0, 3).map((v) => parseInt(v, 10));
  if (vs.findIndex((v) => isNaN(v)) !== -1) {
    return [];
  }
  if (vs.length === 1) {
    vs.push(0, 0);
  } else if (vs.length === 2) {
    vs.push(0);
  }
  return features.filter((feature) => {
    const v = jsTable[feature][name];
    if (!v) {
      return true;
    }
    return v[0] > vs[0] ||
      (v[0] === vs[0] && v[1] > vs[1]) ||
      (v[0] === vs[0] && v[1] === vs[1] && v[2] > vs[2]);
  });
};

const getBrowserInfo = (ua: string): { name?: string; version?: string } => {
  for (const d of ua.split(" ")) {
    if (d.startsWith("Chrome/")) {
      return { name: "Chrome", version: d.slice(7) };
    }
    if (d.startsWith("HeadlessChrome/")) {
      return { name: "Chrome", version: d.slice(15) };
    }
  }
  return uaParser(ua).browser;
};

const esmaUnsupportedFeatures: [string, number][] = [
  "es2022",
  "es2021",
  "es2020",
  "es2019",
  "es2018",
  "es2017",
  "es2016",
].map((esma) => [
  esma,
  getUnsupportedFeatures(esma.slice(0, 2).toUpperCase(), esma.slice(2)).length,
]);

const deno1_33_2 = "1.33.2";

/** get esma version from the `User-Agent` header by checking the `jsTable` object. */
export const getEsmaVersionFromUA = (userAgent: string | null) => {
  if (!userAgent || userAgent.startsWith("curl/")) {
    return "esnext";
  }
  if (userAgent.startsWith("Deno/")) {
    if (compare(userAgent.slice(5), deno1_33_2, "<")) {
      return "deno";
    }
    return "denonext";
  }
  if (userAgent.startsWith("Node/") || userAgent.startsWith("Bun/")) {
    return "node";
  }
  const browser = getBrowserInfo(userAgent);
  if (!browser.name || !browser.version) {
    return "esnext";
  }
  const unsupportFeatures = getUnsupportedFeatures(
    browser.name,
    browser.version,
  );
  for (const [esma, n] of esmaUnsupportedFeatures) {
    if (unsupportFeatures.length <= n) {
      return esma;
    }
  }
  return "es2015";
};

export function hasTargetSegment(path: string) {
  const parts = path.slice(1).split("/");
  return parts.length >= 2 && parts.some((p) => targets.has(p));
}
