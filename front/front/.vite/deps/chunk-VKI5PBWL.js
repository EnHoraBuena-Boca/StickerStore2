import {
  GlobalStyles_default,
  defaultTheme_default,
  extendSxProp,
  identifier_default,
  require_jsx_runtime,
  require_prop_types,
  unstable_memoTheme
} from "./chunk-G3SHCIFR.js";
import {
  __toESM
} from "./chunk-R4VOGKSS.js";

// node_modules/@mui/material/esm/GlobalStyles/GlobalStyles.js
var import_prop_types = __toESM(require_prop_types(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function GlobalStyles(props) {
  return (0, import_jsx_runtime.jsx)(GlobalStyles_default, {
    ...props,
    defaultTheme: defaultTheme_default,
    themeId: identifier_default
  });
}
true ? GlobalStyles.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The styles you want to apply globally.
   */
  styles: import_prop_types.default.oneOfType([import_prop_types.default.array, import_prop_types.default.func, import_prop_types.default.number, import_prop_types.default.object, import_prop_types.default.string, import_prop_types.default.bool])
} : void 0;

// node_modules/@mui/material/esm/zero-styled/index.js
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function internal_createExtendSxProp() {
  return extendSxProp;
}

// node_modules/@mui/material/esm/utils/memoTheme.js
var memoTheme = unstable_memoTheme;
var memoTheme_default = memoTheme;

export {
  internal_createExtendSxProp,
  memoTheme_default
};
//# sourceMappingURL=chunk-VKI5PBWL.js.map
