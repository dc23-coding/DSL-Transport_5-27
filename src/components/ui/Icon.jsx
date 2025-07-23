// src/components/ui/Icon.jsx
import * as React from 'react';
import { createElement } from 'react';
import defaultAttributes from 'lucide-react/dist/esm/defaultAttributes';
import { mergeClasses, hasA11yProp } from 'lucide-react/dist/esm/shared/utils';

const Icon = React.forwardRef(
  (
    {
      color = 'currentColor',
      size = 24,
      strokeWidth = 2,
      absoluteStrokeWidth,
      className = '',
      children,
      iconNode,
      ...rest
    },
    ref
  ) =>
    createElement(
      'svg',
      {
        ref,
        ...defaultAttributes,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth
          ? Number(strokeWidth) * 24 / Number(size)
          : strokeWidth,
        className: mergeClasses('lucide', className),
        ...(!children && !hasA11yProp(rest) && { 'aria-hidden': 'true' }),
        ...rest,
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
        ...(Array.isArray(children) ? children : [children]),
      ]
    )
);

Icon.displayName = 'Icon';

export { Icon as default };