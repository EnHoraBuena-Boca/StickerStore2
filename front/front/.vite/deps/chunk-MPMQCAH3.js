import {
  useForkRef
} from "./chunk-447YS6Q2.js";
import {
  useEnhancedEffect_default
} from "./chunk-G3SHCIFR.js";
import {
  __toESM,
  require_react
} from "./chunk-R4VOGKSS.js";

// node_modules/@mui/material/esm/utils/useForkRef.js
var useForkRef_default = useForkRef;

// node_modules/@mui/utils/esm/useEventCallback/useEventCallback.js
var React = __toESM(require_react(), 1);
function useEventCallback(fn) {
  const ref = React.useRef(fn);
  useEnhancedEffect_default(() => {
    ref.current = fn;
  });
  return React.useRef((...args) => (
    // @ts-expect-error hide `this`
    (0, ref.current)(...args)
  )).current;
}
var useEventCallback_default = useEventCallback;

// node_modules/@mui/material/esm/utils/useEventCallback.js
var useEventCallback_default2 = useEventCallback_default;

export {
  useForkRef_default,
  useEventCallback_default,
  useEventCallback_default2
};
//# sourceMappingURL=chunk-MPMQCAH3.js.map
